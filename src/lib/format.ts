// Money is stored as integer minor units.
export function formatMoney(minor: number, currency = process.env.CURRENCY ?? 'AED', locale = 'en') {
  return new Intl.NumberFormat(locale === 'ar' ? 'ar' : 'en', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(minor / 100);
}
