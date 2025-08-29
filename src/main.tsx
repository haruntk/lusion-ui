/* eslint-disable react-refresh/only-export-components */
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/globals.css'
import App from './App.tsx'

// StrictMode helps catch bugs but causes double-rendering in development
// This is expected behavior and helps identify side effects
// If you need to disable it for debugging, set VITE_DISABLE_STRICT_MODE=true
const isDevelopment = import.meta.env.DEV
const disableStrictMode = import.meta.env.VITE_DISABLE_STRICT_MODE === 'true'

function AppWrapper() {
  if (isDevelopment && !disableStrictMode) {
    // Enable StrictMode in development for better debugging (causes intentional double-renders)
    return (
      <StrictMode>
        <App />
      </StrictMode>
    )
  }
  
  // Production or StrictMode disabled
  return <App />
}

createRoot(document.getElementById('root')!).render(<AppWrapper />)
