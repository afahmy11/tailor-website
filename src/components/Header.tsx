import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { Container } from './ui';
import { LocaleSwitcher } from './LocaleSwitcher';
import { auth } from '@/lib/auth';

export async function Header({ locale }: { locale: string }) {
  const t = await getTranslations('nav');
  const session = await auth();

  const links = [
    { href: '/collections', label: t('collections') },
    { href: '/customize', label: t('customize') },
    { href: '/size-guide', label: t('sizeGuide') },
    { href: '/about', label: t('about') },
    { href: '/contact', label: t('contact') },
  ];

  return (
    <header className="border-b border-charcoal/10 bg-ivory/90 backdrop-blur sticky top-0 z-40">
      <Container className="flex items-center justify-between h-16 gap-6">
        <Link href="/" className="text-2xl font-display tracking-wide">
          Atelier&nbsp;Abaya
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm" aria-label="Primary">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="hover:text-rose transition-colors">
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-4">
          <LocaleSwitcher />
          {session?.user ? (
            <Link href="/account" className="text-sm hover:text-rose">{t('account')}</Link>
          ) : (
            <Link href="/login" className="text-sm hover:text-rose">{t('login')}</Link>
          )}
          {session?.user?.role === 'ADMIN' && (
            <Link href="/admin" className="text-sm text-rose">{t('admin')}</Link>
          )}
        </div>
      </Container>
    </header>
  );
}
