import { type AxiosResponse } from 'axios'
import { z } from 'zod'
import apiClient from './client'
import { 
  ApiError, 
  ValidationApiError,
  BaseApiResponseSchema 
} from '@/types'

/**
 * Helper function to unwrap data from API responses
 * Validates the response structure and extracts the data field
 */
export function getData<T>(response: AxiosResponse, dataSchema?: z.ZodType<T>): T {
  const responseData = response.data

  // For simple responses that don't follow the standard API format (like Flask's direct responses)
  if (dataSchema && !Object.prototype.hasOwnProperty.call(responseData, 'success')) {
    try {
      return dataSchema.parse(responseData)
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new ValidationApiError(
          'Invalid response data format',
          error.issues.map(err => ({
            field: err.path.join('.'),
            message: err.message,
            value: 'input' in err ? (err as { input: unknown }).input : undefined,
          }))
        )
      }
      throw new ApiError(
        'DATA_VALIDATION_ERROR',
        'Response data validation failed',
        response.status,
        error instanceof Error ? error.message : 'Unknown validation error'
      )
    }
  }

  // For standard API responses with success/data structure
  try {
    BaseApiResponseSchema.parse(responseData)
  } catch (error) {
    // If it doesn't match standard format but we have a schema, try direct parsing
    if (dataSchema) {
      try {
        return dataSchema.parse(responseData)
      } catch {
        throw new ApiError(
          'INVALID_RESPONSE_FORMAT',
          'Response does not match expected format',
          response.status,
          error instanceof Error ? error.message : 'Unknown validation error'
        )
      }
    }
    throw new ApiError(
      'INVALID_RESPONSE_FORMAT',
      'Response does not match expected API format',
      response.status,
      error instanceof Error ? error.message : 'Unknown validation error'
    )
  }

  // Check if response indicates success
  if (!responseData.success) {
    throw new ApiError(
      'API_ERROR',
      responseData.message || 'API request failed',
      response.status
    )
  }

  // Extract data field
  const data = responseData.data

  // Validate data with provided schema if available
  if (dataSchema) {
    try {
      return dataSchema.parse(data)
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new ValidationApiError(
          'Invalid response data format',
          error.issues.map(err => ({
            field: err.path.join('.'),
            message: err.message,
            value: 'input' in err ? (err as { input: unknown }).input : undefined,
          }))
        )
      }
      throw new ApiError(
        'DATA_VALIDATION_ERROR',
        'Response data validation failed',
        response.status,
        error instanceof Error ? error.message : 'Unknown validation error'
      )
    }
  }

  return data as T
}

/**
 * Helper function to make GET requests with automatic data extraction and validation
 */
export async function get<T>(
  url: string, 
  dataSchema?: z.ZodType<T>,
  config?: Parameters<typeof apiClient.get>[1]
): Promise<T> {
  const response = await apiClient.get(url, config)
  return getData(response, dataSchema)
}

/**
 * Helper function to make POST requests with automatic data extraction and validation
 */
export async function post<T>(
  url: string,
  data?: unknown,
  dataSchema?: z.ZodType<T>,
  config?: Parameters<typeof apiClient.post>[2]
): Promise<T> {
  const response = await apiClient.post(url, data, config)
  return getData(response, dataSchema)
}

/**
 * Helper function to make PUT requests with automatic data extraction and validation
 */
export async function put<T>(
  url: string,
  data?: unknown,
  dataSchema?: z.ZodType<T>,
  config?: Parameters<typeof apiClient.put>[2]
): Promise<T> {
  const response = await apiClient.put(url, data, config)
  return getData(response, dataSchema)
}

/**
 * Helper function to make PATCH requests with automatic data extraction and validation
 */
export async function patch<T>(
  url: string,
  data?: unknown,
  dataSchema?: z.ZodType<T>,
  config?: Parameters<typeof apiClient.patch>[2]
): Promise<T> {
  const response = await apiClient.patch(url, data, config)
  return getData(response, dataSchema)
}

/**
 * Helper function to make DELETE requests with automatic data extraction and validation
 */
export async function del<T>(
  url: string,
  dataSchema?: z.ZodType<T>,
  config?: Parameters<typeof apiClient.delete>[1]
): Promise<T> {
  const response = await apiClient.delete(url, config)
  return getData(response, dataSchema)
}

/**
 * Type-safe wrapper for raw axios responses when you need full response data
 */
export async function getRaw(
  url: string,
  config?: Parameters<typeof apiClient.get>[1]
): Promise<AxiosResponse> {
  return await apiClient.get(url, config)
}

/**
 * Health check endpoint
 */
export async function checkHealth(): Promise<{ status: string; message: string }> {
  try {
    const response = await apiClient.get('/healthz')
    return response.data
  } catch {
    // Return a default health response if endpoint fails
    return { status: 'unknown', message: 'Health check failed' }
  }
}

// Export the client for direct access when needed
export { apiClient }

// Re-export error classes for convenience
export { ApiError, ValidationApiError }
