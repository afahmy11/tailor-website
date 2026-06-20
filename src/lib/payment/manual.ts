import type { PaymentGateway } from './types';

// No external gateway. Order is placed as AWAITING_PAYMENT and settled manually.
export const manualGateway: PaymentGateway = {
  name: 'manual',
  async createCheckout() {
    return { redirectUrl: null, paymentRef: null };
  },
  async verifyWebhook() {
    return null;
  },
};
