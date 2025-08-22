import { 
  AndroidIntentSchema,
  IosArQuickLookSchema,
  DeviceInfoSchema,
  ArAnalyticsEventSchema,
  type AndroidIntent,
  type IosArQuickLook,
  type DeviceInfo,
  type ArAnalyticsEvent
} from '@/types/ar.schema'

// Type declarations for WebXR (avoiding navigator.xr TypeScript issues)
interface WebXRNavigator extends Navigator {
  xr?: {
    isSessionSupported(mode: string): Promise<boolean>
  }
}

declare const navigator: WebXRNavigator

/**
 * AR API module
 * Handles AR session management, model loading, and platform-specific launches
 * Note: Most AR endpoints don't exist in current Flask backend, so these are client-side utilities
 */
export const arApi = {
  /**
   * Get device AR capabilities (client-side detection)
   */
  async getDeviceCapabilities(userAgent?: string): Promise<DeviceInfo> {
    const ua = userAgent || navigator.userAgent
    const userAgentLower = ua.toLowerCase()
    
    // Check WebXR support safely
    let supportsWebXR = false
    try {
      supportsWebXR = 'xr' in navigator && !!navigator.xr
    } catch (error) {
      console.warn('WebXR check failed:', error)
      supportsWebXR = false
    }

    const deviceInfo: DeviceInfo = {
      isIOS: /iphone|ipad|ipod/.test(userAgentLower),
      isAndroid: /android/.test(userAgentLower),
      isMobile: /mobile|tablet|iphone|ipad|ipod|android/.test(userAgentLower),
      supportsWebXR,
      supportsARKit: /iphone|ipad|ipod/.test(userAgentLower),
      supportsARCore: /android/.test(userAgentLower),
      userAgent: ua,
      platform: /iphone|ipad|ipod/.test(userAgentLower) ? 'ios' 
               : /android/.test(userAgentLower) ? 'android'
               : /mobile|tablet/.test(userAgentLower) ? 'unknown'
               : 'desktop'
    }

    // Validate with schema
    return DeviceInfoSchema.parse(deviceInfo)
  },

  /**
   * Get model URLs for an item (from items API)
   */
  async getModelUrls(itemId: string): Promise<{
    modelUrl: string
    iosModelUrl?: string
    fallbackUrl: string
    previewImage?: string
  }> {
    if (!itemId) {
      throw new Error('Item ID is required')
    }

    // Get item data from items API since backend doesn't have dedicated AR endpoints
    const { itemsApi } = await import('./items')
    const item = await itemsApi.findById(itemId)
    
    if (!item) {
      throw new Error(`Item not found: ${itemId}`)
    }

    return {
      modelUrl: item.model,
      iosModelUrl: item.model_ios,
      fallbackUrl: `/ar-view/${itemId}`,  // Flask endpoint: /ar-view/<item_id>
      previewImage: item.image,
    }
  },

  /**
   * Generate Android Scene Viewer intent URL (client-side)
   */
  async generateAndroidIntent(itemId: string, options?: {
    fallbackUrl?: string
    title?: string
  }): Promise<AndroidIntent> {
    const modelUrls = await this.getModelUrls(itemId)
    const fallbackUrl = options?.fallbackUrl || modelUrls.fallbackUrl
    
    const intent: AndroidIntent = {
      action: 'android.intent.action.VIEW',
      scheme: 'https',
      package: 'com.google.android.googlequicksearchbox',
      url: `intent://arvr.google.com/scene-viewer/1.0?file=${encodeURIComponent(modelUrls.modelUrl)}&mode=ar_preferred#Intent;scheme=https;package=com.google.android.googlequicksearchbox;action=android.intent.action.VIEW;S.browser_fallback_url=${encodeURIComponent(fallbackUrl)};end;`,
      fallbackUrl,
      title: options?.title,
    }

    return AndroidIntentSchema.parse(intent)
  },

  /**
   * Generate iOS AR Quick Look configuration (client-side)
   */
  async generateIosQuickLook(itemId: string, options?: {
    allowsContentScaling?: boolean
    checkoutTitle?: string
    checkoutSubtitle?: string
    price?: string
  }): Promise<IosArQuickLook> {
    const modelUrls = await this.getModelUrls(itemId)
    
    if (!modelUrls.iosModelUrl) {
      throw new Error('iOS USDZ model not available for this item')
    }

    const quickLook: IosArQuickLook = {
      usdzUrl: modelUrls.iosModelUrl,
      allowsContentScaling: options?.allowsContentScaling ?? true,
      canonicalWebPageURL: modelUrls.fallbackUrl,
      checkoutTitle: options?.checkoutTitle,
      checkoutSubtitle: options?.checkoutSubtitle,
      price: options?.price,
    }

    return IosArQuickLookSchema.parse(quickLook)
  },

  /**
   * Track AR analytics event (placeholder - would need backend implementation)
   */
  async trackEvent(event: ArAnalyticsEvent): Promise<{ success: boolean; message?: string }> {
    const validatedEvent = ArAnalyticsEventSchema.parse(event)
    
    // For now, just log to console since backend doesn't have analytics endpoint
    console.log('AR Event:', validatedEvent)
    
    return { success: true, message: 'Event logged (client-side only)' }
  },

  /**
   * Get AR analytics for an item (placeholder)
   */
  async getAnalytics(itemId: string): Promise<{
    itemId: string
    totalSessions: number
    successfulLaunches: number
    averageSessionDuration: number
    platformBreakdown: { ios: number; android: number; web: number }
    dailyStats: Array<{ date: string; sessions: number; launches: number }>
  }> {
    if (!itemId) {
      throw new Error('Item ID is required')
    }

    // Placeholder data since backend doesn't have analytics
    return {
      itemId,
      totalSessions: 0,
      successfulLaunches: 0,
      averageSessionDuration: 0,
      platformBreakdown: { ios: 0, android: 0, web: 0 },
      dailyStats: []
    }
  },

  /**
   * Validate AR model file (client-side basic validation)
   */
  async validateModel(modelUrl: string, modelType: 'glb' | 'usdz' | 'fbx' | 'obj' = 'glb'): Promise<{
    isValid: boolean
    fileSize: number
    format: string
    errors?: string[]
    warnings?: string[]
  }> {
    if (!modelUrl) {
      throw new Error('Model URL is required')
    }

    try {
      // Basic URL validation
      new URL(modelUrl)
      
      // Check file extension matches type
      const extension = modelUrl.split('.').pop()?.toLowerCase()
      const expectedExtension = modelType.toLowerCase()
      
      const isValid = extension === expectedExtension
      const errors = isValid ? [] : [`File extension .${extension} doesn't match expected type ${modelType}`]

      return {
        isValid,
        fileSize: 0, // Would need HEAD request to get actual size
        format: extension || 'unknown',
        errors,
        warnings: isValid ? [] : ['Model validation is basic - full validation requires backend support']
      }
    } catch (error) {
      return {
        isValid: false,
        fileSize: 0,
        format: 'unknown',
        errors: ['Invalid model URL'],
        warnings: []
      }
    }
  }
}

// Export individual functions for convenience
export const {
  getDeviceCapabilities: getArDeviceCapabilities,
  getModelUrls: getArModelUrls,
  generateAndroidIntent,
  generateIosQuickLook,
  trackEvent: trackArEvent,
  getAnalytics: getArAnalytics,
  validateModel: validateArModel
} = arApi

// Helper functions for client-side AR detection
export const arHelpers = {
  /**
   * Detect device AR capabilities client-side
   */
  detectDeviceCapabilities(): DeviceInfo {
    const userAgent = navigator.userAgent.toLowerCase()
    const isIOS = /iphone|ipad|ipod/.test(userAgent)
    const isAndroid = /android/.test(userAgent)
    const isMobile = /mobile|tablet|iphone|ipad|ipod|android/.test(userAgent)

    return {
      isIOS,
      isAndroid,
      isMobile,
      supportsWebXR: 'xr' in navigator,
      supportsARKit: isIOS,
      supportsARCore: isAndroid,
      userAgent: navigator.userAgent,
      platform: isIOS ? 'ios' : isAndroid ? 'android' : isMobile ? 'unknown' : 'desktop'
    }
  },

  /**
   * Check if WebXR AR is supported
   */
  async checkWebXRSupport(): Promise<boolean> {
    try {
      // Check if WebXR is available
      const xrNavigator = navigator as any
      if (!xrNavigator.xr) {
        return false
      }

      // Check if immersive AR is supported
      const isSupported = await xrNavigator.xr.isSessionSupported('immersive-ar')
      return Boolean(isSupported)
    } catch (error) {
      console.warn('WebXR support check failed:', error)
      return false
    }
  },

  /**
   * Generate platform-specific AR launch URL
   */
  generateLaunchUrl(itemId: string, deviceInfo?: DeviceInfo): string {
    const device = deviceInfo || this.detectDeviceCapabilities()
    
    if (device.isIOS) {
      return `/ios-ar-launcher?item_id=${itemId}`
    } else if (device.isAndroid) {
      return `/android-ar?item_id=${itemId}`
    } else {
      return `/ar-view?item_id=${itemId}`
    }
  }
}
