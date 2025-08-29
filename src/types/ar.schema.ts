import { z } from 'zod'

// Basic Device Detection Schema (minimal)
export const DeviceInfoSchema = z.object({
  isIOS: z.boolean(),
  isAndroid: z.boolean(),
  isMobile: z.boolean(),
  supportsWebXR: z.boolean().default(false),
  supportsARKit: z.boolean().default(false),
  supportsARCore: z.boolean().default(false),
  userAgent: z.string(),
  platform: z.enum(['ios', 'android', 'desktop', 'unknown']),
})

// AR Model Data Schema
export const ArModelDataSchema = z.object({
  itemId: z.string(),
  modelUrl: z.string(),
  iosModelUrl: z.string().optional(),
  previewImage: z.string().optional(),
  arReady: z.boolean().default(false),
  itemName: z.string().optional()
})

// Type exports
export type DeviceInfo = z.infer<typeof DeviceInfoSchema>
export type ArModelData = z.infer<typeof ArModelDataSchema>

// Validation helpers
export const validateDeviceInfo = (data: unknown): DeviceInfo => {
  return DeviceInfoSchema.parse(data)
}

export const validateArModelData = (data: unknown): ArModelData => {
  return ArModelDataSchema.parse(data)
}