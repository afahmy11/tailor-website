import type { PaymentGateway } from './types';
import { manualGateway } from './manual';
import { stripeGateway } from './stripe';

export function getGateway(): PaymentGateway {
  switch ((process.env.PAYMENT_PROVIDER ?? 'manual').toLowerCase()) {
    case 'stripe':
      return stripeGateway;
    case 'manual':
    default:
      return manualGateway;
  }
}

export type { PaymentGateway } from './types';
