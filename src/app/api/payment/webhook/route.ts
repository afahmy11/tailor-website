import { NextResponse, type NextRequest } from 'next/server';
import { getGateway } from '@/lib/payment';
import { prisma } from '@/lib/prisma';
import { sendStatusEmail } from '@/lib/mail';
import { audit } from '@/lib/audit';

// The webhook — not the client redirect — is the source of truth for "paid".
export async function POST(req: NextRequest) {
  const raw = await req.text();
  const signature = req.headers.get('stripe-signature') ?? req.headers.get('x-signature');
  const gateway = getGateway();

  let result;
  try {
    result = await gateway.verifyWebhook(raw, signature);
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }
  if (!result) return NextResponse.json({ ok: true }); // manual gateway / nothing to do

  if (result.paid) {
    const order = await prisma.order.update({
      where: { reference: result.reference },
      data: { status: 'RECEIVED', paidAt: new Date(), paymentRef: result.paymentRef ?? undefined,
              events: { create: { status: 'RECEIVED', note: 'Payment confirmed' } } },
      include: { user: true },
    }).catch(() => null);
    if (order?.user.email) await sendStatusEmail(order.user.email, order.reference, 'RECEIVED').catch(() => {});
    if (order) await audit({ action: 'PAYMENT_CONFIRMED', target: order.reference });
  }
  return NextResponse.json({ ok: true });
}
