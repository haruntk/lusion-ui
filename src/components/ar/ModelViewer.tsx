import * as React from 'react'
import { useEffect, useRef, useState } from 'react'

// ModelViewer props interface
interface ModelViewerProps {
  src: string
  iosSrc?: string
  alt: string
  poster?: string
  loading?: 'auto' | 'lazy' | 'eager'
  reveal?: 'auto' | 'interaction' | 'manual'
  ar?: boolean
  arModes?: string
  arScale?: 'auto' | 'fixed'
  autoRotate?: boolean
  autoRotateDelay?: number
  autoplay?: boolean
  animationName?: string
  animationLoop?: boolean
  animationCrossfadeDuration?: number
  cameraControls?: boolean
  cameraOrbit?: string
  environmentImage?: string
  exposure?: number
  shadowIntensity?: number
  shadowSoftness?: number
  className?: string
  style?: React.CSSProperties
  onLoad?: () => void
  onError?: (event: any) => void
  onModelVisibility?: (event: any) => void
  onProgress?: (event: any) => void
  onArStatus?: (event: any) => void
  children?: React.ReactNode
}

/**
 * ModelViewer component - React wrapper for the model-viewer web component
 * 
 * Requires the model-viewer script to be loaded in the HTML:
 * <script type="module" src="https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js"></script>
 */
export function ModelViewer({
  src,
  iosSrc,
  alt,
  poster,
  loading = 'eager',
  reveal = 'auto',
  ar = true,
  arModes = 'webxr scene-viewer quick-look',
  arScale = 'auto',
  autoRotate = true,
  autoRotateDelay = 3000,
  autoplay = true,
  animationName,
  animationLoop = true,
  animationCrossfadeDuration = 300,
  cameraControls = true,
  cameraOrbit,
  environmentImage = 'neutral',
  exposure = 1.5,
  shadowIntensity = 1,
  shadowSoftness = 1,
  className = '',
  style = {},
  onLoad,
  onError,
  onModelVisibility,
  onProgress,
  onArStatus,
  children
}: ModelViewerProps) {
  const modelViewerRef = useRef<HTMLElement | null>(null)
  const [modelViewerLoaded, setModelViewerLoaded] = useState(false)

  // Check if model-viewer is defined in the global scope
  useEffect(() => {
    const checkModelViewerAvailability = () => {
      if (customElements.get('model-viewer')) {
        setModelViewerLoaded(true)
        return true
      }
      return false
    }

    // Check immediately
    if (!checkModelViewerAvailability()) {
      // If not available, check again after a delay
      const interval = setInterval(() => {
        if (checkModelViewerAvailability()) {
          clearInterval(interval)
        }
      }, 500)

      // Clean up interval
      return () => clearInterval(interval)
    }
  }, [])

  // Add event listeners
  useEffect(() => {
    const modelViewer = modelViewerRef.current
    if (!modelViewer) return

    // Add event listeners if callbacks are provided
    if (onLoad) modelViewer.addEventListener('load', onLoad)
    if (onError) modelViewer.addEventListener('error', onError)
    if (onModelVisibility) modelViewer.addEventListener('model-visibility', onModelVisibility)
    if (onProgress) modelViewer.addEventListener('progress', onProgress)
    if (onArStatus) modelViewer.addEventListener('ar-status', onArStatus)

    // Clean up event listeners
    return () => {
      if (onLoad) modelViewer.removeEventListener('load', onLoad)
      if (onError) modelViewer.removeEventListener('error', onError)
      if (onModelVisibility) modelViewer.removeEventListener('model-visibility', onModelVisibility)
      if (onProgress) modelViewer.removeEventListener('progress', onProgress)
      if (onArStatus) modelViewer.removeEventListener('ar-status', onArStatus)
    }
  }, [modelViewerRef.current, onLoad, onError, onModelVisibility, onProgress, onArStatus])

  // Dynamically load model-viewer script if not already loaded
  useEffect(() => {
    if (customElements.get('model-viewer')) return

    const script = document.createElement('script')
    script.type = 'module'
    script.src = 'https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js'
    script.async = true
    document.head.appendChild(script)

    return () => {
      document.head.removeChild(script)
    }
  }, [])

  if (!modelViewerLoaded) {
    return (
      <div 
        className={`model-viewer-loading ${className}`} 
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          minHeight: '300px',
          backgroundColor: '#f0f0f0',
          borderRadius: '4px',
          ...style 
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div className="loading-spinner" role="status">
            <span className="visually-hidden">Loading 3D Viewer...</span>
          </div>
          <div style={{ marginTop: '12px' }}>Loading 3D Viewer...</div>
        </div>
      </div>
    )
  }

  return (
    // @ts-ignore - model-viewer is a custom element
    <model-viewer
      ref={modelViewerRef}
      src={src}
      ios-src={iosSrc}
      alt={alt}
      poster={poster}
      loading={loading}
      reveal={reveal}
      ar={ar}
      ar-modes={arModes}
      ar-scale={arScale}
      auto-rotate={autoRotate}
      auto-rotate-delay={autoRotateDelay}
      autoplay={autoplay}
      animation-name={animationName}
      animation-loop={animationLoop}
      animation-crossfade-duration={animationCrossfadeDuration}
      camera-controls={cameraControls}
      camera-orbit={cameraOrbit}
      environment-image={environmentImage}
      exposure={exposure}
      shadow-intensity={shadowIntensity}
      shadow-softness={shadowSoftness}
      className={className}
      style={style}
    >
      {children}
    </model-viewer>   // @ts-ignore - model-viewer is a custom element
  )
}
