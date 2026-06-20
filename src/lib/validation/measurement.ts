import { z } from 'zod';

// Sensible per-field ranges in CENTIMETRES. Used on client AND server.
export const FIELD_RANGES: Record<string, [number, number]> = {
  totalLength: [110, 175],
  shoulderWidth: [30, 60],
  bust: [70, 160],
  waist: [55, 150],
  hips: [70, 170],
  sleeveLength: [40, 75],
  armWidth: [20, 55],
  neck: [28, 55],
};

export const MEASUREMENT_KEYS = Object.keys(FIELD_RANGES) as Array<keyof typeof FIELD_RANGES>;

function field(key: string) {
  const [min, max] = FIELD_RANGES[key];
  return z.number({ invalid_type_error: 'required' }).min(min).max(max);
}

// Full measurement object (cm). Individual fields optional so styles can require a subset.
export const measurementSchema = z
  .object(
    Object.fromEntries(MEASUREMENT_KEYS.map((k) => [k, field(k).optional()])) as Record<
      string,
      z.ZodOptional<z.ZodNumber>
    >,
  )
  .superRefine((val, ctx) => {
    if (typeof val.waist === 'number' && typeof val.hips === 'number' && val.waist > val.hips + 10) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['waist'], message: 'warnWaistHips' });
    }
  });

export type Measurements = z.infer<typeof measurementSchema>;

// Build a schema that REQUIRES only the fields a chosen style needs.
export function measurementSchemaFor(requiredKeys: string[]) {
  const shape: Record<string, z.ZodTypeAny> = {};
  for (const k of MEASUREMENT_KEYS) {
    shape[k] = requiredKeys.includes(k) ? field(k) : field(k).optional();
  }
  return z.object(shape);
}
