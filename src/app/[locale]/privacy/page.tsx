import { PRIVACY_VERSION } from '@/lib/constants';
import { getTranslations } from 'next-intl/server';
import { Container, Section } from '@/components/ui';


export default async function PrivacyPage() {
  const t = await getTranslations('privacy');
  return (
    <Section>
      <Container className="max-w-2xl prose-sm">
        <h1 className="text-4xl mb-6">{t('title')}</h1>
        <p className="text-muted leading-relaxed mb-4">
          We collect only what we need to tailor and deliver your order: your contact details,
          shipping address, and the measurements you provide. Measurements and addresses are
          encrypted at rest.
        </p>
        <p className="text-muted leading-relaxed mb-4">
          We never store card details on our servers. Payments, when enabled, are handled by a
          PCI-compliant provider via hosted, tokenized checkout.
        </p>
        <p className="text-muted leading-relaxed mb-4">
          You can export or permanently delete your account and associated data at any time from
          your account page. Policy version: {PRIVACY_VERSION}.
        </p>
      </Container>
    </Section>
  );
}
