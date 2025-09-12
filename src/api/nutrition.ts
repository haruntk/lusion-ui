import { apiClient } from './client'
import { type NutritionFacts } from '@/types/nutrition'

export const nutritionApi = {
  /**
   * Get nutrition facts for a menu item
   * GET /api/menu/:id/nutrition
   */
  async getNutritionFacts(itemId: string): Promise<NutritionFacts | null> {
    if (!itemId || typeof itemId !== 'string') {
      throw new Error('Item ID is required and must be a string')
    }

    try {
      const response = await apiClient.get(`/menu/${itemId}/nutrition`)
      if (response.data) {
        // Validate response structure
        const data = response.data
        if (
          typeof data.calories === 'number' &&
          typeof data.protein === 'number' &&
          typeof data.carbs === 'number' &&
          typeof data.fat === 'number'
        ) {
          return data as NutritionFacts
        }
      }
      return null
    } catch (error) {
      console.error(`Error fetching nutrition facts for item ${itemId}:`, error)
      return null
    }
  }
}

export const { getNutritionFacts } = nutritionApi
