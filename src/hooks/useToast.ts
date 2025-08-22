import * as React from "react"

// Toast Context Types
export interface ToastData {
  id: string
  title?: string
  description?: string
  variant?: "default" | "destructive" | "success" | "warning" | "info"
  duration?: number
}

export interface ToastOptions extends Omit<ToastData, 'id'> {
  id?: string
}

interface ToastContextType {
  toast: (options: ToastOptions) => void
  dismiss: (id: string) => void
}

export const ToastContext = React.createContext<ToastContextType | null>(null)

export function useToast() {
  const context = React.useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}
