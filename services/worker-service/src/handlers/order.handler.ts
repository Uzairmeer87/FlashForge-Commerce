import { createLogger } from '@flashforge/shared-logger';

const logger = createLogger('worker-service:order');

export interface OrderCreatedPayload {
  orderId?: string;
  sessionId: string;
  userId: string;
  totalAmount: number;
  items: Array<{ productId: string; quantity: number; price: number }>;
  createdAt?: string;
}

export async function handleOrderCreation(payload: OrderCreatedPayload) {
  const { orderId, sessionId, userId, totalAmount, items } = payload;
  logger.info(
    { orderId, sessionId, userId, totalAmount, itemCount: items?.length ?? 0 },
    'Processing order.created event — order record confirmed'
  );

  // Future expansion point: Trigger email/SMS notification, telemetry tracking, or external analytics
}

