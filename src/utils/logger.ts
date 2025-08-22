export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogContext {
  [key: string]: unknown
}

class Logger {
  private isDevelopment: boolean
  private enabledLevels: Set<LogLevel>

  constructor() {
    this.isDevelopment = import.meta.env.DEV
    this.enabledLevels = new Set(['error', 'warn'])
    
    if (this.isDevelopment) {
      this.enabledLevels.add('info').add('debug')
    }
  }

  private log(level: LogLevel, message: string, context?: LogContext): void {
    if (!this.enabledLevels.has(level)) return

    const timestamp = new Date().toISOString()
    const prefix = `[${timestamp}] ${level.toUpperCase()}`

    switch (level) {
      case 'debug':
        console.debug(prefix, message, context || '')
        break
      case 'info':
        console.info(prefix, message, context || '')
        break
      case 'warn':
        console.warn(prefix, message, context || '')
        break
      case 'error':
        console.error(prefix, message, context || '')
        break
    }
  }

  debug(message: string, context?: LogContext): void {
    this.log('debug', message, context)
  }

  info(message: string, context?: LogContext): void {
    this.log('info', message, context)
  }

  warn(message: string, context?: LogContext): void {
    this.log('warn', message, context)
  }

  error(message: string, context?: LogContext): void {
    this.log('error', message, context)
  }

  // API specific logging
  apiRequest(method: string, url: string, context?: LogContext): void {
    this.debug(`API ${method.toUpperCase()} ${url}`, context)
  }

  apiResponse(method: string, url: string, status: number, context?: LogContext): void {
    this.debug(`API ${status} ${method.toUpperCase()} ${url}`, context)
  }

  apiError(method: string, url: string, error: unknown): void {
    this.error(`API ERROR ${method.toUpperCase()} ${url}`, { error })
  }
}

export const logger = new Logger()
