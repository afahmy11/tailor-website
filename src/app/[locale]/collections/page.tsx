import { getTranslations } from 'next-intl/server';
import { prisma } from '@/lib/prisma';
import { Container, Section, ButtonLink } from '@/components/ui';
import { formatMoney } from '@/lib/format';

export default async function CollectionsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations('collections');
  const styles = await prisma.style.findMany({
    where: { active: true },
    include: { fabrics: { include: { fabric: { include: { colors: true } } } } },
  });

  return (
    <Section>
      <Container>
        <h1 className="text-4xl mb-2">{t('title')}</h1>
        <p className="text-muted mb-12 max-w-xl">{t('subtitle')}</p>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {styles.map((s) => (
            <article key={s.id} id={s.slug} className="border border-charcoal/10 rounded-2xl overflow-hidden bg-ivory">
              <div className="aspect-[4/5] bg-sand/40 flex items-center justify-center">
                <span className="font-display text-2xl text-charcoal/30">{locale === 'ar' ? s.nameAr : s.nameEn}</span>
              </div>
              <div className="p-5">
                <h2 className="text-xl mb-1">{locale === 'ar' ? s.nameAr : s.nameEn}</h2>
                <p className="text-sm text-muted mb-3">{locale === 'ar' ? s.descAr : s.descEn}</p>
                <div className="flex items-center gap-2 mb-4">
                  {s.fabrics
                    .flatMap((sf) =>
                      sf.fabric.colors.slice(0, 4).map((c) => (
                        <span key={c.id} className="w-5 h-5 rounded-full border border-charcoal/15" style={{ backgroundColor: c.hex }} title={locale === 'ar' ? c.nameAr : c.nameEn} />
                      )),
                    )
                    .slice(0, 6)}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted">{t('from')} {formatMoney(s.basePrice, undefined, locale)}</span>
                  <ButtonLink href={`/customize?style=${s.slug}`} className="!px-4 !py-2 text-xs">{t('customize')}</ButtonLink>
                </div>
              </div>
            </article>
          ))}
        </div>
      </Container>
    </Section>
  );
}

export const dynamic = 'force-dynamic';
