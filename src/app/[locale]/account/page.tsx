import { getTranslations } from 'next-intl/server';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Container, Section } from '@/components/ui';
import { AccountActions } from '@/components/AccountActions';
import { formatMoney } from '@/lib/format';

export default async function AccountPage({ params }: { params: { locale: string } }) {
  const { locale } = params;
  const session = await auth();
  if (!session?.user) redirect(`/${locale}/login`);

  const t = await getTranslations('account');
  const ts = await getTranslations('status');

  const [orders, profiles] = await Promise.all([
    prisma.order.findMany({ where: { userId: session!.user.id }, orderBy: { createdAt: 'desc' }, include: { style: true } }),
    prisma.measurementProfile.findMany({ where: { userId: session!.user.id }, orderBy: { createdAt: 'desc' } }),
  ]);

  return (
    <Section>
      <Container className="max-w-3xl">
        <h1 className="text-4xl mb-2">{t('title')}</h1>
        <p className="text-muted mb-10">{session!.user.email}</p>

        <h2 className="text-xl mb-4">{t('orders')}</h2>
        {orders.length === 0 ? (
          <p className="text-muted">{t('noOrders')}</p>
        ) : (
          <div className="space-y-3">
            {orders.map((o) => (
              <div key={o.id} className="flex items-center justify-between border border-charcoal/10 rounded-xl p-4">
                <div>
                  <p className="font-medium">{o.reference}</p>
                  <p className="text-sm text-muted">{locale === 'ar' ? o.style.nameAr : o.style.nameEn}</p>
                </div>
                <div className="text-end">
                  <p className="text-sm">{ts(o.status)}</p>
                  <p className="text-sm text-muted">{formatMoney(o.amount, o.currency, locale)}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        <h2 className="text-xl mt-10 mb-4">{t('profiles')}</h2>
        {profiles.length === 0 ? (
          <p className="text-muted">—</p>
        ) : (
          <ul className="flex flex-wrap gap-2">
            {profiles.map((p) => (
              <li key={p.id} className="rounded-full bg-sand/50 px-4 py-1 text-sm">{p.name}</li>
            ))}
          </ul>
        )}

        <AccountActions />
      </Container>
    </Section>
  );
}

export const dynamic = 'force-dynamic';
