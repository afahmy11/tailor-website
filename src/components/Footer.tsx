import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { Container } from './ui';

export async function Footer() {
  const t = await getTranslations();
  return (
    <footer className="border-t border-charcoal/10 mt-auto">
      <Container className="py-10 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted">
        <p>© {new Date().getFullYear()} {t('brand.name')}. {t('footer.rights')}</p>
        <div className="flex gap-6">
          <Link href="/privacy" className="hover:text-rose">{t('footer.privacy')}</Link>
          <Link href="/contact" className="hover:text-rose">{t('nav.contact')}</Link>
        </div>
      </Container>
    </footer>
  );
}
