import { getTranslations } from 'next-intl/server';
import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { decryptJSON } from '@/lib/crypto';
import { Container, Section } from '@/components/ui';
import { StatusUpdateForm } from '@/components/StatusUpdateForm';
import { formatMoney } from '@/lib/format';

function safe<T>(fn: () => T): T | null { try { return fn(); } catch { return null; } }

export default async function AdminPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const admin = await requireAdmin();
  if (!admin) redirect(`/${locale}/login`);

  const t = await getTranslations('admin');
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    include: { user: true, style: true, fabric: true, color: true },
  });

  return (
    <Section>
      <Container>
        <h1 className="text-4xl mb-10">{t('title')}</h1>
        <div className="space-y-6">
          {orders.map((o) => {
            const m = safe(() => decryptJSON<Record<string, unknown>>(o.measurements));
            const ship = safe(() => decryptJSON<Record<string, string>>(o.shipping));
            return (
              <div key={o.id} className="border border-charcoal/10 rounded-2xl p-5">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                  <div>
                    <p className="font-medium">{o.reference}</p>
                    <p className="text-sm text-muted">{o.user.email} · {formatMoney(o.amount, o.currency, locale)}</p>
                  </div>
                  <StatusUpdateForm orderId={o.id} current={o.status} />
                </div>
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-muted mb-1">{t('style')}</p>
                    <p>{locale === 'ar' ? o.style.nameAr : o.style.nameEn} · {locale === 'ar' ? o.fabric.nameAr : o.fabric.nameEn}</p>
                    <p className="text-muted">{o.sleeve} / {o.closure}</p>
                    {o.notes && <p className="mt-1 italic">“{o.notes}”</p>}
                  </div>
                  <div>
                    <p className="text-muted mb-1">{t('measurements')}</p>
                    <pre className="whitespace-pre-wrap font-sans text-xs">{m ? JSON.stringify(m, null, 1) : '—'}</pre>
                  </div>
                  <div>
                    <p className="text-muted mb-1">Shipping</p>
                    {ship ? (
                      <p>{ship.fullName}<br />{ship.phone}<br />{ship.line1} {ship.line2}<br />{ship.city}, {ship.country}</p>
                    ) : '—'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Container>
    </Section>
  );
}

export const dynamic = 'force-dynamic';
