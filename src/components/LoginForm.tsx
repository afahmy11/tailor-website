'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { signIn } from 'next-auth/react';

export function LoginForm({ sent }: { sent: boolean }) {
  const t = useTranslations('auth');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    // Uniform behaviour regardless of whether the email exists (no enumeration).
    await signIn('nodemailer', { email, redirect: true, callbackUrl: '/account' }).catch(() => {});
    setLoading(false);
  }

  if (sent) {
    return <p className="text-center text-muted">{t('checkEmail')}</p>;
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 max-w-sm mx-auto">
      <label className="block text-sm">{t('emailLabel')}</label>
      <input
        type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
        className="w-full rounded-lg border border-charcoal/20 px-3 py-2 bg-ivory"
      />
      <button disabled={loading} className="w-full rounded-full bg-charcoal text-ivory py-3 text-sm disabled:opacity-50">
        {t('sendLink')}
      </button>
    </form>
  );
}
