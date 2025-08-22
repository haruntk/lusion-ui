import { useState, useEffect, useCallback, useMemo } from 'react'
import { itemsApi, ApiError, ValidationApiError } from '@/api'
import { ItemSchema, CategorySchema, ItemSearchParamsSchema, type Item, type Category, type ItemSearchParams } from '@/types/item.schema'
import { z } from 'zod'

interface UseItemsState {
  data: Item[]
  categories: Category[]
  loading: boolean
  error: string | null
  lastFetch: Date | null
}

interface UseItemsOptions {
  params?: ItemSearchParams
  enabled?: boolean
  refetchInterval?: number
  staleTime?: number
}

export interface UseItemsReturn extends UseItemsState {
  refetch: () => Promise<void>
  getItemsByCategory: (category: string) => Item[]
  searchItems: (query: string) => Item[]
  isEmpty: boolean
  isStale: boolean
}

export interface UseItemsOptions {
  params?: ItemSearchParams
  enabled?: boolean
  refetchInterval?: number
  staleTime?: number
}

export function useItems(options: UseItemsOptions = {}): UseItemsReturn {
  const { 
    params, 
    enabled = true, 
    refetchInterval,
    staleTime = 5 * 60 * 1000 // 5 minutes default
  } = options

  const [state, setState] = useState<UseItemsState>({
    data: [],
    categories: [],
    loading: enabled,
    error: null,
    lastFetch: null,
  })

  const fetchItems = useCallback(async () => {
    if (!enabled) return

    try {
      setState(prev => ({ ...prev, loading: true, error: null }))
      
      // Validate params if provided
      let validatedParams: ItemSearchParams | undefined
      if (params) {
        try {
          validatedParams = ItemSearchParamsSchema.parse(params)
        } catch (validationError) {
          throw new ValidationApiError('Invalid search parameters', 
            validationError instanceof z.ZodError 
              ? validationError.issues.map(err => ({
                  field: err.path.join('.'),
                  message: err.message,
                  value: err.input
                }))
              : [{ field: 'params', message: 'Invalid parameters', value: params }]
          )
        }
      }

      // Fetch items and categories in parallel
      const [items, categories] = await Promise.all([
        itemsApi.getAll(validatedParams),
        itemsApi.getCategories(),
      ])

      // Validate response data
      const validatedItems = z.array(ItemSchema).parse(items)

      setState({
        data: validatedItems,
        categories,
        loading: false,
        error: null,
        lastFetch: new Date(),
      })
    } catch (error) {
      let errorMessage = 'Failed to fetch items'
      
      if (error instanceof ValidationApiError) {
        errorMessage = `Validation error: ${error.validationErrors.map(e => e.message).join(', ')}`
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
  }, [enabled, JSON.stringify(params)]) // Use JSON.stringify to prevent object reference changes

  // Client-side filtering helpers
  const getItemsByCategory = useCallback((category: string): Item[] => {
    if (!category) return state.data
    return state.data.filter(item => item.category === category)
  }, [state.data])

  const searchItems = useCallback((query: string): Item[] => {
    if (!query || !query.trim()) return state.data
    
    const lowercaseQuery = query.toLowerCase().trim()
    return state.data.filter(item => 
      item.name.toLowerCase().includes(lowercaseQuery) ||
      item.description.toLowerCase().includes(lowercaseQuery) ||
      item.category.toLowerCase().includes(lowercaseQuery)
    )
  }, [state.data])

  // Computed values
  const isEmpty = useMemo(() => state.data.length === 0 && !state.loading, [state.data, state.loading])
  
  const isStale = useMemo(() => {
    if (!state.lastFetch || !staleTime) return false
    return Date.now() - state.lastFetch.getTime() > staleTime
  }, [state.lastFetch, staleTime])

  // Initial fetch - only run once when enabled changes
  useEffect(() => {
    console.log('useItems effect triggered:', { 
      enabled, 
      dataLength: state.data.length, 
      loading: state.loading, 
      error: state.error 
    })
    
    if (enabled && state.data.length === 0 && !state.loading && !state.error) {
      console.log('Starting initial fetch...')
      fetchItems()
    }
  }, [enabled]) // Remove fetchItems dependency to prevent infinite loops

  // Manual refetch function that doesn't cause re-renders
  const manualRefetch = useCallback(() => {
    fetchItems()
  }, [fetchItems])

  // Disable auto-refetch completely to prevent continuous requests
  // useEffect(() => {
  //   if (!refetchInterval || !enabled || refetchInterval < 60000) return
  //   const interval = setInterval(() => {
  //     if (!state.loading) {
  //       fetchItems()
  //     }
  //   }, refetchInterval)
  //   return () => clearInterval(interval)
  // }, [refetchInterval, enabled, state.loading, fetchItems])

  return {
    ...state,
    refetch: fetchItems,
    getItemsByCategory,
    searchItems,
    isEmpty,
    isStale,
  }
}
