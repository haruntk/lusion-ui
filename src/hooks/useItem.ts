import { useState, useEffect, useCallback, useMemo } from 'react'
import { itemsApi, ApiError, ValidationApiError } from '@/api'
import { ItemSchema, ItemDetailSchema, type Item, type ItemDetail } from '@/types/item.schema'

interface UseItemState {
  data: ItemDetail | null
  loading: boolean
  error: string | null
  lastFetch: Date | null
}

interface UseItemOptions {
  enabled?: boolean
  staleTime?: number
  retryOnError?: boolean
  maxRetries?: number
}

export interface UseItemReturn extends UseItemState {
  refetch: () => Promise<void>
  isNotFound: boolean
  isStale: boolean
  retry: () => Promise<void>
}

export interface UseItemOptions {
  enabled?: boolean
  staleTime?: number
  retryOnError?: boolean
  maxRetries?: number
}

export function useItem(
  itemId: string | undefined, 
  options: UseItemOptions = {}
): UseItemReturn {
  const { 
    enabled = true, 
    staleTime = 5 * 60 * 1000, // 5 minutes default
    retryOnError = true,
    maxRetries = 3
  } = options

  const [state, setState] = useState<UseItemState>({
    data: null,
    loading: enabled && !!itemId,
    error: null,
    lastFetch: null,
  })

  const [retryCount, setRetryCount] = useState(0)

  const fetchItem = useCallback(async (shouldRetry = false) => {
    if (!enabled || !itemId) {
      setState({
        data: null,
        loading: false,
        error: itemId ? null : 'No item ID provided',
        lastFetch: null,
      })
      return
    }

    // Validate item ID
    if (typeof itemId !== 'string' || !itemId.trim()) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Invalid item ID provided',
      }))
      return
    }

    try {
      setState(prev => ({ ...prev, loading: true, error: null }))
      
      // Try direct API first, fallback to findById for backward compatibility
      let item: ItemDetail | Item | null = null
      
      try {
        item = await itemsApi.getById(itemId.trim())
      } catch (directError) {
        // If direct fetch fails, try fallback method
        console.warn(`Direct item fetch failed for ID: ${itemId}, trying fallback`)
        item = await itemsApi.findById(itemId.trim())
      }

      // Validate the response if we got data
      let validatedItem: ItemDetail | null = null
      if (item) {
        try {
          validatedItem = ItemDetailSchema.parse(item)
        } catch (validationError) {
          // If validation fails, try with basic Item schema
          const basicItem = ItemSchema.parse(item)
          // Convert Item to ItemDetail format
          validatedItem = {
            ...basicItem,
            created_at: undefined,
            updated_at: undefined,
            tags: undefined,
            nutritional_info: undefined,
            availability: undefined,
          }
        }
      }

      setState({
        data: validatedItem,
        loading: false,
        error: validatedItem ? null : 'Item not found',
        lastFetch: new Date(),
      })

      // Reset retry count on success
      setRetryCount(0)

    } catch (error) {
      let errorMessage = 'Failed to fetch item'
      
      if (error instanceof ValidationApiError) {
        errorMessage = `Data validation error: ${error.validationErrors.map(e => e.message).join(', ')}`
      } else if (error instanceof ApiError) {
        switch (error.code) {
          case 'NOT_FOUND':
            errorMessage = 'Item not found'
            break
          case 'NETWORK_ERROR':
            errorMessage = 'Network connection failed'
            break
          default:
            errorMessage = error.message
        }
      } else if (error instanceof Error) {
        errorMessage = error.message
      }

      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }))

      // Retry logic
      if (shouldRetry && retryOnError && retryCount < maxRetries) {
        const delay = Math.min(1000 * Math.pow(2, retryCount), 10000) // Exponential backoff
        setTimeout(() => {
          setRetryCount(prev => prev + 1)
          fetchItem(true)
        }, delay)
      }
    }
  }, [enabled, itemId, retryOnError, maxRetries, retryCount])

  const retry = useCallback(async () => {
    setRetryCount(0)
    await fetchItem(true)
  }, [fetchItem])

  // Computed values
  const isNotFound = useMemo(() => 
    !state.loading && !state.data && state.error === 'Item not found',
    [state.loading, state.data, state.error]
  )

  const isStale = useMemo(() => {
    if (!state.lastFetch || !staleTime) return false
    return Date.now() - state.lastFetch.getTime() > staleTime
  }, [state.lastFetch, staleTime])

  // Initial fetch and refetch when itemId changes
  useEffect(() => {
    setRetryCount(0) // Reset retry count when itemId changes
    fetchItem(false)
  }, [fetchItem])

  return {
    ...state,
    refetch: () => fetchItem(false),
    isNotFound,
    isStale,
    retry,
  }
}
