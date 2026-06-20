import { getTranslations } from 'next-intl/server';
import { Container, Section } from '@/components/ui';
import { LoginForm } from '@/components/LoginForm';

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ sent?: string }> }) {
  const { sent } = await searchParams;
  const t = await getTranslations('auth');
  return (
    <Section>
      <Container className="max-w-md text-center">
        <h1 className="text-3xl mb-8">{t('login')}</h1>
        <LoginForm sent={sent === '1'} />
      </Container>
    </Section>
  );
}
