import { z } from 'zod'

// Base API Response Schema
export const ApiResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  error: z.string().optional(),
})

// Menu Item Schema
export const MenuItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  category: z.string(),
  price: z.string(),
  image: z.string().url(),
  model: z.string().url(),
  model_ios: z.string().url().optional(),
})

// Menu Items Response Schema
export const MenuItemsResponseSchema = ApiResponseSchema.extend({
  data: z.array(MenuItemSchema),
})

// Single Menu Item Response Schema
export const MenuItemResponseSchema = ApiResponseSchema.extend({
  data: MenuItemSchema,
})

// Category Schema
export const CategorySchema = z.object({
  name: z.string(),
  count: z.number().optional(),
})

// Error Response Schema
export const ErrorResponseSchema = z.object({
  success: z.literal(false),
  error: z.string(),
  message: z.string().optional(),
  code: z.number().optional(),
})

// Type exports
export type ApiResponse<T = unknown> = z.infer<typeof ApiResponseSchema> & {
  data?: T
}

export type MenuItem = z.infer<typeof MenuItemSchema>
export type MenuItemsResponse = z.infer<typeof MenuItemsResponseSchema>
export type MenuItemResponse = z.infer<typeof MenuItemResponseSchema>
export type Category = z.infer<typeof CategorySchema>
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>
