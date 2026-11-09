import { z } from 'zod'

export const categorySchema = z.object({
  id: z.number().finite(),
  name: z.string(),
})

export const tagSchema = z.object({
  id: z.number().finite(),
  name: z.string(),
})

export const petSchema = z.object({
  id: z.number().finite(),
  category: categorySchema.optional(),
  name: z.string(),
  photoUrls: z.array(z.string()),
  tags: z.array(tagSchema).optional(),
  status: z.enum(['available', 'pending', 'sold']).optional(),
})

export const apiResponseSchema = z.object({
  code: z.number().int().optional(),
  type: z.string().optional(),
  message: z.union([z.string(), z.number()]).optional(),
})

export type Pet = z.infer<typeof petSchema>
