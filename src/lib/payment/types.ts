export interface CheckoutInput {
  reference: string;
  amount: number; // minor units
  currency: string;
  customerEmail: string;
}

export interface CheckoutResult {
  // Hosted/tokenized checkout URL to redirect to, or null for manual flow.
  redirectUrl: string | null;
  paymentRef: string | null;
}

export interface WebhookResult {
  paid: boolean;
  reference: string;
  paymentRef?: string;
}

export interface PaymentGateway {
  readonly name: string;
  createCheckout(input: CheckoutInput): Promise<CheckoutResult>;
  // Verify signature server-side; the webhook is the source of truth for "paid".
  verifyWebhook(rawBody: string, signature: string | null): Promise<WebhookResult | null>;
}
