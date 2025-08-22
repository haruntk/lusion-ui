import { z } from 'zod'

// Device Detection Schema
export const DeviceInfoSchema = z.object({
  isIOS: z.boolean(),
  isAndroid: z.boolean(),
  isMobile: z.boolean(),
  supportsWebXR: z.boolean(),
  supportsARKit: z.boolean(),
  supportsARCore: z.boolean(),
  userAgent: z.string(),
  platform: z.enum(['ios', 'android', 'desktop', 'unknown']),
})

// AR Session Configuration
export const ArSessionConfigSchema = z.object({
  mode: z.enum(['ar_preferred', 'ar_only', 'vr', 'inline']),
  features: z.array(z.enum([
    'local-floor', 
    'bounded-floor', 
    'unbounded', 
    'hand-tracking',
    'hit-test',
    'light-estimation',
    'anchors'
  ])).optional(),
  optionalFeatures: z.array(z.string()).optional(),
})

// AR Session State
export const ArSessionStateSchema = z.object({
  isSupported: z.boolean(),
  isActive: z.boolean(),
  isPaused: z.boolean(),
  error: z.string().nullable(),
  sessionId: z.string().optional(),
  startTime: z.string().datetime().optional(),
  duration: z.number().optional(), // in milliseconds
})

// AR Launch Payload for Native Apps
export const ArLaunchPayloadSchema = z.object({
  itemId: z.string().min(1, "Item ID is required"),
  modelUrl: z.string().url("Model URL is required"),
  modelType: z.enum(['glb', 'usdz', 'fbx', 'obj']),
  fallbackUrl: z.string().url("Fallback URL is required"),
  metadata: z.object({
    itemName: z.string(),
    itemDescription: z.string().optional(),
    itemPrice: z.string().optional(),
    itemCategory: z.string().optional(),
  }),
  launchParams: z.object({
    autoStart: z.boolean().default(true),
    allowScaling: z.boolean().default(true),
    allowRotation: z.boolean().default(true),
    initialScale: z.number().min(0.1).max(10).default(1),
    placement: z.enum(['floor', 'wall', 'table', 'any']).default('any'),
  }).optional(),
})

// Android Scene Viewer Intent Schema
export const AndroidIntentSchema = z.object({
  action: z.literal('android.intent.action.VIEW'),
  scheme: z.literal('https'),
  package: z.literal('com.google.android.googlequicksearchbox'),
  url: z.string().url(),
  fallbackUrl: z.string().url(),
  title: z.string().optional(),
})

// iOS AR Quick Look Schema
export const IosArQuickLookSchema = z.object({
  usdzUrl: z.string().url("USDZ URL is required for iOS"),
  allowsContentScaling: z.boolean().default(true),
  canonicalWebPageURL: z.string().url().optional(),
  checkoutTitle: z.string().optional(),
  checkoutSubtitle: z.string().optional(),
  price: z.string().optional(),
})

// Web AR Configuration
export const WebArConfigSchema = z.object({
  modelUrl: z.string().url("Model URL is required"),
  environment: z.string().url().optional(),
  lighting: z.enum(['neutral', 'warehouse', 'studio', 'city']).default('neutral'),
  autoRotate: z.boolean().default(true),
  cameraControls: z.boolean().default(true),
  arModes: z.array(z.enum(['webxr', 'scene-viewer', 'quick-look'])).default(['webxr']),
  iosSrc: z.string().url().optional(),
  poster: z.string().url().optional(),
})

// AR Analytics/Tracking
export const ArAnalyticsEventSchema = z.object({
  eventType: z.enum([
    'ar_session_start',
    'ar_session_end',
    'ar_model_load',
    'ar_model_place',
    'ar_interaction',
    'ar_error'
  ]),
  itemId: z.string(),
  sessionId: z.string(),
  timestamp: z.string().datetime(),
  duration: z.number().optional(),
  platform: z.enum(['ios', 'android', 'web']),
  metadata: z.record(z.unknown()).optional(),
})

// AR Error Schema
export const ArErrorSchema = z.object({
  code: z.enum([
    'NOT_SUPPORTED',
    'PERMISSION_DENIED',
    'MODEL_LOAD_FAILED',
    'SESSION_START_FAILED',
    'CAMERA_ACCESS_DENIED',
    'UNKNOWN_ERROR'
  ]),
  message: z.string(),
  details: z.string().optional(),
  itemId: z.string().optional(),
  timestamp: z.string().datetime(),
})

// Type exports
export type DeviceInfo = z.infer<typeof DeviceInfoSchema>
export type ArSessionConfig = z.infer<typeof ArSessionConfigSchema>
export type ArSessionState = z.infer<typeof ArSessionStateSchema>
export type ArLaunchPayload = z.infer<typeof ArLaunchPayloadSchema>
export type AndroidIntent = z.infer<typeof AndroidIntentSchema>
export type IosArQuickLook = z.infer<typeof IosArQuickLookSchema>
export type WebArConfig = z.infer<typeof WebArConfigSchema>
export type ArAnalyticsEvent = z.infer<typeof ArAnalyticsEventSchema>
export type ArError = z.infer<typeof ArErrorSchema>

// Validation helpers
export const validateDeviceInfo = (data: unknown): DeviceInfo => {
  return DeviceInfoSchema.parse(data)
}

export const validateArLaunchPayload = (data: unknown): ArLaunchPayload => {
  return ArLaunchPayloadSchema.parse(data)
}

export const validateArSessionState = (data: unknown): ArSessionState => {
  return ArSessionStateSchema.parse(data)
}

export const validateWebArConfig = (data: unknown): WebArConfig => {
  return WebArConfigSchema.parse(data)
}
