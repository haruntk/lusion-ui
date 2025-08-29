import * as React from "react"
import { useLocation, useNavigationType } from "react-router-dom"

/**
 * RouteDebugger - Development mode route debugging component
 * Shows navigation information in console and can display route info
 */
export function RouteDebugger() {
  try {
    const location = useLocation()
    const navigationType = useNavigationType()
    const [renderCount, setRenderCount] = React.useState(0)

    React.useEffect(() => {
      setRenderCount(prev => prev + 1)
    }, [location.pathname, location.search])

    React.useEffect(() => {
      if (import.meta.env.DEV) {
        console.group('🔍 Route Debug Info')
        console.log('📍 Current path:', location.pathname)
        console.log('🔗 Search params:', location.search)
        console.log('⚓ Hash:', location.hash)
        console.log('🧭 Navigation type:', navigationType)
        console.log('🔄 Render count:', renderCount)
        console.log('⏱️ Timestamp:', new Date().toLocaleTimeString())
        console.groupEnd()
      }
    }, [location, navigationType, renderCount])

    // Only render in development mode
    if (!import.meta.env.DEV) {
      return null
    }

    return (
      <div className="fixed bottom-4 left-4 z-50 bg-black/80 text-white text-xs p-2 rounded font-mono">
        <div>Path: {location.pathname}</div>
        <div>Renders: {renderCount}</div>
        <div>Type: {navigationType}</div>
      </div>
    )
  } catch (error) {
    console.error('RouteDebugger error:', error)
    return null
  }
}
