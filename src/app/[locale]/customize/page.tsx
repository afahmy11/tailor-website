import { getTranslations } from 'next-intl/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { Container, Section } from '@/components/ui';
import { MeasurementWizard, type WizardStyle } from '@/components/MeasurementWizard';

export default async function CustomizePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ style?: string }>;
}) {
  const { locale } = await params;
  const { style: initialStyle } = await searchParams;
  const t = await getTranslations('wizard');
  const session = await auth();

  const dbStyles = await prisma.style.findMany({
    where: { active: true },
    include: { fabrics: { include: { fabric: { include: { colors: true } } } } },
  });

  const styles: WizardStyle[] = dbStyles.map((s) => ({
    slug: s.slug,
    type: s.type,
    nameEn: s.nameEn,
    nameAr: s.nameAr,
    descEn: s.descEn,
    descAr: s.descAr,
    basePrice: s.basePrice,
    image: s.image,
    fields: (s.fields as string[]) ?? [],
    fabrics: s.fabrics.map((sf) => ({
      slug: sf.fabric.slug,
      nameEn: sf.fabric.nameEn,
      nameAr: sf.fabric.nameAr,
      priceAdd: sf.fabric.priceAdd,
      swatch: sf.fabric.swatch,
      leadDays: sf.fabric.leadDays,
      inStock: sf.fabric.inStock,
      colors: sf.fabric.colors.map((c) => ({ id: c.id, nameEn: c.nameEn, nameAr: c.nameAr, hex: c.hex })),
    })),
  }));

  return (
    <Section>
      <Container className="max-w-4xl">
        <h1 className="text-4xl mb-10 text-center">{t('title')}</h1>
        <MeasurementWizard
          styles={styles}
          locale={locale}
          currency={process.env.CURRENCY ?? 'AED'}
          initialStyle={initialStyle}
          isAuthed={!!session?.user}
          loginHref={`/${locale}/login`}
          whatsapp={process.env.WHATSAPP_NUMBER ?? ''}
        />
      </Container>
    </Section>
  );
}

export const dynamic = 'force-dynamic';
