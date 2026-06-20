import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { orderSchema } from '@/lib/validation/order';
import { measurementSchemaFor } from '@/lib/validation/measurement';
import { encryptJSON } from '@/lib/crypto';
import { getGateway } from '@/lib/payment';
import { rateLimit, clientIp } from '@/lib/rate-limit';
import { audit } from '@/lib/audit';
import { sendStatusEmail } from '@/lib/mail';

function reference() {
  return 'AB-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).slice(2, 6).toUpperCase();
}

export async function POST(req: NextRequest) {
  const ip = clientIp(req.headers);
  if (!rateLimit(`order:${ip}`, 8, 60_000)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Sign in required' }, { status: 401 });

  const parsed = orderSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 });
  }
  const input = parsed.data;

  // Validate catalog references server-side; never trust client price.
  const style = await prisma.style.findFirst({
    where: { slug: input.styleSlug, active: true },
    include: { fabrics: { include: { fabric: true } } },
  });
  if (!style) return NextResponse.json({ error: 'Unknown style' }, { status: 400 });

  const link = style.fabrics.find((sf) => sf.fabric.slug === input.fabricSlug);
  if (!link || !link.fabric.inStock) return NextResponse.json({ error: 'Fabric unavailable' }, { status: 400 });
  const fabric = link.fabric;

  if (input.colorId) {
    const color = await prisma.colorOption.findFirst({ where: { id: input.colorId, fabricId: fabric.id } });
    if (!color) return NextResponse.json({ error: 'Invalid colour' }, { status: 400 });
  }

  // Re-validate measurements against THIS style's required fields, server-side.
  let measurementPayload: unknown;
  if (input.useStandardSize) {
    if (!input.standardSize) return NextResponse.json({ error: 'Size required' }, { status: 400 });
    measurementPayload = { standardSize: input.standardSize };
  } else {
    const m = measurementSchemaFor(style.fields as string[]).safeParse(input.measurements);
    if (!m.success) return NextResponse.json({ error: 'Invalid measurements', details: m.error.flatten() }, { status: 400 });
    measurementPayload = m.data;
  }

  const amount = style.basePrice + fabric.priceAdd;
  const currency = process.env.CURRENCY ?? 'AED';
  const ref = reference();

  const gateway = getGateway();
  const checkout = await gateway.createCheckout({
    reference: ref, amount, currency, customerEmail: session.user.email ?? '',
  }).catch(() => ({ redirectUrl: null, paymentRef: null }));

  const order = await prisma.order.create({
    data: {
      reference: ref,
      userId: session.user.id,
      status: 'AWAITING_PAYMENT',
      styleId: style.id,
      fabricId: fabric.id,
      colorId: input.colorId ?? null,
      sleeve: input.sleeve, closure: input.closure, notes: input.notes,
      measurements: encryptJSON(measurementPayload),
      shipping: encryptJSON(input.shipping),
      currency, amount,
      paymentProvider: gateway.name,
      paymentRef: checkout.paymentRef,
      events: { create: { status: 'AWAITING_PAYMENT', note: 'Order created' } },
    },
  });

  if (!input.useStandardSize && input.saveProfileName && input.measurements) {
    await prisma.measurementProfile.create({
      data: { userId: session.user.id, name: input.saveProfileName, data: encryptJSON(input.measurements) },
    }).catch(() => {});
  }

  await audit({ actor: session.user.id, action: 'ORDER_CREATE', target: order.reference, ip });
  if (session.user.email) await sendStatusEmail(session.user.email, ref, 'AWAITING_PAYMENT').catch(() => {});

  return NextResponse.json({ reference: ref, redirectUrl: checkout.redirectUrl });
}
