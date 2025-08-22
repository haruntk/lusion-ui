/**
 * API Usage Examples
 * 
 * This file demonstrates how to use the API modules with proper error handling
 * and type safety. These examples can be used as reference for implementation.
 */

import { 
  itemsApi, 
  arApi, 
  qrApi, 
  ApiError, 
  ValidationApiError 
} from './index'

// Example 1: Basic Items API Usage
export async function exampleItemsUsage() {
  try {
    // Get all items
    const allItems = await itemsApi.getAll()
    console.log('All items:', allItems)

    // Search items
    const searchResults = await itemsApi.search('kebap')
    console.log('Search results:', searchResults)

    // Get items by category
    const kebapItems = await itemsApi.getByCategory('kebap')
    console.log('Kebap items:', kebapItems)

    // Get single item
    const item = await itemsApi.getById('kebap_001')
    if (item) {
      console.log('Item details:', item)
    }

    // Get categories with counts
    const categories = await itemsApi.getCategories()
    console.log('Categories:', categories)

    // Get paginated results
    const paginatedResults = await itemsApi.getPaginated(1, 10, { 
      category: 'kebap',
      sort_by: 'name',
      sort_order: 'asc'
    })
    console.log('Paginated results:', paginatedResults)

  } catch (error) {
    if (error instanceof ApiError) {
      console.error('API Error:', error.code, error.message)
    } else if (error instanceof ValidationApiError) {
      console.error('Validation Error:', error.validationErrors)
    } else {
      console.error('Unexpected error:', error)
    }
  }
}

// Example 2: AR API Usage
export async function exampleArUsage() {
  try {
    // Check device capabilities
    const deviceInfo = await arApi.getDeviceCapabilities()
    console.log('Device capabilities:', deviceInfo)

    // Start AR session
    const session = await arApi.startSession({
      itemId: 'kebap_001',
      modelUrl: 'https://example.com/model.glb',
      modelType: 'glb',
      fallbackUrl: 'https://example.com/fallback',
      metadata: {
        itemName: 'Adana Kebap',
        itemPrice: '₺85',
        itemCategory: 'kebap'
      }
    })
    console.log('AR session started:', session)

    // Get model URLs
    const modelUrls = await arApi.getModelUrls('kebap_001')
    console.log('Model URLs:', modelUrls)

    // Generate platform-specific intents
    if (deviceInfo.isAndroid) {
      const androidIntent = await arApi.generateAndroidIntent('kebap_001', {
        title: 'View Kebap in AR'
      })
      console.log('Android intent:', androidIntent)
    }

    if (deviceInfo.isIOS) {
      const iosQuickLook = await arApi.generateIosQuickLook('kebap_001', {
        checkoutTitle: 'Adana Kebap',
        price: '₺85'
      })
      console.log('iOS Quick Look:', iosQuickLook)
    }

    // Track analytics
    await arApi.trackEvent({
      eventType: 'ar_session_start',
      itemId: 'kebap_001',
      sessionId: session.sessionId,
      timestamp: new Date().toISOString(),
      platform: deviceInfo.isIOS ? 'ios' : deviceInfo.isAndroid ? 'android' : 'web'
    })

    // Get analytics
    const analytics = await arApi.getAnalytics('kebap_001')
    console.log('AR analytics:', analytics)

  } catch (error) {
    console.error('AR API error:', error)
  }
}

// Example 3: QR Code API Usage
export async function exampleQrUsage() {
  try {
    // Generate QR code
    const qrResponse = await qrApi.generate({
      itemId: 'kebap_001',
      size: 400,
      format: 'png',
      errorCorrection: 'M',
      foregroundColor: '#000000',
      backgroundColor: '#FFFFFF'
    })
    console.log('QR generated:', qrResponse)

    // Get QR code as blob for display
    const qrBlob = await qrApi.getQrCode('kebap_001', { size: 200 })
    console.log('QR blob:', qrBlob)

    // Get QR code URL for img src
    const qrUrl = qrApi.getQrCodeUrl('kebap_001', { size: 300 })
    console.log('QR URL:', qrUrl)

    // Download QR code
    await qrApi.download('kebap_001', 'my-qr-code.png', { 
      size: 500, 
      format: 'png' 
    })

    // Track QR scan
    await qrApi.trackScan({
      qrCodeId: 'qr_kebap_001',
      itemId: 'kebap_001',
      scannedAt: new Date().toISOString(),
      userAgent: navigator.userAgent,
      deviceInfo: {
        platform: 'android',
        isMobile: true,
        supportsAR: true
      }
    })

    // Get QR analytics
    const qrAnalytics = await qrApi.getAnalytics('kebap_001', {
      from: '2024-01-01T00:00:00Z',
      to: '2024-12-31T23:59:59Z'
    })
    console.log('QR analytics:', qrAnalytics)

    // Generate batch QR codes
    const batchResult = await qrApi.generateBatch({
      itemIds: ['kebap_001', 'kebap_002', 'meze_001'],
      settings: {
        size: 400,
        format: 'png',
        errorCorrection: 'M'
      },
      outputFormat: 'zip'
    })
    console.log('Batch generation:', batchResult)

  } catch (error) {
    console.error('QR API error:', error)
  }
}

// Example 4: Error Handling Patterns

// Example 5: Advanced Error Handling
export async function exampleErrorHandling() {
  try {
    await itemsApi.getById('non-existent-id')
  } catch (error) {
    if (error instanceof ValidationApiError) {
      // Handle validation errors
      console.error('Validation failed:')
      error.validationErrors.forEach(err => {
        console.error(`- ${err.field}: ${err.message}`)
      })
    } else if (error instanceof ApiError) {
      // Handle API errors
      switch (error.code) {
        case 'NOT_FOUND':
          console.error('Item not found')
          break
        case 'NETWORK_ERROR':
          console.error('Network connection failed')
          break
        case 'VALIDATION_ERROR':
          console.error('Request validation failed:', error.details)
          break
        default:
          console.error('API error:', error.message)
      }
    } else {
      // Handle unexpected errors
      console.error('Unexpected error:', error)
    }
  }
}

// Example 5: Using Raw API Client
export async function exampleRawApiUsage() {
  try {
    // Import the low-level API functions
    const { get, post, getData } = await import('./api')

    // Make a raw GET request with validation
    const items = await get('/items', undefined, {
      params: { category: 'kebap' }
    })
    console.log('Raw API result:', items)

    // Make a POST request
    const result = await post('/qr/generate', {
      itemId: 'kebap_001',
      size: 400
    })
    console.log('POST result:', result)

  } catch (error) {
    console.error('Raw API error:', error)
  }
}

// Example 6: React Hook Usage Pattern
export function useItemsExample() {
  // This would be in a React component
  /*
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadItems = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await itemsApi.getAll()
        setItems(data)
      } catch (err) {
        if (err instanceof ApiError) {
          setError(err.message)
        } else {
          setError('Failed to load items')
        }
      } finally {
        setLoading(false)
      }
    }

    loadItems()
  }, [])

  return { items, loading, error }
  */
}
