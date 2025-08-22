import { useState, useEffect, useCallback, useMemo } from 'react'
import { qrApi, ApiError, ValidationApiError } from '@/api'
import { 
  QrResponseSchema,
  QrCodeMetadataSchema,
  QrAnalyticsSchema,
  type QrResponse,
  type QrCodeMetadata,
  type QrAnalytics,
  type QrGenerationRequest 
} from '@/types/qr.schema'

interface UseQrState {
  data: QrCodeMetadata | null
  qrUrl: string | null
  analytics: QrAnalytics | null
  loading: boolean
  error: string | null
  lastFetch: Date | null
}

interface UseQrOptions {
  itemId?: string
  enabled?: boolean
  includeAnalytics?: boolean
  autoGenerate?: boolean
  generationOptions?: Partial<QrGenerationRequest>
}

interface UseQrReturn extends UseQrState {
  refetch: () => Promise<void>
  generate: (options?: Partial<QrGenerationRequest>) => Promise<QrResponse>
  download: (filename?: string, options?: { size?: number; format?: 'png' | 'jpg' | 'svg' }) => Promise<void>
  share: (itemName?: string) => Promise<void>
  copyToClipboard: () => Promise<void>
  trackScan: () => Promise<void>
  getUrls: () => { qrUrl: string; arStartUrl: string; arViewUrl: string }
  canShare: boolean
  canCopy: boolean
}

export function useQr(options: UseQrOptions = {}): UseQrReturn {
  const { 
    itemId,
    enabled = true,
    includeAnalytics = false,
    autoGenerate = false,
    generationOptions
  } = options

  const [state, setState] = useState<UseQrState>({
    data: null,
    qrUrl: null,
    analytics: null,
    loading: enabled && !!itemId,
    error: null,
    lastFetch: null,
  })

  const fetchQrData = useCallback(async () => {
    if (!enabled || !itemId) {
      setState({
        data: null,
        qrUrl: null,
        analytics: null,
        loading: false,
        error: itemId ? null : 'No item ID provided',
        lastFetch: null,
      })
      return
    }

    try {
      setState(prev => ({ ...prev, loading: true, error: null }))
      
      // Fetch QR metadata and analytics in parallel if requested
      const promises = [
        qrApi.getMetadata(itemId).catch(() => null), // Metadata might not exist yet
      ]
      
      if (includeAnalytics) {
        promises.push(
          qrApi.getAnalytics(itemId).catch(() => null) // Analytics might not exist yet
        )
      }

      const [metadata, analytics] = await Promise.all(promises)

      // Validate metadata if we got it
      let validatedMetadata: QrCodeMetadata | null = null
      if (metadata) {
        validatedMetadata = QrCodeMetadataSchema.parse(metadata)
      }

      // Validate analytics if we got it
      let validatedAnalytics: QrAnalytics | null = null
      if (analytics) {
        validatedAnalytics = QrAnalyticsSchema.parse(analytics)
      }

      // Generate QR URL
      const qrUrl = qrApi.getQrCodeUrl(itemId, generationOptions)

      setState({
        data: validatedMetadata,
        qrUrl,
        analytics: validatedAnalytics,
        loading: false,
        error: null,
        lastFetch: new Date(),
      })

    } catch (error) {
      let errorMessage = 'Failed to fetch QR data'
      
      if (error instanceof ValidationApiError) {
        errorMessage = `QR data validation error: ${error.validationErrors.map(e => e.message).join(', ')}`
      } else if (error instanceof ApiError) {
        errorMessage = error.message
      } else if (error instanceof Error) {
        errorMessage = error.message
      }

      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }))
    }
  }, [enabled, itemId, includeAnalytics, generationOptions])

  // Generate QR code
  const generate = useCallback(async (options?: Partial<QrGenerationRequest>): Promise<QrResponse> => {
    if (!itemId) {
      throw new Error('Item ID is required to generate QR code')
    }

    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const request: QrGenerationRequest = {
        itemId,
        size: 400,
        format: 'png',
        errorCorrection: 'M',
        margin: 4,
        foregroundColor: '#000000',
        backgroundColor: '#FFFFFF',
        ...generationOptions,
        ...options,
      }

      const response = await qrApi.generate(request)
      const validatedResponse = QrResponseSchema.parse(response)

      // Refresh data after generation
      await fetchQrData()

      return validatedResponse
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate QR code'
      setState(prev => ({ ...prev, loading: false, error: errorMessage }))
      throw error
    }
  }, [itemId, generationOptions, fetchQrData])

  // Download QR code
  const download = useCallback(async (
    filename?: string, 
    options?: { size?: number; format?: 'png' | 'jpg' | 'svg' }
  ) => {
    if (!itemId) {
      throw new Error('Item ID is required to download QR code')
    }

    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      await qrApi.download(itemId, filename, options)
      setState(prev => ({ ...prev, loading: false }))
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to download QR code'
      setState(prev => ({ ...prev, loading: false, error: errorMessage }))
      throw error
    }
  }, [itemId])

  // Share QR code
  const share = useCallback(async (itemName?: string) => {
    if (!itemId) {
      throw new Error('Item ID is required to share QR code')
    }

    try {
      if (navigator.share) {
        const arUrl = qrApi.getArStartUrl ? qrApi.getArStartUrl(itemId) : `/ar-view?item_id=${itemId}`
        
        await navigator.share({
          title: itemName ? `AR View: ${itemName}` : 'AR Experience',
          text: 'Check out this AR experience!',
          url: arUrl,
        })
      } else {
        // Fallback to clipboard
        await copyToClipboard()
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        // User cancelled share, not an error
        return
      }
      throw error
    }
  }, [itemId])

  // Copy to clipboard
  const copyToClipboard = useCallback(async () => {
    if (!itemId) {
      throw new Error('Item ID is required to copy URL')
    }

    try {
      const arUrl = qrApi.getArStartUrl ? qrApi.getArStartUrl(itemId) : `/ar-view?item_id=${itemId}`
      await navigator.clipboard.writeText(arUrl)
    } catch (error) {
      // Fallback for older browsers
      const arUrl = qrApi.getArStartUrl ? qrApi.getArStartUrl(itemId) : `/ar-view?item_id=${itemId}`
      const textArea = document.createElement('textarea')
      textArea.value = arUrl
      textArea.style.position = 'fixed'
      textArea.style.opacity = '0'
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
    }
  }, [itemId])

  // Track QR scan
  const trackScan = useCallback(async () => {
    if (!itemId || !state.data) return

    try {
      await qrApi.trackScan({
        qrCodeId: state.data.qrCodeId,
        itemId,
        scannedAt: new Date().toISOString(),
        userAgent: navigator.userAgent,
        deviceInfo: {
          platform: /iphone|ipad|ipod/i.test(navigator.userAgent) ? 'ios' 
                   : /android/i.test(navigator.userAgent) ? 'android' 
                   : 'desktop',
          isMobile: /mobile|tablet|iphone|ipad|ipod|android/i.test(navigator.userAgent),
          supportsAR: 'xr' in navigator || /iphone|ipad|ipod|android/i.test(navigator.userAgent),
        },
      })
    } catch (error) {
      console.warn('Failed to track QR scan:', error)
      // Don't throw - tracking failures shouldn't break user experience
    }
  }, [itemId, state.data])

  // Get all relevant URLs
  const getUrls = useCallback(() => {
    if (!itemId) {
      return { qrUrl: '', arStartUrl: '', arViewUrl: '' }
    }

    return {
      qrUrl: state.qrUrl || qrApi.getQrCodeUrl(itemId),
      arStartUrl: qrApi.getArStartUrl ? qrApi.getArStartUrl(itemId) : `/ar-start/${itemId}`,
      arViewUrl: qrApi.getArViewUrl ? qrApi.getArViewUrl(itemId) : `/ar-view?item_id=${itemId}`,
    }
  }, [itemId, state.qrUrl])

  // Computed values
  const canShare = useMemo(() => 
    !!navigator.share || !!navigator.clipboard,
    []
  )

  const canCopy = useMemo(() => 
    !!navigator.clipboard || document.queryCommandSupported?.('copy'),
    []
  )

  // Initial fetch
  useEffect(() => {
    fetchQrData()
  }, [fetchQrData])

  // Auto-generate QR code if requested
  useEffect(() => {
    if (autoGenerate && itemId && !state.data && !state.loading && !state.error) {
      generate().catch(error => {
        console.warn('Auto-generation failed:', error)
      })
    }
  }, [autoGenerate, itemId, state.data, state.loading, state.error, generate])

  return {
    ...state,
    refetch: fetchQrData,
    generate,
    download,
    share,
    copyToClipboard,
    trackScan,
    getUrls,
    canShare,
    canCopy,
  }
}
