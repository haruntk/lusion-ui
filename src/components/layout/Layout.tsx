import * as React from "react"
import { Outlet, useLocation } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { Navbar } from "./Navbar"
import { Footer } from "./Footer"

// Page transition variants (opacity-only to avoid vertical jank)
const pageVariants = {
  initial: {
    opacity: 0,
  },
  in: {
    opacity: 1,
  },
  out: {
    opacity: 0,
  },
}

const pageTransition = {
  duration: 0.25,
}

export function Layout() {
  const location = useLocation()
  const [isNavigating, setIsNavigating] = React.useState(false)

  // Handle navigation state changes
  React.useEffect(() => {
    // Skip navigation state for home page to avoid loading issues
    if (location.pathname === '/') {
      setIsNavigating(false)
      return
    }
    
    setIsNavigating(true)
    const timer = setTimeout(() => {
      setIsNavigating(false)
    }, 200)

    return () => clearTimeout(timer)
  }, [location.pathname])

  // Always scroll to top on route change to prevent perceived downward shift
  React.useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [location.pathname])

  // Debug navigation in development
  React.useEffect(() => {
    if (import.meta.env.DEV) {
      // Navigation tracking is handled by RouteDebugger component
      // No need for additional logging here
    }
  }, [location.pathname])

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 relative">
        <AnimatePresence mode="sync" onExitComplete={() => setIsNavigating(false)}>
          <motion.div
            key={location.pathname}
            initial={location.pathname === '/' ? "in" : "initial"}
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
            className="w-full min-h-full"
          >
            {/* Fallback loading state during navigation - skip for home page */}
            {isNavigating && location.pathname !== '/' && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading...</p>
                </div>
              </div>
            )}
            
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <React.Suspense 
                fallback={
                  <div className="flex items-center justify-center min-h-[50vh]">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                      <p className="text-muted-foreground">Loading page...</p>
                    </div>
                  </div>
                }
              >
                <Outlet />
              </React.Suspense>
            </div>
          </motion.div>
        </AnimatePresence>
      </main>
      
      <Footer />
    </div>
  )
}
