import * as React from "react"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { AlertTriangle, RefreshCw, Home, Bug } from "lucide-react"
import { Button } from "@/components/ui"

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<ErrorFallbackProps>
}

interface ErrorFallbackProps {
  error: Error
  resetError: () => void
}

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorInfo?: React.ErrorInfo
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error caught by boundary:", error, errorInfo)
    
    // Log error details for debugging
    console.group("🚨 React Error Boundary")
    console.error("Error:", error.name, "-", error.message)
    console.error("Stack:", error.stack)
    console.error("Component Stack:", errorInfo.componentStack)
    console.groupEnd()

    this.setState({ errorInfo })

    // Set document title for accessibility
    document.title = "Application Error - Lusion AR Dining"
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
    // Reset document title
    document.title = "Lusion AR Dining"
  }

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback
        return (
          <FallbackComponent 
            error={this.state.error!} 
            resetError={this.resetError}
          />
        )
      }

      // Default error UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-destructive/5 px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="text-center p-8 max-w-2xl bg-background border border-border rounded-lg shadow-lg"
            role="alert"
            aria-live="assertive"
          >
            {/* Error Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="mb-6"
            >
              <AlertTriangle className="h-16 w-16 text-destructive mx-auto" aria-hidden="true" />
            </motion.div>

            {/* Error Content */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.3 }}
            >
              <h1 className="text-2xl md:text-3xl font-bold text-destructive mb-4">
                Oops! Something went wrong
              </h1>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                We encountered an unexpected error while loading the application. 
                This is usually temporary and can be resolved by refreshing the page.
              </p>
              
              {/* Error Details */}
              {this.state.error && (
                <details className="text-left mb-6 bg-muted/50 p-4 rounded-lg">
                  <summary className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                    <Bug className="inline h-4 w-4 mr-2" aria-hidden="true" />
                    Technical Details
                  </summary>
                  <div className="mt-3 space-y-2 text-sm font-mono">
                    <p><strong>Error:</strong> {this.state.error.name}</p>
                    <p><strong>Message:</strong> {this.state.error.message}</p>
                    {import.meta.env.DEV && this.state.error.stack && (
                      <div>
                        <strong>Stack Trace:</strong>
                        <pre className="mt-1 text-xs bg-background p-2 rounded border overflow-auto max-h-32">
                          {this.state.error.stack}
                        </pre>
                      </div>
                    )}
                  </div>
                </details>
              )}
            </motion.div>

            {/* Actions */}
            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.3 }}
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={this.resetError}
                  size="lg"
                  className="gap-2"
                >
                  <RefreshCw className="h-4 w-4" aria-hidden="true" />
                  Try Again
                </Button>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="gap-2"
                  onClick={() => window.location.href = '/'}
                >
                  <Home className="h-4 w-4" aria-hidden="true" />
                  Go Home
                </Button>
              </motion.div>
            </motion.div>

            {/* Help Text */}
            <motion.p
              className="mt-8 text-sm text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.3 }}
            >
              If this error persists, please{" "}
              <a 
                href="mailto:support@lusion.com" 
                className="text-primary hover:underline focus:underline focus:outline-none"
              >
                contact support
              </a>
              {" "}or try refreshing your browser.
            </motion.p>
          </motion.div>
        </div>
      )
    }

    return this.props.children
  }
}

// Custom Error Fallback Component
export function CustomErrorFallback({ error, resetError }: ErrorFallbackProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="min-h-screen flex items-center justify-center bg-background px-4"
    >
      <div className="text-center p-8 max-w-md border border-destructive/20 rounded-lg bg-destructive/5">
        <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" aria-hidden="true" />
        <h2 className="text-xl font-bold text-destructive mb-4">Component Error</h2>
        <p className="text-muted-foreground mb-4">{error.message}</p>
        <Button onClick={resetError} variant="outline" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Reset Component
        </Button>
      </div>
    </motion.div>
  )
}
