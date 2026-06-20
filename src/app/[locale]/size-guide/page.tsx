import { getTranslations } from 'next-intl/server';
import { Container, Section } from '@/components/ui';
import { SIZE_CHART } from '@/lib/sizing';

export default async function SizeGuidePage() {
  const t = await getTranslations('sizeGuide');
  return (
    <Section>
      <Container className="max-w-2xl">
        <h1 className="text-4xl mb-2">{t('title')}</h1>
        <p className="text-muted mb-8">{t('subtitle')}</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border border-charcoal/10 rounded-lg overflow-hidden">
            <thead className="bg-sand/40 text-left">
              <tr>
                <th className="p-3">{t('size')}</th>
                <th className="p-3">{t('bust')} (cm)</th>
                <th className="p-3">{t('waist')} (cm)</th>
                <th className="p-3">{t('hips')} (cm)</th>
                <th className="p-3">{t('length')} (cm)</th>
              </tr>
            </thead>
            <tbody>
              {SIZE_CHART.map((r) => (
                <tr key={r.size} className="border-t border-charcoal/10">
                  <td className="p-3 font-medium">{r.size}</td>
                  <td className="p-3">{r.bust}</td>
                  <td className="p-3">{r.waist}</td>
                  <td className="p-3">{r.hips}</td>
                  <td className="p-3">{r.length}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Container>
    </Section>
  );
}
