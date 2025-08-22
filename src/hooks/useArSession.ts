import { useState, useEffect, useCallback, useMemo } from 'react'
import { arApi, ApiError, ValidationApiError } from '@/api'
import { 
  ArSessionStateSchema, 
  ArLaunchPayloadSchema,
  type ArSessionState, 
  type ArLaunchPayload,
  type DeviceInfo 
} from '@/types/ar.schema'

interface UseArSessionState {
  data: ArSessionState | null
  deviceInfo: DeviceInfo | null
  loading: boolean
  error: string | null
  lastFetch: Date | null
}

interface UseArSessionOptions {
  itemId?: string
  enabled?: boolean
  autoDetectDevice?: boolean
  sessionConfig?: Partial<ArLaunchPayload>
}

interface UseArSessionReturn extends UseArSessionState {
  refetch: () => Promise<void>
  startSession: (payload: ArLaunchPayload) => Promise<void>
  endSession: () => Promise<void>
  checkSupport: () => Promise<boolean>
  getSessionStatus: (sessionId: string) => Promise<ArSessionState>
  generateLaunchUrl: (itemId: string) => string
  isSupported: boolean
  canStartAR: boolean
}

export function useArSession(options: UseArSessionOptions = {}): UseArSessionReturn {
  const { 
    itemId,
    enabled = true,
    autoDetectDevice = true,
    sessionConfig 
  } = options

  const [state, setState] = useState<UseArSessionState>({
    data: null,
    deviceInfo: null,
    loading: enabled && autoDetectDevice,
    error: null,
    lastFetch: null,
  })

  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null)

  // Fetch device capabilities
  const fetchDeviceInfo = useCallback(async () => {
    if (!enabled || !autoDetectDevice) return

    try {
      setState(prev => ({ ...prev, loading: true, error: null }))
      
      const deviceInfo = await arApi.getDeviceCapabilities()
      
      setState(prev => ({
        ...prev,
        deviceInfo,
        loading: false,
        lastFetch: new Date(),
      }))
    } catch (error) {
      let errorMessage = 'Failed to detect device capabilities'
      
      if (error instanceof ApiError) {
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
  }, [enabled, autoDetectDevice])

  // Start AR session (client-side simulation)
  const startSession = useCallback(async (payload: ArLaunchPayload) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }))
      
      // Validate payload
      ArLaunchPayloadSchema.parse(payload)
      
      // Create session state (client-side simulation since backend doesn't have session management)
      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      const sessionState: ArSessionState = {
        isSupported: true,
        isActive: true,
        isPaused: false,
        error: null,
        sessionId,
        startTime: new Date().toISOString(),
        duration: 0,
      }

      const validatedState = ArSessionStateSchema.parse(sessionState)
      
      setState(prev => ({
        ...prev,
        data: validatedState,
        loading: false,
      }))

      setCurrentSessionId(sessionId)

      // Track session start (client-side logging)
      await arApi.trackEvent({
        eventType: 'ar_session_start',
        itemId: payload.itemId,
        sessionId,
        timestamp: new Date().toISOString(),
        platform: state.deviceInfo?.platform === 'ios' ? 'ios' 
                 : state.deviceInfo?.platform === 'android' ? 'android' 
                 : 'web',
      })

    } catch (error) {
      let errorMessage = 'Failed to start AR session'
      
      if (error instanceof ValidationApiError) {
        errorMessage = `Invalid session payload: ${error.validationErrors.map(e => e.message).join(', ')}`
      } else if (error instanceof ApiError) {
        errorMessage = error.message
      } else if (error instanceof Error) {
        errorMessage = error.message
      }

      setState(prev => ({
        ...prev,
        data: prev.data ? { ...prev.data, isActive: false, error: errorMessage } : null,
        loading: false,
        error: errorMessage,
      }))
    }
  }, [state.deviceInfo])

  // End AR session (client-side)
  const endSession = useCallback(async () => {
    if (!currentSessionId) return

    try {
      setState(prev => ({ ...prev, loading: true, error: null }))
      
      // Track session end (client-side logging)
      if (state.data) {
        const duration = state.data.startTime 
          ? Date.now() - new Date(state.data.startTime).getTime()
          : 0

        await arApi.trackEvent({
          eventType: 'ar_session_end',
          itemId: itemId || 'unknown',
          sessionId: currentSessionId,
          timestamp: new Date().toISOString(),
          duration,
          platform: state.deviceInfo?.platform === 'ios' ? 'ios' 
                   : state.deviceInfo?.platform === 'android' ? 'android' 
                   : 'web',
        })
      }

      setState(prev => ({
        ...prev,
        data: prev.data ? { ...prev.data, isActive: false, isPaused: false } : null,
        loading: false,
      }))

      setCurrentSessionId(null)

    } catch (error) {
      let errorMessage = 'Failed to end AR session'
      
      if (error instanceof ApiError) {
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
  }, [currentSessionId, state.data, state.deviceInfo, itemId])

  // Check AR support
  const checkSupport = useCallback(async (): Promise<boolean> => {
    try {
      // Check if WebXR is available
      const xrNavigator = navigator as any
      if (!xrNavigator.xr) {
        return false
      }

      // Check if immersive AR is supported
      try {
        const isSupported = await xrNavigator.xr.isSessionSupported('immersive-ar')
        return Boolean(isSupported)
      } catch (xrError) {
        console.warn('WebXR AR session support check failed:', xrError)
        return false
      }
    } catch (error) {
      console.error('Failed to check AR support:', error)
      return false
    }
  }, [])

  // Get session status (client-side)
  const getSessionStatus = useCallback(async (sessionId: string): Promise<ArSessionState> => {
    // Since we don't have backend session management, return current state
    if (sessionId === currentSessionId && state.data) {
      return state.data
    }
    
    // Return default inactive state for unknown sessions
    const defaultState: ArSessionState = {
      isSupported: false,
      isActive: false,
      isPaused: false,
      error: 'Session not found',
      sessionId,
      startTime: undefined,
      duration: 0,
    }
    
    return ArSessionStateSchema.parse(defaultState)
  }, [currentSessionId, state.data])

  // Generate launch URL for platform
  const generateLaunchUrl = useCallback((targetItemId: string): string => {
    if (!state.deviceInfo) {
      return `/ar-view?item_id=${targetItemId}`
    }

    if (state.deviceInfo.isIOS) {
      return `/ios-ar-launcher?item_id=${targetItemId}`
    } else if (state.deviceInfo.isAndroid) {
      return `/android-ar?item_id=${targetItemId}`
    } else {
      return `/ar-view?item_id=${targetItemId}`
    }
  }, [state.deviceInfo])

  // Computed values
  const isSupported = useMemo(() => 
    state.deviceInfo?.supportsWebXR || state.deviceInfo?.supportsARKit || state.deviceInfo?.supportsARCore || false,
    [state.deviceInfo]
  )

  const canStartAR = useMemo(() => 
    isSupported && !state.loading && !state.data?.isActive,
    [isSupported, state.loading, state.data?.isActive]
  )

  // Initial device detection
  useEffect(() => {
    if (autoDetectDevice) {
      fetchDeviceInfo()
    }
  }, [fetchDeviceInfo, autoDetectDevice])

  // Auto-start session if itemId and sessionConfig provided
  useEffect(() => {
    if (itemId && sessionConfig && state.deviceInfo && !state.data?.isActive) {
      const payload: ArLaunchPayload = {
        itemId,
        modelUrl: '', // Will be fetched from API
        modelType: 'glb',
        fallbackUrl: window.location.href,
        metadata: {
          itemName: 'Unknown Item',
          itemDescription: '',
        },
        ...sessionConfig,
      }

      // Only auto-start if explicitly configured
      if (sessionConfig.launchParams?.autoStart) {
        startSession(payload)
      }
    }
  }, [itemId, sessionConfig, state.deviceInfo, state.data?.isActive, startSession])

  return {
    ...state,
    refetch: fetchDeviceInfo,
    startSession,
    endSession,
    checkSupport,
    getSessionStatus,
    generateLaunchUrl,
    isSupported,
    canStartAR,
  }
}
