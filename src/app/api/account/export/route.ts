import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { decryptJSON } from '@/lib/crypto';
import { audit } from '@/lib/audit';

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const [user, orders, profiles] = await Promise.all([
    prisma.user.findUnique({ where: { id: session.user.id }, select: { id: true, name: true, email: true, createdAt: true } }),
    prisma.order.findMany({ where: { userId: session.user.id } }),
    prisma.measurementProfile.findMany({ where: { userId: session.user.id } }),
  ]);

  const data = {
    exportedAt: new Date().toISOString(),
    user,
    orders: orders.map((o) => ({
      reference: o.reference, status: o.status, amount: o.amount, currency: o.currency, createdAt: o.createdAt,
      style: o.styleId, fabric: o.fabricId, notes: o.notes,
      measurements: safe(() => decryptJSON(o.measurements)),
      shipping: safe(() => decryptJSON(o.shipping)),
    })),
    measurementProfiles: profiles.map((p) => ({ name: p.name, data: safe(() => decryptJSON(p.data)) })),
  };

  await audit({ actor: session.user.id, action: 'DATA_EXPORT' });
  return new NextResponse(JSON.stringify(data, null, 2), {
    headers: {
      'content-type': 'application/json',
      'content-disposition': 'attachment; filename="my-data.json"',
    },
  });
}

function safe<T>(fn: () => T): T | null {
  try { return fn(); } catch { return null; }
}
