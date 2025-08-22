import { z } from 'zod'
import { apiClient } from './client'
import { 
  QrGenerationRequestSchema,
  QrResponseSchema,
  QrCodeMetadataSchema,
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
   * Generate QR code for an item (uses existing Flask endpoint)
   * GET /qr/:itemId - Returns PNG image directly from Flask
   */
  async generate(request: QrGenerationRequest): Promise<QrResponse> {
    const validatedRequest = validateQrGenerationRequest(request)
    
    // Flask endpoint: GET /qr/<model_id> returns PNG image directly
    const qrUrl = this.getQrCodeUrl(validatedRequest.itemId, {
      size: validatedRequest.size,
      format: validatedRequest.format
    })
    
    const response: QrResponse = {
      success: true,
      data: {
        qrCodeUrl: qrUrl,
        arStartUrl: `/ar-start/${validatedRequest.itemId}`,  // Flask endpoint
        arViewUrl: `/ar-view/${validatedRequest.itemId}`,    // Flask endpoint  
        itemId: validatedRequest.itemId,
        generatedAt: new Date().toISOString(),
        size: validatedRequest.size,
        format: validatedRequest.format,
      },
      message: 'QR code generated successfully'
    }
    
    return QrResponseSchema.parse(response)
  },

  /**
   * Get QR code for an item (uses Flask endpoint)
   * GET /qr/:itemId - Returns PNG image directly
   */
  async getQrCode(itemId: string, options?: {
    size?: number
    format?: 'png' | 'jpg' | 'svg'
  }): Promise<Blob> {
    if (!itemId) {
      throw new Error('Item ID is required')
    }

    // Flask endpoint doesn't support query parameters for size/format
    // Just call the /qr/<model_id> endpoint directly  
    const response = await apiClient.get(`/qr/${itemId}`, {
      responseType: 'blob'
    })
    
    return response.data
  },

  /**
   * Get QR code URL (for img src) - points to Flask endpoint
   */
  getQrCodeUrl(itemId: string, options?: {
    size?: number
    format?: 'png' | 'jpg' | 'svg'
  }): string {
    if (!itemId) {
      throw new Error('Item ID is required')
    }

    // Flask endpoint: /qr/<model_id> (not under /api prefix)
    // Backend doesn't support size/format parameters
    return `/qr/${itemId}`
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
   * Track QR code scan event (placeholder - logs to console)
   */
  async trackScan(event: QrScanEvent): Promise<{ success: boolean }> {
    const validatedEvent = QrScanEventSchema.parse(event)
    
    // For now, just log to console since backend doesn't have scan tracking
    console.log('QR Scan Event:', validatedEvent)
    
    return { success: true }
  },

  /**
   * Get QR code analytics (placeholder)
   */
  async getAnalytics(itemId: string, dateRange?: {
    from: string
    to: string
  }): Promise<QrAnalytics | null> {
    if (!itemId) {
      throw new Error('Item ID is required')
    }

    // Placeholder data since backend doesn't have analytics
    return null
  },

  /**
   * Download QR code
   */
  async download(itemId: string, filename?: string, options?: {
    size?: number
    format?: 'png' | 'jpg' | 'svg'
  }): Promise<void> {
    const blob = await this.getQrCode(itemId, options)
    
    // Create download link
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename || `qr-${itemId}.${options?.format || 'png'}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
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
    } catch (error) {
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
    const baseUrl = window.location.origin
    return `${baseUrl}/ar-start/${itemId}`
  },

  /**
   * Get AR view URL for an item
   */
  getArViewUrl(itemId: string): string {
    const baseUrl = window.location.origin
    return `${baseUrl}/ar-view?item_id=${itemId}`
  },

  /**
   * Share QR code via Web Share API
   */
  async shareViaWebApi(itemId: string, itemName?: string): Promise<void> {
    if (!navigator.share) {
      throw new Error('Web Share API not supported')
    }

    const arUrl = this.getArStartUrl(itemId)
    
    try {
      await navigator.share({
        title: itemName ? `AR View: ${itemName}` : 'AR Experience',
        text: 'Check out this AR experience!',
        url: arUrl,
      })
    } catch (error) {
      // User cancelled or error occurred
      throw error
    }
  },

  /**
   * Copy QR code URL to clipboard
   */
  async copyToClipboard(itemId: string): Promise<void> {
    const arUrl = this.getArStartUrl(itemId)
    
    try {
      await navigator.clipboard.writeText(arUrl)
    } catch (error) {
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