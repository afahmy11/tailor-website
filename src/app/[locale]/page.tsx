import { getTranslations } from 'next-intl/server';
import { prisma } from '@/lib/prisma';
import { Container, Section, ButtonLink } from '@/components/ui';
import { Link } from '@/i18n/navigation';
import { formatMoney } from '@/lib/format';

export default async function HomePage({ params }: { params: { locale: string } }) {
  const { locale } = params;
  const t = await getTranslations('home');
  const styles = await prisma.style.findMany({ where: { active: true }, take: 4 });

  return (
    <>
      <Section className="bg-sand/40">
        <Container className="grid md:grid-cols-2 gap-12 items-center">
          <div className="fade-in">
            <h1 className="text-5xl md:text-6xl leading-tight mb-6">{t('heroTitle')}</h1>
            <p className="text-lg text-muted mb-8 max-w-md">{t('heroSubtitle')}</p>
            <div className="flex gap-4 flex-wrap">
              <ButtonLink href="/customize">{t('cta')}</ButtonLink>
              <ButtonLink href="/collections" variant="outline">{t('browse')}</ButtonLink>
            </div>
          </div>
          <div className="aspect-[3/4] rounded-2xl bg-gradient-to-b from-rose/20 to-charcoal/10 flex items-center justify-center">
            <span className="font-display text-3xl text-charcoal/40">Atelier Abaya</span>
          </div>
        </Container>
      </Section>

      <Section>
        <Container>
          <h2 className="text-3xl mb-12 text-center">{t('howTitle')}</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[1, 2, 3].map((n) => (
              <div key={n} className="text-center">
                <div className="w-12 h-12 rounded-full bg-rose/20 text-rose flex items-center justify-center mx-auto mb-4 font-display text-xl">
                  {n}
                </div>
                <h3 className="text-xl mb-2">{t(`step${n}Title`)}</h3>
                <p className="text-muted">{t(`step${n}Body`)}</p>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      <Section className="bg-sand/30">
        <Container>
          <h2 className="text-3xl mb-12 text-center">{t('featured')}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {styles.map((s) => (
              <Link key={s.id} href={`/collections#${s.slug}`} className="group">
                <div className="aspect-[3/4] rounded-xl bg-ivory border border-charcoal/10 mb-3 overflow-hidden flex items-center justify-center">
                  <span className="font-display text-charcoal/30">{locale === 'ar' ? s.nameAr : s.nameEn}</span>
                </div>
                <p className="text-sm">{locale === 'ar' ? s.nameAr : s.nameEn}</p>
                <p className="text-sm text-muted">{t('featured')} · {formatMoney(s.basePrice, undefined, locale)}</p>
              </Link>
            ))}
          </div>
        </Container>
      </Section>

      <Section>
        <Container className="grid md:grid-cols-3 gap-8 text-center">
          {['trust1', 'trust2', 'trust3'].map((k) => (
            <div key={k}>
              <p className="font-display text-xl text-rose mb-1">✦</p>
              <p>{t(k)}</p>
            </div>
          ))}
        </Container>
      </Section>
    </>
  );
}

export const dynamic = 'force-dynamic';
