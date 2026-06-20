'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

const STATUSES = ['AWAITING_PAYMENT', 'RECEIVED', 'IN_TAILORING', 'SHIPPED', 'CANCELLED'] as const;

export function StatusUpdateForm({ orderId, current }: { orderId: string; current: string }) {
  const t = useTranslations('admin');
  const ts = useTranslations('status');
  const router = useRouter();
  const [status, setStatus] = useState(current);
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    await fetch('/api/admin/order-status', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ orderId, status }),
    });
    setSaving(false);
    router.refresh();
  }

  return (
    <div className="flex items-center gap-2">
      <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-lg border border-charcoal/20 px-2 py-1 text-sm bg-ivory">
        {STATUSES.map((s) => <option key={s} value={s}>{ts(s)}</option>)}
      </select>
      <button onClick={save} disabled={saving || status === current} className="rounded-full bg-charcoal text-ivory px-4 py-1 text-sm disabled:opacity-40">{t('update')}</button>
    </div>
  );
}
