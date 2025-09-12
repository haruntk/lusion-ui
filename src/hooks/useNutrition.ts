import { useState, useEffect, useCallback } from 'react'
import { nutritionApi } from '@/api/nutrition'
import { type NutritionFacts } from '@/types/nutrition'

interface UseNutritionState {
  data: NutritionFacts | null
  loading: boolean
  error: string | null
}

export interface UseNutritionReturn extends UseNutritionState {
  refetch: () => Promise<void>
}

export interface UseNutritionOptions {
  enabled?: boolean
}

export function useNutrition(
  itemId: string | undefined,
  options: UseNutritionOptions = {}
): UseNutritionReturn {
  const { enabled = true } = options

  const [state, setState] = useState<UseNutritionState>({
    data: null,
    loading: enabled && !!itemId,
    error: null,
  })

  const fetchNutrition = useCallback(async () => {
    if (!enabled || !itemId) {
      setState({
        data: null,
        loading: false,
        error: itemId ? null : 'No item ID provided',
      })
      return
    }

    try {
      setState(prev => ({ ...prev, loading: true, error: null }))
      
      const nutrition = await nutritionApi.getNutritionFacts(itemId)
      
      setState({
        data: nutrition,
        loading: false,
        error: null,
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch nutrition facts'
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }))
    }
  }, [enabled, itemId])

  // Fetch when itemId changes
  useEffect(() => {
    fetchNutrition()
  }, [fetchNutrition])

  return {
    ...state,
    refetch: fetchNutrition,
  }
}
