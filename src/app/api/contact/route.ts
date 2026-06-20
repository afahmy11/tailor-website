import { NextResponse, type NextRequest } from 'next/server';
import { contactSchema } from '@/lib/validation/order';
import { rateLimit, clientIp } from '@/lib/rate-limit';
import { sendMail } from '@/lib/mail';
import { audit } from '@/lib/audit';

export async function POST(req: NextRequest) {
  const ip = clientIp(req.headers);
  if (!rateLimit(`contact:${ip}`, 5, 60_000)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }
  const parsed = contactSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 });

  const { name, email, message } = parsed.data;
  // Strip CR/LF to prevent email header injection via user-controlled name.
  const safeName = name.replace(/[\r\n]+/g, ' ').slice(0, 120);
  await sendMail(
    process.env.EMAIL_FROM ?? 'no-reply@atelier-abaya.local',
    `Contact from ${safeName}`,
    `<p><strong>${safeName}</strong> (${email})</p><p>${message.replace(/</g, '&lt;')}</p>`,
  ).catch(() => {});
  await audit({ action: 'CONTACT_SUBMIT', ip });
  return NextResponse.json({ ok: true });
}
