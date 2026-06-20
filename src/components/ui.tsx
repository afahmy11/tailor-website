import { Link } from '@/i18n/navigation';
import type { ComponentProps, ReactNode } from 'react';

export function Container({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`max-w-content mx-auto px-6 ${className}`}>{children}</div>;
}

export function Section({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <section className={`py-16 md:py-24 ${className}`}>{children}</section>;
}

type BtnProps = { variant?: 'solid' | 'outline'; className?: string; children: ReactNode };

const base =
  'inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-medium tracking-wide transition-colors disabled:opacity-50';
const styles = {
  solid: 'bg-charcoal text-ivory hover:bg-rose',
  outline: 'border border-charcoal/30 text-charcoal hover:border-charcoal',
};

export function ButtonLink({ href, variant = 'solid', className = '', children }: BtnProps & { href: string }) {
  return (
    <Link href={href} className={`${base} ${styles[variant]} ${className}`}>
      {children}
    </Link>
  );
}

export function Button({
  variant = 'solid',
  className = '',
  children,
  ...props
}: BtnProps & ComponentProps<'button'>) {
  return (
    <button className={`${base} ${styles[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}
