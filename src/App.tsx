import * as React from 'react'
import { BrowserRouter as Router, useLocation } from 'react-router-dom'
import { AppRoutes } from '@/routes'
import { ToastProvider } from '@/components/ui'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { RouteDebugger } from '@/components/RouteDebugger'
import { ThemeProvider } from '@/contexts/ThemeContext'
import './App.css'

// Navigation Monitor Component to handle navigation issues
// This component must be used inside a Router
const NavigationMonitor = () => {
  try {
    const location = useLocation()
    const [lastGoodPath, setLastGoodPath] = React.useState('/')
    
    React.useEffect(() => {
      // Keep track of successful navigation
      const timer = setTimeout(() => {
        setLastGoodPath(location.pathname)
      }, 500) // Wait 500ms to ensure page loaded successfully
      
      return () => clearTimeout(timer)
    }, [location.pathname])

    // Debug info in development
    React.useEffect(() => {
      if (import.meta.env.DEV) {
        // Navigation tracking is handled by RouteDebugger component
        // No need for additional logging here
      }
    }, [location, lastGoodPath])

    return null
  } catch (error) {
    console.error('NavigationMonitor error:', error)
    return null
  }
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <Router future={{ v7_startTransition: true }}>
          <NavigationMonitor />
          {/* <RouteDebugger /> */}
          <ToastProvider>
            <AppRoutes />
          </ToastProvider>
        </Router>
      </ThemeProvider>
    </ErrorBoundary>
  )
}

export default App
