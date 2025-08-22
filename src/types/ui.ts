import { type ReactNode } from 'react'

// Common UI Props
export interface BaseProps {
  className?: string
  children?: ReactNode
}

// Button Variants
export type ButtonVariant = 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
export type ButtonSize = 'default' | 'sm' | 'lg' | 'icon'

// Toast Types
export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface ToastMessage {
  id: string
  type: ToastType
  title: string
  description?: string
  duration?: number
}

// Loading States
export type LoadingState = 'idle' | 'loading' | 'success' | 'error'

// Modal/Dialog Props
export interface DialogProps extends BaseProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  description?: string
}

// Form States
export interface FormFieldProps extends BaseProps {
  label?: string
  error?: string
  required?: boolean
  disabled?: boolean
}

// Navigation Item
export interface NavItem {
  label: string
  href: string
  icon?: ReactNode
  active?: boolean
  disabled?: boolean
}
