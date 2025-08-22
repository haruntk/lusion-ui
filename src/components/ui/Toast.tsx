import * as React from "react"
import { createPortal } from "react-dom"
import { motion, AnimatePresence } from "framer-motion"
import { type VariantProps } from "class-variance-authority"
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from "lucide-react"
import { cn } from "@/utils"
import { toastVariants } from "./variants"
import { ToastContext, type ToastOptions } from "@/hooks/useToast"

const iconMap = {
  success: CheckCircle,
  warning: AlertTriangle,
  destructive: AlertCircle,
  info: Info,
  default: Info,
}

export interface ToastProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof toastVariants> {
  title?: string
  description?: string
  onClose?: () => void
  duration?: number
}

function Toast({
  className,
  variant = "default",
  title,
  description,
  onClose,
  duration = 5000,
  ...props
}: ToastProps) {
  const [isVisible, setIsVisible] = React.useState(true)

  React.useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false)
        setTimeout(() => onClose?.(), 300) // Wait for exit animation
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [duration, onClose])

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(() => onClose?.(), 300)
  }

  const Icon = iconMap[variant || "default"]

  if (!isVisible) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.3 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
      className={cn(toastVariants({ variant }), className)}
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
      style={props.style}
      onClick={props.onClick}
      onMouseEnter={props.onMouseEnter}
      onMouseLeave={props.onMouseLeave}
    >
      <div className="flex items-start space-x-3">
        <Icon className="h-5 w-5 flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          {title && (
            <div className="text-sm font-semibold">{title}</div>
          )}
          {description && (
            <div className="text-sm opacity-90 mt-1">{description}</div>
          )}
        </div>
      </div>
      
      <button
        onClick={handleClose}
        className="flex-shrink-0 rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2 hover:bg-black/5 transition-colors"
        aria-label="Close notification"
      >
        <X className="h-4 w-4" />
      </button>
    </motion.div>
  )
}

// Toast Container Component
interface ToastContainerProps {
  children: React.ReactNode
  position?: "top-right" | "top-left" | "bottom-right" | "bottom-left" | "top-center" | "bottom-center"
}

function ToastContainer({ 
  children, 
  position = "top-right" 
}: ToastContainerProps) {
  const positionClasses = {
    "top-right": "top-4 right-4",
    "top-left": "top-4 left-4", 
    "bottom-right": "bottom-4 right-4",
    "bottom-left": "bottom-4 left-4",
    "top-center": "top-4 left-1/2 -translate-x-1/2",
    "bottom-center": "bottom-4 left-1/2 -translate-x-1/2",
  }

  return createPortal(
    <div
      className={cn(
        "fixed z-50 flex flex-col space-y-2 pointer-events-none",
        positionClasses[position]
      )}
      aria-live="polite"
      aria-label="Notifications"
    >
      <AnimatePresence>
        {children}
      </AnimatePresence>
    </div>,
    document.body
  )
}

// Toast Hook
interface ToastState {
  toasts: (ToastOptions & { id: string })[]
}

const toastReducer = (
  state: ToastState,
  action: 
    | { type: 'ADD_TOAST'; toast: ToastOptions & { id: string } }
    | { type: 'REMOVE_TOAST'; id: string }
): ToastState => {
  switch (action.type) {
    case 'ADD_TOAST':
      return {
        ...state,
        toasts: [...state.toasts, action.toast],
      }
    case 'REMOVE_TOAST':
      return {
        ...state,
        toasts: state.toasts.filter((toast) => toast.id !== action.id),
      }
    default:
      return state
  }
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = React.useReducer(toastReducer, { toasts: [] })

  const toast = React.useCallback((options: ToastOptions) => {
    const id = options.id || Math.random().toString(36).substr(2, 9)
    dispatch({
      type: 'ADD_TOAST',
      toast: { ...options, id },
    })
  }, [])

  const dismiss = React.useCallback((id: string) => {
    dispatch({ type: 'REMOVE_TOAST', id })
  }, [])

  return (
    <ToastContext.Provider value={{ toast, dismiss }}>
      {children}
      <ToastContainer>
        {state.toasts.map((toastProps) => (
          <Toast
            key={toastProps.id}
            {...toastProps}
            onClose={() => dismiss(toastProps.id)}
          />
        ))}
      </ToastContainer>
    </ToastContext.Provider>
  )
}

export { Toast, ToastContainer }