import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CheckoutService } from '../services/checkout.service';
import { CheckoutStatus, PaymentStatus } from '@flashforge/shared-types';

vi.mock('@flashforge/shared-rabbitmq', () => ({
  publishEvent: vi.fn().mockResolvedValue(true),
}));

vi.mock('../repositories/checkout.repository', () => {
  return {
    CheckoutRepository: vi.fn().mockImplementation(() => ({
      createSession: vi.fn(),
      getSession: vi.fn(),
      updateSession: vi.fn(),
    })),
  };
});

describe('CheckoutService', () => {
  let checkoutService: CheckoutService;
  let mockRepo: any;

  beforeEach(() => {
    vi.clearAllMocks();
    checkoutService = new CheckoutService();
    mockRepo = (checkoutService as any).repo;
  });

  describe('createSession', () => {
    it('should calculate total amount correctly and create a session with INITIATED status', async () => {
      const cart = [
        { productId: 'prod-1', quantity: 2, price: 1000 },
        { productId: 'prod-2', quantity: 1, price: 2500 },
      ];
      const expectedTotal = 4500;

      mockRepo.createSession.mockResolvedValue({
        id: 'session-123',
        userId: 'user-1',
        totalAmount: expectedTotal,
        status: CheckoutStatus.INITIATED,
        cart,
      });

      const session = await checkoutService.createSession('user-1', cart);

      expect(mockRepo.createSession).toHaveBeenCalledWith({
        userId: 'user-1',
        cart,
        totalAmount: expectedTotal,
        status: CheckoutStatus.INITIATED,
      });
      expect(session.id).toBe('session-123');
      expect(session.totalAmount).toBe(expectedTotal);
    });
  });

  describe('confirmCheckout', () => {
    it('should throw an error if session is not found', async () => {
      mockRepo.getSession.mockResolvedValue(null);

      await expect(checkoutService.confirmCheckout('non-existent')).rejects.toThrow('Session not found');
    });

    it('should throw an error if session status is not INITIATED or PAYMENT_FAILED', async () => {
      mockRepo.getSession.mockResolvedValue({
        id: 'session-1',
        status: CheckoutStatus.COMPLETED,
        cart: [],
      });

      await expect(checkoutService.confirmCheckout('session-1')).rejects.toThrow('Checkout session in invalid state');
    });
  });
});
