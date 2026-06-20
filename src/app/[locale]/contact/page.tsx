import { getTranslations } from 'next-intl/server';
import { Container, Section } from '@/components/ui';
import { ContactForm } from '@/components/ContactForm';

export default async function ContactPage() {
  const t = await getTranslations('contact');
  const wa = process.env.WHATSAPP_NUMBER ?? '';
  return (
    <Section>
      <Container className="max-w-xl">
        <h1 className="text-4xl mb-2">{t('title')}</h1>
        <p className="text-muted mb-8">{t('subtitle')}</p>
        <ContactForm />
        {wa && (
          <a href={`https://wa.me/${wa}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 mt-6 text-sm underline">
            {t('whatsapp')}
          </a>
        )}
      </Container>
    </Section>
  );
}
