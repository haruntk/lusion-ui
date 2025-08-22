import { z } from 'zod'

// Base API Response Schema
export const BaseApiResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  timestamp: z.string().datetime().optional(),
  requestId: z.string().optional(),
})

// Generic API Response with Data
export const ApiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  BaseApiResponseSchema.extend({
    data: dataSchema,
  })

// Paginated Response Schema
export const PaginatedResponseSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  BaseApiResponseSchema.extend({
    data: z.array(itemSchema),
    pagination: z.object({
      page: z.number().int().min(1),
      limit: z.number().int().min(1).max(100),
      total: z.number().int().min(0),
      totalPages: z.number().int().min(0),
      hasNextPage: z.boolean(),
      hasPrevPage: z.boolean(),
    }),
  })

// Error Response Schema
export const ErrorResponseSchema = z.object({
  success: z.literal(false),
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.string().optional(),
    field: z.string().optional(), // for validation errors
    timestamp: z.string().datetime(),
  }),
  requestId: z.string().optional(),
})

// Validation Error Schema
export const ValidationErrorSchema = z.object({
  success: z.literal(false),
  error: z.object({
    code: z.literal('VALIDATION_ERROR'),
    message: z.string(),
    details: z.array(z.object({
      field: z.string(),
      message: z.string(),
      value: z.unknown().optional(),
    })),
    timestamp: z.string().datetime(),
  }),
  requestId: z.string().optional(),
})

// API Request Headers Schema
export const ApiRequestHeadersSchema = z.object({
  'Content-Type': z.string().default('application/json'),
  'Accept': z.string().default('application/json'),
  'User-Agent': z.string().optional(),
  'Authorization': z.string().optional(),
  'X-Request-ID': z.string().optional(),
  'X-Client-Version': z.string().optional(),
})

// API Configuration Schema
export const ApiConfigSchema = z.object({
  baseUrl: z.string().url(),
  timeout: z.number().int().min(1000).default(10000), // milliseconds
  retries: z.number().int().min(0).max(5).default(3),
  headers: ApiRequestHeadersSchema.partial().optional(),
  auth: z.object({
    type: z.enum(['bearer', 'basic', 'apikey']),
    token: z.string(),
  }).optional(),
})

// HTTP Status Codes
export const HttpStatusSchema = z.union([
  z.literal(200), // OK
  z.literal(201), // Created
  z.literal(204), // No Content
  z.literal(400), // Bad Request
  z.literal(401), // Unauthorized
  z.literal(403), // Forbidden
  z.literal(404), // Not Found
  z.literal(409), // Conflict
  z.literal(422), // Unprocessable Entity
  z.literal(429), // Too Many Requests
  z.literal(500), // Internal Server Error
  z.literal(502), // Bad Gateway
  z.literal(503), // Service Unavailable
  z.literal(504), // Gateway Timeout
])

// API Endpoint Schema
export const ApiEndpointSchema = z.object({
  method: z.enum(['GET', 'POST', 'PUT', 'PATCH', 'DELETE']),
  path: z.string(),
  description: z.string().optional(),
  parameters: z.object({
    path: z.record(z.string()).optional(),
    query: z.record(z.unknown()).optional(),
    body: z.unknown().optional(),
  }).optional(),
  responses: z.record(z.unknown()).optional(),
  auth: z.boolean().default(false),
  rateLimit: z.object({
    requests: z.number().int().min(1),
    window: z.number().int().min(1), // seconds
  }).optional(),
})

// API Rate Limit Schema
export const RateLimitSchema = z.object({
  limit: z.number().int().min(1),
  remaining: z.number().int().min(0),
  reset: z.number().int().min(0), // Unix timestamp
  retryAfter: z.number().int().min(0).optional(), // seconds
})

// API Metrics Schema
export const ApiMetricsSchema = z.object({
  endpoint: z.string(),
  method: z.string(),
  statusCode: z.number().int(),
  responseTime: z.number().min(0), // milliseconds
  timestamp: z.string().datetime(),
  userAgent: z.string().optional(),
  ip: z.string().optional(),
  userId: z.string().optional(),
  requestSize: z.number().int().min(0).optional(), // bytes
  responseSize: z.number().int().min(0).optional(), // bytes
})

// Type exports
export type BaseApiResponse = z.infer<typeof BaseApiResponseSchema>
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>
export type ValidationError = z.infer<typeof ValidationErrorSchema>
export type ApiRequestHeaders = z.infer<typeof ApiRequestHeadersSchema>
export type ApiConfig = z.infer<typeof ApiConfigSchema>
export type HttpStatus = z.infer<typeof HttpStatusSchema>
export type ApiEndpoint = z.infer<typeof ApiEndpointSchema>
export type RateLimit = z.infer<typeof RateLimitSchema>
export type ApiMetrics = z.infer<typeof ApiMetricsSchema>

// Generic types for API responses
export type ApiResponse<T> = BaseApiResponse & { data: T }
export type PaginatedResponse<T> = z.infer<ReturnType<typeof PaginatedResponseSchema<z.ZodType<T>>>>

// Validation helpers
export const validateApiResponse = <T>(dataSchema: z.ZodType<T>) => {
  return (data: unknown): ApiResponse<T> => {
    return ApiResponseSchema(dataSchema).parse(data)
  }
}

export const validateErrorResponse = (data: unknown): ErrorResponse => {
  return ErrorResponseSchema.parse(data)
}

export const validateApiConfig = (data: unknown): ApiConfig => {
  return ApiConfigSchema.parse(data)
}

// API Error Classes
export class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode?: number,
    public details?: string,
    public field?: string
  ) {
    super(message)
    this.name = 'ApiError'
  }

  static fromErrorResponse(response: ErrorResponse): ApiError {
    return new ApiError(
      response.error.code,
      response.error.message,
      undefined,
      response.error.details,
      response.error.field
    )
  }
}

export class ValidationApiError extends ApiError {
  constructor(
    message: string,
    public validationErrors: ValidationError['error']['details']
  ) {
    super('VALIDATION_ERROR', message)
    this.name = 'ValidationApiError'
  }

  static fromValidationError(response: ValidationError): ValidationApiError {
    return new ValidationApiError(
      response.error.message,
      response.error.details
    )
  }
}
