'use client';

import { usePathname, useRouter } from '@/i18n/navigation';
import { useParams } from 'next/navigation';

export function LocaleSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const current = (params.locale as string) ?? 'en';
  const next = current === 'en' ? 'ar' : 'en';

  return (
    <button
      type="button"
      onClick={() => router.replace(pathname, { locale: next })}
      className="text-sm underline underline-offset-4 hover:text-rose"
      aria-label="Switch language"
    >
      {next === 'ar' ? 'العربية' : 'English'}
    </button>
  );
}
