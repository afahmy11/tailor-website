import { z } from 'zod';
import { measurementSchema } from './measurement';

export const profileSchema = z.object({
  name: z.string().min(1).max(80),
  data: measurementSchema,
});
