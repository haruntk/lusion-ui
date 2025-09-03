import { apiClient } from './client'
import { 
  QrResponseSchema,
  QrScanEventSchema,
  validateQrGenerationRequest,
  type QrGenerationRequest,
  type QrResponse,
  type QrCodeMetadata,
  type QrScanEvent,
  type QrAnalytics
} from '@/types/qr.schema'

/**
 * QR Code API module
 * Handles QR code generation, validation, analytics, and management
 */
export const qrApi = {
  /**
   * Generate QR code for an item
   * POST /qr/generate/:itemId - Enhanced API endpoint
   * GET /qr/generate/:itemId - Also supports GET with query params
   */
  async generate(request: QrGenerationRequest): Promise<QrResponse> {
    const validatedRequest = validateQrGenerationRequest(request)
    
    try {
      // Use the updated API endpoint
      const apiResponse = await apiClient.post(`/qr/generate/${validatedRequest.itemId}`, {
        format: validatedRequest.format,
        size: validatedRequest.size,
        border: 4,
        error_correction: validatedRequest.errorCorrection,
      })

      if (apiResponse.data) {
                // Create full URLs
        const baseUrl = window.location.origin;
        const qrCodeUrl = apiResponse.data.qr_data.startsWith('data:') 
          ? apiResponse.data.qr_data  // Already a complete data URL
          : `${baseUrl}${apiResponse.data.qr_data}`;
        
        const response: QrResponse = {
          success: true,
          data: {
            qrCodeUrl: qrCodeUrl,
            arStartUrl: `${baseUrl}/ar-start/${validatedRequest.itemId}`,
            arViewUrl: `${baseUrl}/ar/${validatedRequest.itemId}`,
            itemId: validatedRequest.itemId,
            generatedAt: new Date().toISOString(),
            size: validatedRequest.size,
            format: apiResponse.data.format,
            downloadUrl: apiResponse.data.image_url ? `${baseUrl}${apiResponse.data.image_url}` : undefined
          },
          message: 'QR code generated successfully'
        }
        
        return QrResponseSchema.parse(response)
      }
      
      throw new Error('Invalid API response format')
    } catch (error) {
      console.error('Error generating QR code:', error)
      
      // Fallback to direct image URL
      const baseUrl = window.location.origin;
      const qrUrl = `${baseUrl}${this.getQrCodeUrl(validatedRequest.itemId)}`;
      
      const response: QrResponse = {
        success: true,
        data: {
          qrCodeUrl: qrUrl,
          arStartUrl: `${baseUrl}/ar-start/${validatedRequest.itemId}`,
          arViewUrl: `${baseUrl}/ar/${validatedRequest.itemId}`,
          itemId: validatedRequest.itemId,
          generatedAt: new Date().toISOString(),
          size: validatedRequest.size,
          format: validatedRequest.format,
        },
        message: 'QR code generated via direct image URL'
      }
      
      return QrResponseSchema.parse(response)
    }
  },

  /**
   * Get QR code for an item (uses updated API endpoint)
   * GET /qr/:itemId - Returns PNG image directly
   */
  async getQrCode(itemId: string): Promise<Blob> {
    if (!itemId) {
      throw new Error('Item ID is required')
    }

    try {
      // Try the direct endpoint for blob response (image)
      const response = await apiClient.get(`/qr/${itemId}`, {
        responseType: 'blob',
        headers: {
          'Accept': 'image/png'
        }
      })
      
      return response.data
    } catch (error) {
      console.error('Error fetching QR code image:', error)
      throw new Error('Failed to fetch QR code image')
    }
  },

  /**
   * Get QR code URL (for img src)
   */
  getQrCodeUrl(itemId: string): string {
    if (!itemId) {
      throw new Error('Item ID is required')
    }

    // Return the direct image URL endpoint path with origin
    const baseUrl = window.location.origin
    return `${baseUrl}/qr/${itemId}`
  },

  /**
   * Get QR code metadata (placeholder - backend doesn't support this yet)
   */
  async getMetadata(itemId: string): Promise<QrCodeMetadata | null> {
    if (!itemId) {
      throw new Error('Item ID is required')
    }

    // Placeholder since backend doesn't have metadata endpoint
    // Return null to indicate no metadata available
    return null
  },

  /**
   * Track QR code scan event (uses new API with fallback)
   */
  async trackScan(event: QrScanEvent): Promise<{ success: boolean; scanId?: string }> {
    const validatedEvent = QrScanEventSchema.parse(event)
    
    try {
      // Try new tracking API endpoint
      const response = await apiClient.post(`/qr/track/${validatedEvent.itemId}`, {
        scanned_at: validatedEvent.scannedAt,
        user_agent: navigator.userAgent,
        referrer: document.referrer
      })

      if (response.data && response.data.success) {
        return { 
          success: true, 
          scanId: response.data.scan_id 
        }
      }
    } catch (error) {
      console.warn('QR tracking API not available, using local tracking:', error)
    }

    // Fallback to local console logging
    console.log('QR Scan Event (local):', validatedEvent)
    
    return { 
      success: true, 
      scanId: `local_${validatedEvent.itemId}_${Date.now()}` 
    }
  },

  /**
   * Get QR code analytics (uses new API with fallback)
   */
  async getAnalytics(itemId: string): Promise<QrAnalytics | null> {
    if (!itemId) {
      throw new Error('Item ID is required')
    }

    try {
      // Try new analytics API endpoint
      const response = await apiClient.get(`/qr/analytics/${itemId}`)
      
      if (response.data) {
        // Merge with default values
        const analyticsData = {
          itemId: itemId,
          totalScans: response.data.totalScans || 0,
          uniqueScans: response.data.uniqueScans || 0,
          arLaunches: response.data.arLaunches || 0,
          conversionRate: response.data.conversionRate || 0,
          topDevices: response.data.topDevices || [],
          scansByDate: response.data.scansByDate || [],
          peakHours: response.data.peakHours || []
        };
        
        return analyticsData;
      }
    } catch (error) {
      console.warn('QR analytics API not available:', error)
    }

    // Return default analytics data if API is unavailable or error occurs
    return {
      itemId: itemId,
      totalScans: 0,
      uniqueScans: 0,
      arLaunches: 0,
      conversionRate: 0,
      topDevices: [],
      scansByDate: [],
      peakHours: []
    };
  },

  /**
   * Download QR code
   */
  async download(itemId: string, filename?: string): Promise<void> {
    try {
      console.log(`Downloading QR code for item: ${itemId}`);
      
      // First, try to get the QR code as base64
      const qrResponse = await this.generate({
        itemId,
        size: 800, // Larger size
        format: 'png',
        errorCorrection: 'H', // High error correction
        margin: 4,
        foregroundColor: '#000000',
        backgroundColor: '#FFFFFF'
      });
      
      if (qrResponse && qrResponse.data && qrResponse.data.qrCodeUrl) {
        console.log('QR code generated successfully, attempting download');
        
        // If base64 data URL exists, create direct download link
        if (qrResponse.data.qrCodeUrl.startsWith('data:')) {
          const link = document.createElement('a');
          link.href = qrResponse.data.qrCodeUrl;
          link.download = filename || `qr-${itemId}.png`;
          document.body.appendChild(link);
          link.click();
          setTimeout(() => {
            document.body.removeChild(link);
          }, 100);
          return;
        }
      }
      
      // Fallback: Blob method
      console.log('Using fallback blob method for download');
      const blob = await this.getQrCode(itemId);
      
      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename || `qr-${itemId}.png`;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      
      // Delay cleanup
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 100);
    } catch (error) {
      console.error('Download error:', error);
      throw new Error('An error occurred while downloading the QR code. Please try again.');
    }
  },

  /**
   * Validate QR code (client-side basic validation)
   */
  async validate(qrData: string): Promise<{
    isValid: boolean
    itemId?: string
    itemName?: string
    arStartUrl?: string
    error?: string
  }> {
    if (!qrData) {
      throw new Error('QR data is required')
    }

    try {
      // Basic URL validation
      const url = new URL(qrData)
      
      // Check if it's an AR start URL
      const arStartMatch = url.pathname.match(/\/ar-start\/(.+)/)
      if (arStartMatch) {
        const itemId = arStartMatch[1]
        return {
          isValid: true,
          itemId,
          arStartUrl: qrData,
        }
      }

      // Check if it's an AR view URL
      const arViewMatch = url.searchParams.get('item_id')
      if (arViewMatch && url.pathname.includes('ar-view')) {
        return {
          isValid: true,
          itemId: arViewMatch,
          arStartUrl: `/ar-start/${arViewMatch}`,
        }
      }

      return {
        isValid: false,
        error: 'QR code does not contain a valid AR item link'
      }
    } catch {
      return {
        isValid: false,
        error: 'Invalid QR code data - not a valid URL'
      }
    }
  }
}

// Export individual functions for convenience
export const {
  generate: generateQrCode,
  getQrCode,
  getQrCodeUrl,
  getMetadata: getQrMetadata,
  trackScan: trackQrScan,
  getAnalytics: getQrAnalytics,
  download: downloadQrCode,
  validate: validateQrCode
} = qrApi

// Helper functions for QR code management
export const qrHelpers = {
  /**
   * Get AR start URL for an item
   */
  getArStartUrl(itemId: string): string {
    if (!itemId) return '';
    const baseUrl = window.location.origin
    return `${baseUrl}/ar-start/${itemId}`
  },

  /**
   * Get AR view URL for an item
   */
  getArViewUrl(itemId: string): string {
    if (!itemId) return '';
    const baseUrl = window.location.origin
    // Redirect directly to AR view endpoint (no hash for Safari compatibility)
    return `${baseUrl}/ar/${itemId}`
  },

  /**
   * Share QR code via Web Share API
   */
  async shareViaWebApi(itemId: string, itemName?: string): Promise<void> {
    if (!navigator.share) {
      throw new Error('Web Share API not supported')
    }

    const arUrl = this.getArStartUrl(itemId)
    
    await navigator.share({
      title: itemName ? `AR View: ${itemName}` : 'AR Experience',
      text: 'Check out this AR experience!',
      url: arUrl,
    })
  },

  /**
   * Copy QR code URL to clipboard
   */
  async copyToClipboard(itemId: string): Promise<void> {
    const arUrl = this.getArStartUrl(itemId)
    
    try {
      await navigator.clipboard.writeText(arUrl)
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = arUrl
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
    }
  },

  /**
   * Generate QR code with default settings
   */
  async generateDefault(itemId: string): Promise<QrResponse> {
    return await qrApi.generate({
      itemId,
      size: 400,
      format: 'png',
      errorCorrection: 'M',
      margin: 4,
      foregroundColor: '#000000',
      backgroundColor: '#FFFFFF'
    })
  }
}