// Standard chart (cm) — also drives the size guide page.
export const SIZE_CHART = [
  { size: 'S', bust: 88, waist: 70, hips: 94, length: 135 },
  { size: 'M', bust: 96, waist: 78, hips: 102, length: 138 },
  { size: 'L', bust: 104, waist: 86, hips: 110, length: 141 },
  { size: 'XL', bust: 112, waist: 94, hips: 118, length: 144 },
  { size: 'XXL', bust: 120, waist: 102, hips: 126, length: 147 },
];

// Nearest standard size from bust/hips — a sanity check, not a fitting.
export function recommendSize(m: { bust?: number; hips?: number }): string | null {
  if (!m.bust && !m.hips) return null;
  let best = SIZE_CHART[0].size;
  let bestScore = Infinity;
  for (const row of SIZE_CHART) {
    const score =
      (m.bust ? Math.abs(row.bust - m.bust) : 0) +
      (m.hips ? Math.abs(row.hips - m.hips) : 0);
    if (score < bestScore) { bestScore = score; best = row.size; }
  }
  return best;
}

export const CM_PER_INCH = 2.54;
export const toCm = (inch: number) => Math.round(inch * CM_PER_INCH * 10) / 10;
export const toInch = (cm: number) => Math.round((cm / CM_PER_INCH) * 10) / 10;
