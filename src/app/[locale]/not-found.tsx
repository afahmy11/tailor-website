import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

export default function NotFound() {
  const t = useTranslations('nav');
  return (
    <div className="max-w-content mx-auto px-6 py-32 text-center">
      <h1 className="text-5xl mb-4">404</h1>
      <p className="text-muted mb-8">This page could not be found.</p>
      <Link href="/" className="underline">{t('home')}</Link>
    </div>
  );
}
