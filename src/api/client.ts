import axios, { type AxiosResponse, type AxiosError } from 'axios'
import { ApiError, ValidationApiError, type ErrorResponse, type ValidationError } from '@/types'
import { logger } from '@/utils/logger'

// Get API base URL from environment variables
// Priority: VITE_API_URL > VITE_API_BASE > fallback to /api
// For development with Flask backend, use relative path to avoid CORS issues
const API_BASE_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE || (
  import.meta.env.DEV ? '/api' : '/api'
)

// Create axios instance with default config
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
})

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Add request ID for tracking
    const requestId = Math.random().toString(36).substr(2, 9)
    config.headers['X-Request-ID'] = requestId
    
    // Add client version if available
    if (import.meta.env.VITE_APP_VERSION) {
      config.headers['X-Client-Version'] = import.meta.env.VITE_APP_VERSION
    }

    // Log request
    logger.apiRequest(config.method?.toUpperCase() || 'UNKNOWN', config.url || '', {
      requestId,
      params: config.params,
      data: config.data,
    })

    return config
  },
  (error) => {
    logger.error('API Request Error', { error })
    return Promise.reject(error)
  }
)

// Response interceptor
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log successful response
    logger.apiResponse(
      response.config.method?.toUpperCase() || 'UNKNOWN',
      response.config.url || '',
      response.status,
      {
        requestId: response.config.headers['X-Request-ID'],
        data: response.data,
      }
    )

    return response
  },
  (error: AxiosError) => {
    const response = error.response
    const requestId = error.config?.headers?.['X-Request-ID']

    // Log error details
    logger.apiError(
      error.config?.method?.toUpperCase() || 'UNKNOWN',
      error.config?.url || '',
      {
        status: response?.status,
        statusText: response?.statusText,
        requestId,
        data: response?.data,
        message: error.message,
      }
    )

    // Transform axios errors to typed API errors
    if (response?.data) {
      try {
        // Try to parse as validation error first
        const responseData = response.data as Record<string, unknown>
        if (response.status === 422 && 
            responseData.error && 
            typeof responseData.error === 'object' && 
            responseData.error !== null &&
            'code' in responseData.error && 
            responseData.error.code === 'VALIDATION_ERROR') {
          const validationError = response.data as ValidationError
          throw ValidationApiError.fromValidationError(validationError)
        }

        // Parse as general error response
        const errorResponse = response.data as ErrorResponse
        if (errorResponse.error) {
          throw ApiError.fromErrorResponse(errorResponse)
        }
      } catch (parseError) {
        // If parsing fails, create generic error
        if (parseError instanceof ApiError || parseError instanceof ValidationApiError) {
          throw parseError
        }
      }
    }

    // Create generic API error for network/unknown errors
    const apiError = new ApiError(
      error.code || 'NETWORK_ERROR',
      error.message || 'An unexpected error occurred',
      response?.status,
      response?.statusText
    )

    throw apiError
  }
)

export default apiClient
