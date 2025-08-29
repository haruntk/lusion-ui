import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sun, Moon, Monitor } from 'lucide-react'
import { useTheme } from '@/hooks/useTheme'
import { type Theme } from '@/contexts/ThemeContext'
import { Button } from './Button'
import { cn } from '@/utils'

interface ThemeToggleProps {
  variant?: 'default' | 'compact' | 'dropdown'
  className?: string
}

export function ThemeToggle({ variant = 'default', className }: ThemeToggleProps) {
  const { theme, setTheme, actualTheme } = useTheme()

  if (variant === 'compact') {
    return (
      <Button
        variant="ghost"
        size="icon"
        onClick={() => {
          const themes = ['light', 'dark', 'system'] as const
          const currentIndex = themes.indexOf(theme)
          const nextTheme = themes[(currentIndex + 1) % themes.length]
          setTheme(nextTheme)
        }}
        className={cn('relative h-9 w-9', className)}
        title={`Current theme: ${theme}. Click to cycle themes.`}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={actualTheme}
            initial={{ scale: 0, rotate: -180, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            exit={{ scale: 0, rotate: 180, opacity: 0 }}
            transition={{ duration: 0.3, type: "spring", stiffness: 200 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            {actualTheme === 'light' ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </motion.div>
        </AnimatePresence>
      </Button>
    )
  }

  if (variant === 'dropdown') {
    return (
      <div className={cn('flex items-center gap-1 p-1 bg-muted rounded-lg', className)}>
        {[
          { value: 'light', icon: Sun, label: 'Light' },
          { value: 'dark', icon: Moon, label: 'Dark' },
          { value: 'system', icon: Monitor, label: 'System' },
        ].map(({ value, icon: Icon, label }) => (
          <motion.button
            key={value}
            onClick={() => setTheme(value as Theme)}
            className={cn(
              'relative flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors',
              'hover:bg-background/50',
              theme === value
                ? 'text-foreground bg-background shadow-sm'
                : 'text-muted-foreground'
            )}
            whileTap={{ scale: 0.95 }}
            title={`Switch to ${label.toLowerCase()} theme`}
          >
            <Icon className="h-4 w-4" />
            <span className="hidden sm:inline">{label}</span>
            {theme === value && (
              <motion.div
                layoutId="activeTheme"
                className="absolute inset-0 bg-background rounded-md shadow-sm border"
                style={{ zIndex: -1 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
          </motion.button>
        ))}
      </div>
    )
  }

  // Default variant
  return (
    <div className={cn('flex items-center gap-1 p-1 bg-muted rounded-lg', className)}>
      {[
        { value: 'light', icon: Sun, label: 'Light' },
        { value: 'dark', icon: Moon, label: 'Dark' },
        { value: 'system', icon: Monitor, label: 'System' },
      ].map(({ value, icon: Icon, label }) => (
        <motion.button
          key={value}
          onClick={() => setTheme(value as Theme)}
          className={cn(
            'relative flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors',
            'hover:bg-background/80',
            theme === value
              ? 'text-foreground bg-background shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          )}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          title={`Switch to ${label.toLowerCase()} theme`}
        >
          <motion.div
            initial={false}
            animate={{
              rotate: theme === value ? 360 : 0,
              scale: theme === value ? 1.1 : 1,
            }}
            transition={{ duration: 0.3, type: "spring", stiffness: 200 }}
          >
            <Icon className="h-4 w-4" />
          </motion.div>
          <span>{label}</span>
          
          {theme === value && (
            <motion.div
              layoutId="activeTheme"
              className="absolute inset-0 bg-background rounded-md shadow-sm border"
              style={{ zIndex: -1 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
          )}
        </motion.button>
      ))}
    </div>
  )
}

// Simple theme indicator for minimal UIs
export function ThemeIndicator({ className }: { className?: string }) {
  const { actualTheme } = useTheme()
  
  return (
    <div className={cn('flex items-center gap-2 text-sm text-muted-foreground', className)}>
      <motion.div
        key={actualTheme}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200 }}
      >
        {actualTheme === 'light' ? (
          <Sun className="h-3 w-3" />
        ) : (
          <Moon className="h-3 w-3" />
        )}
      </motion.div>
      <span className="capitalize">{actualTheme}</span>
    </div>
  )
}
