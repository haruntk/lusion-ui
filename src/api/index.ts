// Main API client and utilities
export { apiClient, getData, get, post, put, patch, del, getRaw, ApiError, ValidationApiError } from './api'

// Legacy client (for backward compatibility)
export { default as client } from './client'

// API Modules - aligned with Flask backend endpoints
export { itemsApi, getAllItems, getItemById, findItemById, getItemsByCategory, searchItems, getItemCategories, getPaginatedItems } from './items'
export { arApi, getArModelUrls, generateAndroidIntent, generateIosQuickLook, getArDeviceCapabilities, trackArEvent, getArAnalytics, validateArModel, arHelpers } from './ar'
export { qrApi, generateQrCode, getQrCode, getQrCodeUrl, getQrMetadata, trackQrScan, getQrAnalytics, downloadQrCode, validateQrCode, qrHelpers } from './qr'
export { healthApi, checkHealth, isBackendReachable } from './health'

// Types (re-exported for convenience)
export type { Item, ItemDetail, Category, ItemSearchParams } from '@/types'
export type { ArLaunchPayload, ArSessionState, DeviceInfo, ArAnalyticsEvent } from '@/types'
export type { QrGenerationRequest, QrResponse, QrCodeMetadata, QrAnalytics } from '@/types'
export type { HealthResponse } from './health'
