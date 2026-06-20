import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { sendStatusEmail } from '@/lib/mail';
import { audit } from '@/lib/audit';
import { clientIp } from '@/lib/rate-limit';

const schema = z.object({
  orderId: z.string().min(1),
  status: z.enum(['AWAITING_PAYMENT', 'RECEIVED', 'IN_TAILORING', 'SHIPPED', 'CANCELLED']),
});

export async function POST(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 });

  const { orderId, status } = parsed.data;
  const order = await prisma.order.update({
    where: { id: orderId },
    data: { status, events: { create: { status, note: `Set by ${admin.email}` } } },
    include: { user: true },
  });

  if (order.user.email) await sendStatusEmail(order.user.email, order.reference, status).catch(() => {});
  await audit({ actor: admin.id, action: 'ORDER_STATUS_UPDATE', target: order.reference, ip: clientIp(req.headers), meta: { status } });
  return NextResponse.json({ ok: true });
}
