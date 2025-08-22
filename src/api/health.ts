import { z } from 'zod'
import { apiClient } from './client'

// Health check response schema
const HealthResponseSchema = z.object({
  status: z.string(),
})

export type HealthResponse = z.infer<typeof HealthResponseSchema>

/**
 * Health Check API module
 * Matches Flask backend endpoint: GET /healthz
 */
export const healthApi = {
  /**
   * Get health status from Flask backend
   * GET /healthz (Flask endpoint without /api prefix)
   */
  async check(): Promise<HealthResponse> {
    try {
      // Flask endpoint: GET /healthz (not under /api)
      const response = await apiClient.get('/healthz')
      const health = HealthResponseSchema.parse(response.data)
      return health
    } catch (error) {
      console.error('Health check failed:', error)
      throw error
    }
  },

  /**
   * Check if backend is reachable
   */
  async isBackendReachable(): Promise<boolean> {
    try {
      await this.check()
      return true
    } catch {
      return false
    }
  }
}

// Export individual functions for convenience
export const { check: checkHealth, isBackendReachable } = healthApi
