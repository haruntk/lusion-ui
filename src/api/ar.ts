// import { type AxiosResponse } from 'axios'
import { apiClient } from './client'
import { 
  DeviceInfoSchema,
  type DeviceInfo,
  type ArModelData
} from '@/types/ar.schema'

/**
 * AR API module - simplified to use backend for all AR functionality
 */
export const arApi = {
  /**
   * Get device AR capabilities (client-side detection)
   */
  async getDeviceCapabilities(userAgent?: string): Promise<DeviceInfo> {
    const ua = userAgent || navigator.userAgent
    const userAgentLower = ua.toLowerCase()
    
    // Basic device detection (minimal)
    const deviceInfo: DeviceInfo = {
      isIOS: /iphone|ipad|ipod/.test(userAgentLower),
      isAndroid: /android/.test(userAgentLower),
      isMobile: /mobile|tablet|iphone|ipad|ipod|android/.test(userAgentLower),
      supportsWebXR: false,
      supportsARKit: false,
      supportsARCore: false,
      userAgent: ua,
      platform: /iphone|ipad|ipod/.test(userAgentLower) ? 'ios' 
               : /android/.test(userAgentLower) ? 'android'
               : /mobile|tablet/.test(userAgentLower) ? 'unknown'
               : 'desktop'
    }

    return DeviceInfoSchema.parse(deviceInfo)
  },

  /**
   * Get model URLs for an item (from backend API)
   */
  async getModelUrls(itemId: string): Promise<ArModelData> {
    if (!itemId) {
      throw new Error('Item ID is required')
    }

    try {
      // Use the backend AR models endpoint
      const response = await apiClient.get(`/ar/models/${itemId}`)
      
      if (response.data) {
        return {
          itemId,
          modelUrl: response.data.models.glb || '',
          iosModelUrl: response.data.models.usdz || '',
          previewImage: response.data.preview_image || '',
          arReady: response.data.ar_ready || false,
          itemName: response.data.item_name || ''
        }
      }
      
      throw new Error('Invalid response from AR models API')
    } catch (error) {
      console.error('Failed to get AR model URLs:', error)
      throw error
    }
  },

  /**
   * Start AR session (redirects to AR view)
   */
  async startArSession(itemId: string): Promise<void> {
    if (!itemId) {
      throw new Error('Item ID is required')
    }

    try {
      // Get device info - use arApi directly instead of this
      const deviceInfo = await arApi.getDeviceCapabilities()
      
      if (deviceInfo.isIOS || deviceInfo.isAndroid) {
        // Mobile devices: use backend AR start for platform detection
        window.location.href = `/ar-start/${itemId}`
          } else {
      // Desktop/other: go directly to AR view (no hash for Safari compatibility)
      window.location.href = `/ar/${itemId}`
    }
    } catch (error) {
      console.error('Failed to start AR session:', error)
      // Fallback to direct AR view (no hash for Safari compatibility)
      window.location.href = `/ar/${itemId}`
    }
  },

  /**
   * Get AR session info from backend
   */
  async getArSessionInfo(itemId: string): Promise<any> {
    if (!itemId) {
      throw new Error('Item ID is required')
    }

    try {
      // Request JSON data from AR start endpoint
      const response = await apiClient.get(`/ar-start/${itemId}`, {
        headers: {
          'Accept': 'application/json'
        }
      })
      
      return response.data
    } catch (error) {
      console.error('Failed to get AR session info:', error)
      throw error
    }
  }
}

// Create standalone functions with proper bindings
export const getDeviceCapabilities = arApi.getDeviceCapabilities.bind(arApi)
export const getModelUrls = arApi.getModelUrls.bind(arApi)
export const getArSessionInfo = arApi.getArSessionInfo.bind(arApi)

// Special case for startArSession to avoid this binding issues
export async function startArSession(itemId: string): Promise<void> {
  if (!itemId) {
    throw new Error('Item ID is required')
  }

  try {
    console.log(`Starting AR session for item: ${itemId}`);
    
    // Cihaz tipini kontrol et
    const deviceInfo = await getDeviceCapabilities();
    
    if (deviceInfo.isIOS || deviceInfo.isAndroid) {
      // Use backend's AR start endpoint for mobile devices
      // Create full URL
      const baseUrl = window.location.origin;
      const arStartUrl = `${baseUrl}/ar-start/${itemId}`;
      
      console.log(`Mobile device detected. Redirecting to backend AR dispatcher: ${arStartUrl}`);
      window.location.href = arStartUrl;
    } else {
      // Masaüstü için doğrudan AR view sayfasına yönlendir
      // Direct URL kullan - Safari compatibility için
      console.log(`Desktop device detected. Redirecting to AR view directly`);
      window.location.href = `/ar/${itemId}`;
    }
  } catch (error) {
    console.error('Failed to start AR session:', error);
    
    // Fallback olarak doğrudan AR view'a yönlendir
    console.log(`Error occurred. Fallback to AR view`);
    window.location.href = `/ar/${itemId}`;
  }
}