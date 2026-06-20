'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

export function ContactForm() {
  const t = useTranslations('contact');
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [done, setDone] = useState(false);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setErr('');
    const res = await fetch('/api/contact', {
      method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(form),
    });
    setLoading(false);
    if (res.ok) setDone(true);
    else setErr((await res.json()).error ?? 'Error');
  }

  if (done) return <p className="text-sage">{t('sent')}</p>;

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <input required placeholder={t('name')} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full rounded-lg border border-charcoal/20 px-3 py-2 bg-ivory" />
      <input required type="email" placeholder={t('email')} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full rounded-lg border border-charcoal/20 px-3 py-2 bg-ivory" />
      <textarea required rows={4} placeholder={t('message')} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="w-full rounded-lg border border-charcoal/20 px-3 py-2 bg-ivory" />
      {err && <p className="text-sm text-red-500">{err}</p>}
      <button disabled={loading} className="rounded-full bg-charcoal text-ivory px-6 py-3 text-sm disabled:opacity-50">{t('send')}</button>
    </form>
  );
}
