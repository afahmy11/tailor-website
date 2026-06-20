'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { FIELD_RANGES } from '@/lib/validation/measurement';
import { recommendSize, toCm, toInch, CM_PER_INCH } from '@/lib/sizing';
import { MeasurementFigure } from './MeasurementFigure';

type Color = { id: string; nameEn: string; nameAr: string; hex: string };
type Fabric = { slug: string; nameEn: string; nameAr: string; priceAdd: number; swatch: string; leadDays: number; inStock: boolean; colors: Color[] };
export type WizardStyle = { slug: string; type: string; nameEn: string; nameAr: string; descEn: string; descAr: string; basePrice: number; image: string; fields: string[]; fabrics: Fabric[] };

const SLEEVES = ['standard', 'wide', 'fitted'] as const;
const CLOSURES = ['none', 'snap', 'zip', 'tie'] as const;
const STD = ['S', 'M', 'L', 'XL', 'XXL'] as const;

export function MeasurementWizard({
  styles,
  locale,
  currency,
  initialStyle,
  isAuthed,
  loginHref,
  whatsapp,
}: {
  styles: WizardStyle[];
  locale: string;
  currency: string;
  initialStyle?: string;
  isAuthed: boolean;
  loginHref: string;
  whatsapp: string;
}) {
  const t = useTranslations('wizard');
  const tm = useTranslations('measure');
  const tp = useTranslations('privacy');
  const ar = locale === 'ar';
  const name = (o: { nameEn: string; nameAr: string }) => (ar ? o.nameAr : o.nameEn);
  const money = (minor: number) => new Intl.NumberFormat(ar ? 'ar' : 'en', { style: 'currency', currency, maximumFractionDigits: 0 }).format(minor / 100);

  const [step, setStep] = useState(1);
  const [styleSlug, setStyleSlug] = useState(initialStyle ?? styles[0]?.slug ?? '');
  const style = useMemo(() => styles.find((s) => s.slug === styleSlug)!, [styles, styleSlug]);
  const [fabricSlug, setFabricSlug] = useState(style?.fabrics[0]?.slug ?? '');
  const fabric = useMemo(() => style?.fabrics.find((f) => f.slug === fabricSlug) ?? style?.fabrics[0], [style, fabricSlug]);
  const [colorId, setColorId] = useState(fabric?.colors[0]?.id ?? '');
  const [sleeve, setSleeve] = useState<(typeof SLEEVES)[number]>('standard');
  const [closure, setClosure] = useState<(typeof CLOSURES)[number]>('none');

  const [unit, setUnit] = useState<'cm' | 'inch'>('cm');
  const [values, setValues] = useState<Record<string, string>>({});
  const [activeField, setActiveField] = useState(style?.fields[0] ?? 'bust');
  const [useStandard, setUseStandard] = useState(false);
  const [standardSize, setStandardSize] = useState<(typeof STD)[number]>('M');
  const [profileName, setProfileName] = useState('');

  const [shipping, setShipping] = useState({ fullName: '', phone: '', line1: '', line2: '', city: '', country: '' });
  const [notes, setNotes] = useState('');
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ reference: string } | null>(null);
  const [error, setError] = useState('');

  // keep fabric/color valid when style changes
  useEffect(() => {
    if (!style) return;
    if (!style.fabrics.find((f) => f.slug === fabricSlug)) setFabricSlug(style.fabrics[0]?.slug ?? '');
    if (!style.fields.includes(activeField)) setActiveField(style.fields[0] ?? 'bust');
  }, [styleSlug]); // eslint-disable-line
  useEffect(() => {
    if (fabric && !fabric.colors.find((c) => c.id === colorId)) setColorId(fabric.colors[0]?.id ?? '');
  }, [fabricSlug]); // eslint-disable-line

  const price = (style?.basePrice ?? 0) + (fabric?.priceAdd ?? 0);

  function toggleUnit(next: 'cm' | 'inch') {
    if (next === unit) return;
    setValues((prev) => {
      const out: Record<string, string> = {};
      for (const [k, v] of Object.entries(prev)) {
        const n = parseFloat(v);
        if (!isNaN(n)) out[k] = String(next === 'inch' ? toInch(n) : Math.round(n * CM_PER_INCH * 10) / 10);
      }
      return out;
    });
    setUnit(next);
  }

  const getCm = (key: string): number | null => {
    const n = parseFloat(values[key]);
    if (isNaN(n)) return null;
    return unit === 'inch' ? toCm(n) : n;
  };

  function fieldError(key: string): string | null {
    const cm = getCm(key);
    if (cm === null) return null;
    const [min, max] = FIELD_RANGES[key];
    if (cm < min || cm > max) return tm('outOfRange');
    return null;
  }

  const waistHipsWarning = (() => {
    const w = getCm('waist'), h = getCm('hips');
    return w !== null && h !== null && w > h + 10 ? tm('warnWaistHips') : null;
  })();

  const recommended = recommendSize({ bust: getCm('bust') ?? undefined, hips: getCm('hips') ?? undefined });

  const measurementsComplete =
    useStandard ||
    (style?.fields.every((k) => getCm(k) !== null && !fieldError(k)) ?? false);

  async function submit() {
    setSubmitting(true);
    setError('');
    const measurements: Record<string, number> = {};
    if (!useStandard) for (const k of style.fields) { const cm = getCm(k); if (cm !== null) measurements[k] = cm; }
    try {
      const res = await fetch('/api/order', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          styleSlug, fabricSlug, colorId: colorId || undefined, sleeve, closure, notes,
          useStandardSize: useStandard,
          standardSize: useStandard ? standardSize : undefined,
          measurements: useStandard ? undefined : measurements,
          shipping, saveProfileName: profileName || undefined, consent,
          idempotencyKey: crypto.randomUUID(),
        }),
      });
      if (res.status === 401) { window.location.href = loginHref; return; }
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? 'Something went wrong'); return; }
      setResult({ reference: data.reference });
      setStep(4);
    } catch {
      setError('Network error');
    } finally {
      setSubmitting(false);
    }
  }

  const steps = [t('s1'), t('s2'), t('s3'), t('s4')];

  if (result) {
    const waLink = `https://wa.me/${whatsapp}?text=${encodeURIComponent(`Order ${result.reference}`)}`;
    return (
      <div className="max-w-lg mx-auto text-center py-16">
        <div className="w-14 h-14 rounded-full bg-sage/30 text-sage flex items-center justify-center mx-auto mb-6 text-2xl">✓</div>
        <h2 className="text-3xl mb-2">{result.reference}</h2>
        <p className="text-muted mb-8">{ar ? 'تم استلام طلبك بنجاح.' : 'Your order has been placed.'}</p>
        <a href={waLink} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-charcoal text-ivory px-6 py-3 text-sm">
          {ar ? 'تواصل عبر واتساب' : 'Chat on WhatsApp'}
        </a>
      </div>
    );
  }

  return (
    <div>
      {/* progress */}
      <ol className="flex items-center justify-center gap-2 mb-12 text-xs">
        {steps.map((label, i) => {
          const n = i + 1;
          return (
            <li key={label} className="flex items-center gap-2">
              <span className={`w-7 h-7 rounded-full flex items-center justify-center ${n <= step ? 'bg-charcoal text-ivory' : 'bg-sand text-muted'}`}>{n}</span>
              <span className={`hidden sm:inline ${n === step ? 'text-charcoal' : 'text-muted'}`}>{label}</span>
              {n < steps.length && <span className="w-6 h-px bg-charcoal/20" />}
            </li>
          );
        })}
      </ol>

      {/* STEP 1 */}
      {step === 1 && (
        <div className="space-y-8">
          <div>
            <h3 className="text-lg mb-3">{t('style')}</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {styles.map((s) => (
                <button key={s.slug} onClick={() => setStyleSlug(s.slug)} className={`p-4 rounded-xl border text-start ${styleSlug === s.slug ? 'border-rose ring-1 ring-rose' : 'border-charcoal/15'}`}>
                  <span className="block aspect-[3/4] bg-sand/40 rounded mb-2 overflow-hidden relative">
                    <Image src={s.image} alt={name(s)} fill className="object-cover" sizes="(max-width: 768px) 50vw, 25vw" />
                  </span>
                  <span className="text-sm">{name(s)}</span>
                </button>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-lg mb-3">{t('fabric')}</h3>
            <div className="flex flex-wrap gap-3">
              {style?.fabrics.map((f) => (
                <button key={f.slug} disabled={!f.inStock} onClick={() => setFabricSlug(f.slug)} className={`flex items-center gap-2 px-4 py-2 rounded-full border ${fabricSlug === f.slug ? 'border-rose ring-1 ring-rose' : 'border-charcoal/15'} disabled:opacity-40`}>
                  <span className="w-4 h-4 rounded-full border border-charcoal/20" style={{ backgroundColor: f.swatch }} />
                  <span className="text-sm">{name(f)}</span>
                  <span className="text-xs text-muted">· {t('leadTime')} {f.leadDays} {t('days')}{!f.inStock ? ` · ${t('outOfStock')}` : ''}</span>
                </button>
              ))}
            </div>
          </div>
          {fabric && fabric.colors.length > 0 && (
            <div>
              <h3 className="text-lg mb-3">{t('colour')}</h3>
              <div className="flex flex-wrap gap-3">
                {fabric.colors.map((c) => (
                  <button key={c.id} onClick={() => setColorId(c.id)} title={name(c)} className={`w-9 h-9 rounded-full border-2 ${colorId === c.id ? 'border-rose' : 'border-charcoal/15'}`} style={{ backgroundColor: c.hex }} aria-label={name(c)} />
                ))}
              </div>
            </div>
          )}
          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg mb-3">{t('sleeve')}</h3>
              <div className="flex gap-2">
                {SLEEVES.map((s) => (
                  <button key={s} onClick={() => setSleeve(s)} className={`px-4 py-2 rounded-full border text-sm ${sleeve === s ? 'border-rose ring-1 ring-rose' : 'border-charcoal/15'}`}>{s}</button>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-lg mb-3">{t('closure')}</h3>
              <div className="flex gap-2 flex-wrap">
                {CLOSURES.map((c) => (
                  <button key={c} onClick={() => setClosure(c)} className={`px-4 py-2 rounded-full border text-sm ${closure === c ? 'border-rose ring-1 ring-rose' : 'border-charcoal/15'}`}>{c}</button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2 */}
      {step === 2 && (
        <div className="grid md:grid-cols-2 gap-10">
          <div className="order-2 md:order-1 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-lg">{t('s2')}</h3>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted">{tm('units')}:</span>
                <button onClick={() => toggleUnit('cm')} className={`px-3 py-1 rounded-full border ${unit === 'cm' ? 'bg-charcoal text-ivory' : 'border-charcoal/15'}`}>{tm('cm')}</button>
                <button onClick={() => toggleUnit('inch')} className={`px-3 py-1 rounded-full border ${unit === 'inch' ? 'bg-charcoal text-ivory' : 'border-charcoal/15'}`}>{tm('inch')}</button>
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={useStandard} onChange={(e) => setUseStandard(e.target.checked)} />
              {t('standardInstead')}
            </label>

            {useStandard ? (
              <div className="flex gap-2">
                {STD.map((s) => (
                  <button key={s} onClick={() => setStandardSize(s)} className={`px-4 py-2 rounded-full border ${standardSize === s ? 'border-rose ring-1 ring-rose' : 'border-charcoal/15'}`}>{s}</button>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {style?.fields.map((key) => {
                  const err = fieldError(key);
                  return (
                    <div key={key} onFocus={() => setActiveField(key)}>
                      <label className="flex justify-between text-sm mb-1">
                        <span>{tm(key)}</span><span className="text-muted text-xs">{unit}</span>
                      </label>
                      <input
                        type="number" inputMode="decimal" step="0.1"
                        value={values[key] ?? ''}
                        onChange={(e) => setValues((p) => ({ ...p, [key]: e.target.value }))}
                        onFocus={() => setActiveField(key)}
                        className={`w-full rounded-lg border px-3 py-2 bg-ivory ${err ? 'border-red-400' : 'border-charcoal/20'}`}
                        aria-describedby={`${key}-hint`}
                      />
                      <p id={`${key}-hint`} className="text-xs text-muted mt-1">{tm(`${key}Hint`)}</p>
                      {err && <p className="text-xs text-red-500 mt-1">{err}</p>}
                    </div>
                  );
                })}
                {waistHipsWarning && <p className="text-sm text-amber-600">{waistHipsWarning}</p>}
                {recommended && <p className="text-sm text-sage">{t('recommended')}: <strong>{recommended}</strong></p>}
                {isAuthed && (
                  <div>
                    <label className="block text-sm mb-1">{t('saveProfile')}</label>
                    <input value={profileName} onChange={(e) => setProfileName(e.target.value)} placeholder={t('profileName')} className="w-full rounded-lg border border-charcoal/20 px-3 py-2 bg-ivory" />
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="order-1 md:order-2 bg-sand/30 rounded-2xl p-6 flex items-center justify-center">
            <div className="max-w-[220px] w-full">
              <MeasurementFigure active={activeField} />
              <p className="text-center text-sm mt-3">{tm(activeField)}</p>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3 */}
      {step === 3 && (
        <div className="grid md:grid-cols-2 gap-10">
          <div className="space-y-3">
            <h3 className="text-lg mb-2">{t('s3')}</h3>
            <Row k={t('style')} v={name(style)} />
            <Row k={t('fabric')} v={fabric ? name(fabric) : ''} />
            <Row k={t('sleeve')} v={sleeve} />
            <Row k={t('closure')} v={closure} />
            <Row k={t('leadTime')} v={`${fabric?.leadDays ?? ''} ${t('days')}`} />
            <div className="border-t border-charcoal/10 pt-3 flex justify-between font-medium">
              <span>{t('total')}</span><span>{money(price)}</span>
            </div>
            <div className="pt-2">
              <label className="block text-sm mb-1">{t('notes')}</label>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className="w-full rounded-lg border border-charcoal/20 px-3 py-2 bg-ivory" />
            </div>
          </div>
          <div className="space-y-3">
            <h3 className="text-lg mb-2">{ar ? 'الشحن' : 'Shipping'}</h3>
            {(['fullName', 'phone', 'line1', 'line2', 'city', 'country'] as const).map((f) => (
              <input key={f} value={(shipping as any)[f]} onChange={(e) => setShipping((p) => ({ ...p, [f]: e.target.value }))} placeholder={f} className="w-full rounded-lg border border-charcoal/20 px-3 py-2 bg-ivory" />
            ))}
            <label className="flex items-start gap-2 text-sm pt-2">
              <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1" />
              <span>{tp('consent')}</span>
            </label>
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        </div>
      )}

      {/* nav */}
      {step < 4 && (
        <div className="flex justify-between mt-12">
          <button onClick={() => setStep((s) => Math.max(1, s - 1))} disabled={step === 1} className="px-6 py-3 rounded-full border border-charcoal/20 text-sm disabled:opacity-40">{t('back')}</button>
          {step < 3 ? (
            <button onClick={() => setStep((s) => s + 1)} disabled={step === 2 && !measurementsComplete} className="px-6 py-3 rounded-full bg-charcoal text-ivory text-sm disabled:opacity-40">{t('next')}</button>
          ) : (
            <button onClick={submit} disabled={submitting || !consent || !shipping.fullName || !shipping.line1} className="px-6 py-3 rounded-full bg-charcoal text-ivory text-sm disabled:opacity-40">{t('place')}</button>
          )}
        </div>
      )}
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-muted">{k}</span><span className="capitalize">{v}</span>
    </div>
  );
}
