import { z } from 'zod'

export const subscribeSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .max(254, 'Email too long')
    .trim()
    .toLowerCase()
    .refine((v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), {
      message: 'Invalid email address',
    }),
})

export type SubscribeInput = z.infer<typeof subscribeSchema>