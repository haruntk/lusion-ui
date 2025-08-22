// API Configuration
export const API_CONFIG = {
  BASE_URL: '/api',
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
} as const

// App Configuration
export const APP_CONFIG = {
  NAME: 'Lusion UI',
  VERSION: '1.0.0',
  DESCRIPTION: 'Modern AR Menu Experience',
} as const

// Route Paths
export const ROUTES = {
  HOME: '/',
  ITEMS: '/items',
  ITEM_DETAIL: '/items/:id',
  AR_VIEW: '/ar/:id',
  QR_CODE: '/qr/:id',
  ABOUT: '/about',
  CONTACT: '/contact',
} as const

// Animation Durations (ms)
export const ANIMATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
} as const

// Breakpoints (matches Tailwind)
export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  '2XL': 1536,
} as const
