import { useState, useEffect, useCallback } from 'react'
import { startArSession, getDeviceCapabilities } from '@/api/ar'
import { type DeviceInfo } from '@/types/ar.schema'

interface UseArSessionOptions {
  itemId?: string
  enabled?: boolean
}

interface UseArSessionReturn {
  deviceInfo: DeviceInfo | null
  loading: boolean
  error: string | null
  startAr: () => void
}

/**
 * Simplified AR hook that delegates all AR functionality to the backend
 */
export function useArSession(options: UseArSessionOptions = {}): UseArSessionReturn {
  const { 
    itemId,
    enabled = true
  } = options

  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  // Get basic device info
  useEffect(() => {
    if (!enabled) return

    const detectDevice = async () => {
      try {
        setLoading(true)
        const info = await getDeviceCapabilities()
        setDeviceInfo(info)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to detect device')
      } finally {
        setLoading(false)
      }
    }

    detectDevice()
  }, [enabled])

  // Start AR session by redirecting to backend
  const startAr = useCallback(() => {
    if (!itemId) {
      setError('Item ID is required to start AR')
      return
    }

    try {
      // This will redirect to the backend AR start endpoint
      startArSession(itemId)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start AR session')
    }
  }, [itemId])

  return {
    deviceInfo,
    loading,
    error,
    startAr
  }
}