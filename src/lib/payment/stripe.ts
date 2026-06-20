import type { PaymentGateway } from './types';

// Stub: card data NEVER touches this server — use Stripe's hosted Checkout.
// To enable: `npm i stripe`, set STRIPE_SECRET_KEY + STRIPE_WEBHOOK_SECRET,
// set PAYMENT_PROVIDER=stripe, then implement the two methods below.
export const stripeGateway: PaymentGateway = {
  name: 'stripe',
  async createCheckout() {
    throw new Error('Stripe not configured. Add the SDK + keys, then implement createCheckout.');
  },
  async verifyWebhook() {
    // Must verify the signature with STRIPE_WEBHOOK_SECRET before trusting the event.
    throw new Error('Stripe not configured.');
  },
};
