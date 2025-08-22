import { z } from 'zod'

// Base Item Schema
export const ItemSchema = z.object({
  id: z.string().min(1, "Item ID is required"),
  name: z.string().min(1, "Item name is required"),
  description: z.string().min(1, "Item description is required"),
  category: z.string().min(1, "Category is required"),
  price: z.string().min(1, "Price is required"),
  image: z.string().url("Image must be a valid URL"),
  model: z.string().url("3D model must be a valid URL"),
  model_ios: z.string().url("iOS model must be a valid URL").optional(),
})

// Item Detail Schema (same as Item but with additional metadata)
export const ItemDetailSchema = ItemSchema.extend({
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
  tags: z.array(z.string()).optional(),
  nutritional_info: z.object({
    calories: z.number().optional(),
    protein: z.string().optional(),
    carbs: z.string().optional(),
    fat: z.string().optional(),
    allergens: z.array(z.string()).optional(),
  }).optional(),
  availability: z.object({
    in_stock: z.boolean(),
    estimated_prep_time: z.string().optional(),
  }).optional(),
})

// Items Response Schema
export const ItemsResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(ItemSchema),
  message: z.string().optional(),
  total: z.number().optional(),
  page: z.number().optional(),
  limit: z.number().optional(),
})

// Single Item Response Schema
export const ItemDetailResponseSchema = z.object({
  success: z.boolean(),
  data: ItemDetailSchema,
  message: z.string().optional(),
})

// Category Schema
export const CategorySchema = z.object({
  name: z.string().min(1, "Category name is required"),
  count: z.number().int().min(0).optional(),
  description: z.string().optional(),
  image: z.string().url().optional(),
})

// Categories Response Schema
export const CategoriesResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(CategorySchema),
  message: z.string().optional(),
})

// Item Search/Filter Parameters
export const ItemSearchParamsSchema = z.object({
  category: z.string().optional(),
  search: z.string().optional(),
  page: z.number().int().min(1).optional(),
  limit: z.number().int().min(1).max(100).optional(),
  sort_by: z.enum(['name', 'price', 'category', 'created_at']).optional(),
  sort_order: z.enum(['asc', 'desc']).optional(),
})

// Type exports
export type Item = z.infer<typeof ItemSchema>
export type ItemDetail = z.infer<typeof ItemDetailSchema>
export type ItemsResponse = z.infer<typeof ItemsResponseSchema>
export type ItemDetailResponse = z.infer<typeof ItemDetailResponseSchema>
export type Category = z.infer<typeof CategorySchema>
export type CategoriesResponse = z.infer<typeof CategoriesResponseSchema>
export type ItemSearchParams = z.infer<typeof ItemSearchParamsSchema>

// Validation helpers
export const validateItem = (data: unknown): Item => {
  return ItemSchema.parse(data)
}

export const validateItemDetail = (data: unknown): ItemDetail => {
  return ItemDetailSchema.parse(data)
}

export const validateItemsResponse = (data: unknown): ItemsResponse => {
  return ItemsResponseSchema.parse(data)
}

export const validateCategory = (data: unknown): Category => {
  return CategorySchema.parse(data)
}
