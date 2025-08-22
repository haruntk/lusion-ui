import { z } from 'zod'

// QR Code Generation Request
export const QrGenerationRequestSchema = z.object({
  itemId: z.string().min(1, "Item ID is required"),
  size: z.number().int().min(100).max(2000).default(400),
  format: z.enum(['png', 'jpg', 'svg']).default('png'),
  errorCorrection: z.enum(['L', 'M', 'Q', 'H']).default('M'),
  margin: z.number().int().min(0).max(10).default(4),
  foregroundColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default('#000000'),
  backgroundColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default('#FFFFFF'),
})

// QR Code Response
export const QrResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    qrCodeUrl: z.string().url("QR code URL must be valid"),
    arStartUrl: z.string().url("AR start URL must be valid"),
    arViewUrl: z.string().url("AR view URL must be valid"),
    itemId: z.string(),
    generatedAt: z.string().datetime(),
    expiresAt: z.string().datetime().optional(),
    downloadUrl: z.string().url().optional(),
    size: z.number().int(),
    format: z.string(),
  }),
  message: z.string().optional(),
})

// QR Code Metadata
export const QrCodeMetadataSchema = z.object({
  itemId: z.string(),
  itemName: z.string(),
  category: z.string(),
  qrCodeId: z.string(),
  createdAt: z.string().datetime(),
  lastScanned: z.string().datetime().optional(),
  scanCount: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
  customization: z.object({
    size: z.number().int(),
    format: z.string(),
    errorCorrection: z.string(),
    colors: z.object({
      foreground: z.string(),
      background: z.string(),
    }),
  }),
})

// QR Code Scan Event
export const QrScanEventSchema = z.object({
  qrCodeId: z.string(),
  itemId: z.string(),
  scannedAt: z.string().datetime(),
  userAgent: z.string(),
  deviceInfo: z.object({
    platform: z.enum(['ios', 'android', 'desktop', 'unknown']),
    isMobile: z.boolean(),
    supportsAR: z.boolean(),
  }),
  location: z.object({
    country: z.string().optional(),
    city: z.string().optional(),
    ip: z.string().optional(),
  }).optional(),
  referrer: z.string().url().optional(),
})

// QR Code Analytics
export const QrAnalyticsSchema = z.object({
  itemId: z.string(),
  totalScans: z.number().int().min(0),
  uniqueScans: z.number().int().min(0),
  arLaunches: z.number().int().min(0),
  conversionRate: z.number().min(0).max(1), // percentage as decimal
  topDevices: z.array(z.object({
    platform: z.string(),
    count: z.number().int(),
    percentage: z.number().min(0).max(100),
  })),
  scansByDate: z.array(z.object({
    date: z.string().date(),
    scans: z.number().int().min(0),
  })),
  peakHours: z.array(z.object({
    hour: z.number().int().min(0).max(23),
    scans: z.number().int().min(0),
  })),
})

// QR Code Batch Generation
export const QrBatchRequestSchema = z.object({
  itemIds: z.array(z.string().min(1)).min(1).max(100),
  settings: QrGenerationRequestSchema.omit({ itemId: true }),
  outputFormat: z.enum(['zip', 'pdf', 'individual']).default('zip'),
  includeMetadata: z.boolean().default(true),
})

export const QrBatchResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    batchId: z.string(),
    downloadUrl: z.string().url(),
    qrCodes: z.array(z.object({
      itemId: z.string(),
      qrCodeUrl: z.string().url(),
      arStartUrl: z.string().url(),
      status: z.enum(['success', 'error']),
      error: z.string().optional(),
    })),
    totalGenerated: z.number().int(),
    totalErrors: z.number().int(),
    expiresAt: z.string().datetime(),
  }),
  message: z.string().optional(),
})

// QR Code Sharing
export const QrShareRequestSchema = z.object({
  itemId: z.string(),
  shareMethod: z.enum(['email', 'sms', 'social', 'link']),
  recipient: z.string().optional(), // email or phone for direct sharing
  message: z.string().optional(),
  customization: z.object({
    includePreview: z.boolean().default(true),
    includeInstructions: z.boolean().default(true),
    branding: z.boolean().default(true),
  }).optional(),
})

// Type exports
export type QrGenerationRequest = z.infer<typeof QrGenerationRequestSchema>
export type QrResponse = z.infer<typeof QrResponseSchema>
export type QrCodeMetadata = z.infer<typeof QrCodeMetadataSchema>
export type QrScanEvent = z.infer<typeof QrScanEventSchema>
export type QrAnalytics = z.infer<typeof QrAnalyticsSchema>
export type QrBatchRequest = z.infer<typeof QrBatchRequestSchema>
export type QrBatchResponse = z.infer<typeof QrBatchResponseSchema>
export type QrShareRequest = z.infer<typeof QrShareRequestSchema>

// Validation helpers
export const validateQrGenerationRequest = (data: unknown): QrGenerationRequest => {
  return QrGenerationRequestSchema.parse(data)
}

export const validateQrResponse = (data: unknown): QrResponse => {
  return QrResponseSchema.parse(data)
}

export const validateQrScanEvent = (data: unknown): QrScanEvent => {
  return QrScanEventSchema.parse(data)
}

export const validateQrAnalytics = (data: unknown): QrAnalytics => {
  return QrAnalyticsSchema.parse(data)
}
