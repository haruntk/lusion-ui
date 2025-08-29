// Main API client and utilities
export { apiClient, getData, get, post, put, patch, del, getRaw, checkHealth, ApiError, ValidationApiError } from './api'

// Legacy client (for backward compatibility)
export { default as client } from './client'

// API Modules - aligned with Flask backend endpoints
export { itemsApi, getAllItems, getItemById, findItemById, getItemsByCategory, searchItems, getItemCategories, getPaginatedItems } from './items'
export { arApi, getDeviceCapabilities, getModelUrls, startArSession, getArSessionInfo } from './ar'
export { qrApi, qrHelpers } from './qr'

// Types (re-exported for convenience)
export type { Item, ItemDetail, Category, ItemSearchParams } from '@/types'
export type { DeviceInfo, ArModelData } from '@/types'
export type { QrGenerationRequest, QrResponse, QrCodeMetadata, QrAnalytics } from '@/types'
