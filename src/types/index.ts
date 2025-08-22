// New Schema-based Types (primary exports)
export * from './api.schema'
export * from './item.schema'
export * from './ar.schema'
export * from './qr.schema'

// UI Types
export * from './ui'

// Legacy API Types (explicit imports to avoid conflicts)
export type { 
  MenuItem as LegacyMenuItem,
  MenuItemsResponse as LegacyMenuItemsResponse,
  MenuItemResponse as LegacyMenuItemResponse,
  Category as LegacyCategory,
  ErrorResponse as LegacyErrorResponse
} from './api'
