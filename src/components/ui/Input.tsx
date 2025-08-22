import * as React from "react"
import { type VariantProps } from "class-variance-authority"
import { Eye, EyeOff, AlertCircle, CheckCircle } from "lucide-react"
import { cn } from "@/utils"
import { inputVariants } from "./variants"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputVariants> {
  label?: string
  error?: string
  success?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  showPasswordToggle?: boolean
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className, 
    variant, 
    inputSize,
    type, 
    label,
    error,
    success,
    leftIcon,
    rightIcon,
    showPasswordToggle = false,
    id,
    ...props 
  }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false)
    const generatedId = React.useId()
    const inputId = id || generatedId
    
    const actualType = showPasswordToggle && type === "password" 
      ? (showPassword ? "text" : "password")
      : type

    // Determine variant based on validation state
    const inputVariant = error ? "error" : success ? "success" : variant

    const hasLeftContent = leftIcon
    const hasRightContent = rightIcon || showPasswordToggle || error || success

    return (
      <div className="space-y-2">
        {label && (
          <label 
            htmlFor={inputId}
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {label}
            {props.required && <span className="text-destructive ml-1">*</span>}
          </label>
        )}
        
        <div className="relative">
          {hasLeftContent && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {leftIcon}
            </div>
          )}
          
          <input
            type={actualType}
            className={cn(
              inputVariants({ variant: inputVariant, inputSize }),
              hasLeftContent && "pl-10",
              hasRightContent && "pr-10",
              className
            )}
            ref={ref}
            id={inputId}
            aria-invalid={error ? "true" : "false"}
            aria-describedby={
              error ? `${inputId}-error` : success ? `${inputId}-success` : undefined
            }
            {...props}
          />
          
          {hasRightContent && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center space-x-1">
              {error && (
                <AlertCircle className="h-4 w-4 text-destructive" aria-hidden="true" />
              )}
              {success && !error && (
                <CheckCircle className="h-4 w-4 text-green-500" aria-hidden="true" />
              )}
              {showPasswordToggle && type === "password" && (
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-sm"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              )}
              {rightIcon && !error && !success && (
                <span>{rightIcon}</span>
              )}
            </div>
          )}
        </div>
        
        {error && (
          <p 
            id={`${inputId}-error`}
            className="text-sm text-destructive flex items-center space-x-1"
            role="alert"
            aria-live="polite"
          >
            <AlertCircle className="h-3 w-3 flex-shrink-0" />
            <span>{error}</span>
          </p>
        )}
        
        {success && !error && (
          <p 
            id={`${inputId}-success`}
            className="text-sm text-green-600 flex items-center space-x-1"
            role="status"
            aria-live="polite"
          >
            <CheckCircle className="h-3 w-3 flex-shrink-0" />
            <span>{success}</span>
          </p>
        )}
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input }
