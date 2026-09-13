import { createLogger } from '@flashforge/shared-logger';
import axios from 'axios';
import { getEnv } from '@flashforge/shared-config';
import { publishEvent } from '@flashforge/shared-rabbitmq';

const logger = createLogger('worker-service:payment');
const orderServiceUrl = getEnv('ORDER_SERVICE_URL', 'http://localhost:4005/api/orders');
const inventoryServiceUrl = getEnv('INVENTORY_SERVICE_URL', 'http://localhost:4002/api/inventory');

interface PaymentSuccessPayload {
  sessionId: string;
  userId: string;
  reservationIds: string[];
  cart: { productId: string; quantity: number; price: number }[];
  totalAmount: number;
}

export async function handlePaymentSuccess(payload: PaymentSuccessPayload) {
  const { sessionId, userId, reservationIds, cart, totalAmount } = payload;

  logger.info({ sessionId, userId }, 'Handling payment.success event');

  let orderData: any = null;

  try {
    const idempotencyKey = `order-${sessionId}`;
    const response = await axios.post(
      `${orderServiceUrl}`,
      {
        sessionId,
        userId,
        totalAmount,
        items: cart.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
        })),
      },
      {
        headers: { 'x-idempotency-key': idempotencyKey },
      }
    );
    orderData = response.data?.data;
    logger.info({ sessionId, orderId: orderData?.id }, 'Order created successfully');

    try {
      await publishEvent('order.created', {
        orderId: orderData?.id,
        sessionId,
        userId,
        totalAmount,
        items: cart,
        createdAt: new Date().toISOString(),
      });
      logger.info({ sessionId, orderId: orderData?.id }, 'Published order.created event');
    } catch (pubErr) {
      logger.error({ err: pubErr, sessionId }, 'Failed to publish order.created event');
    }
  } catch (err: any) {
    if (err?.response?.status === 409) {
      logger.warn({ sessionId }, 'Order already exists for session — skipping creation');
    } else {
      logger.error({ err, sessionId }, 'Failed to create order after payment success');
      throw err;
    }
  }


  const commitFailures: string[] = [];
  for (const reservationId of reservationIds) {
    try {
      await axios.post(`${inventoryServiceUrl}/reservations/${reservationId}/commit`);
      logger.info({ reservationId }, 'Inventory reservation committed');
    } catch (err) {
      logger.error({ err, reservationId }, 'Failed to commit inventory reservation');
      commitFailures.push(reservationId);
    }
  }

  if (commitFailures.length > 0) {
    logger.warn({ commitFailures, sessionId }, 'Some reservations could not be committed');
  }

  logger.info({ sessionId }, 'payment.success event handled successfully');
}

interface PaymentFailurePayload {
  sessionId: string;
  reservationIds: string[];
}

export async function handlePaymentFailure(payload: PaymentFailurePayload) {
  const { sessionId, reservationIds } = payload;
  logger.warn({ sessionId, reservationIds }, 'Handling payment.failed event — starting inventory release saga');

  if (!reservationIds || reservationIds.length === 0) {
    logger.info({ sessionId }, 'No reservation IDs to release for failed payment');
    return;
  }

  const releaseFailures: string[] = [];
  for (const reservationId of reservationIds) {
    try {
      await axios.post(`${inventoryServiceUrl}/reservations/${reservationId}/release`);
      logger.info({ reservationId, sessionId }, 'Inventory reservation released successfully');
    } catch (err) {
      logger.error({ err, reservationId, sessionId }, 'Failed to release inventory reservation');
      releaseFailures.push(reservationId);
    }
  }

  if (releaseFailures.length > 0) {
    logger.error({ releaseFailures, sessionId }, 'Some inventory reservations could not be released');
    throw new Error(`Failed to release reservations: ${releaseFailures.join(', ')}`);
  }

  logger.info({ sessionId }, 'payment.failed saga compensation completed successfully');
}

