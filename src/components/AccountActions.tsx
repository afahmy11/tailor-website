'use client';

import { useTranslations } from 'next-intl';
import { signOut } from 'next-auth/react';

export function AccountActions() {
  const t = useTranslations('account');
  const tn = useTranslations('nav');

  async function onDelete() {
    if (!confirm(t('deleteConfirm'))) return;
    const res = await fetch('/api/account/delete', { method: 'POST' });
    if (res.ok) await signOut({ callbackUrl: '/' });
  }

  return (
    <div className="flex flex-wrap gap-3 pt-4">
      <a href="/api/account/export" className="rounded-full border border-charcoal/20 px-5 py-2 text-sm">{t('export')}</a>
      <button onClick={onDelete} className="rounded-full border border-red-300 text-red-600 px-5 py-2 text-sm">{t('delete')}</button>
      <button onClick={() => signOut({ callbackUrl: '/' })} className="rounded-full border border-charcoal/20 px-5 py-2 text-sm">{tn('logout')}</button>
    </div>
  );
}
