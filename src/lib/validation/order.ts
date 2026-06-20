import { z } from 'zod';
import { measurementSchema } from './measurement';

export const STANDARD_SIZES = ['S', 'M', 'L', 'XL', 'XXL'] as const;

export const shippingSchema = z.object({
  fullName: z.string().min(2).max(120),
  phone: z.string().min(6).max(30),
  line1: z.string().min(3).max(200),
  line2: z.string().max(200).optional().default(''),
  city: z.string().min(2).max(100),
  country: z.string().min(2).max(100),
});

export const orderSchema = z.object({
  styleSlug: z.string().min(1),
  fabricSlug: z.string().min(1),
  colorId: z.string().optional(),
  sleeve: z.enum(['standard', 'wide', 'fitted']).optional(),
  closure: z.enum(['none', 'snap', 'zip', 'tie']).optional(),
  notes: z.string().max(1000).optional().default(''),
  useStandardSize: z.boolean().default(false),
  standardSize: z.enum(STANDARD_SIZES).optional(),
  measurements: measurementSchema.optional(),
  shipping: shippingSchema,
  saveProfileName: z.string().max(80).optional(),
  consent: z.literal(true, { errorMap: () => ({ message: 'consent required' }) }),
  idempotencyKey: z.string().uuid().optional(),
}).refine(
  (v) => v.useStandardSize ? !!v.standardSize : !!v.measurements,
  { message: 'Provide measurements or a standard size', path: ['measurements'] },
);

export type OrderInput = z.infer<typeof orderSchema>;

export const contactSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email(),
  message: z.string().min(5).max(2000),
});
