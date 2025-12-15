import * as React from 'react'
import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Sliders, RefreshCw, Bug } from 'lucide-react'
import { Button, Card, CardContent, Badge } from '@/components/ui'
import { useLanguage } from '@/hooks/useLanguage'
import { ModelViewer } from './ModelViewer'
import { getModelUrls } from '@/api/ar'
import { type ArModelData } from '@/types/ar.schema'

interface ArViewerProps {
  itemId: string
  itemName?: string
  itemDescription?: string
  onBack?: () => void
  showDebugInfo?: boolean
}

export function ArViewer({
  itemId,
  itemName = 'AR View',
  itemDescription = 'Touch and drag to examine the 3D model',
  onBack,
  showDebugInfo = false
}: ArViewerProps) {
  const { t } = useLanguage()
  const [modelData, setModelData] = useState<ArModelData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showControls, setShowControls] = useState(false)
  const [modelStatus, setModelStatus] = useState('Loading...')
  const [deviceInfo, setDeviceInfo] = useState({
    platform: 'unknown',
    isIOS: false,
    isAndroid: false,
    isMobile: false
  })

  // Scale and rotation controls
  const [scale, setScale] = useState(1.0)
  const [rotation, setRotation] = useState(0)
  const [autoRotate, setAutoRotate] = useState(true)
  const [exposure, setExposure] = useState(1.5)
  const [environment, setEnvironment] = useState('neutral')
  const [shadowIntensity, setShadowIntensity] = useState(0.5)
  const [shadowSoftness, setShadowSoftness] = useState(1.0)

  // Load model data
  useEffect(() => {
    const fetchModelData = async () => {
      if (!itemId) return

      try {
        setLoading(true)
        setError(null)
        
        const data = await getModelUrls(itemId)
        setModelData(data)
        
        // Detect device type
        const userAgent = navigator.userAgent
        const isIOS = /iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream
        const isAndroid = /android/i.test(userAgent)
        const isMobile = /mobile|tablet|iphone|ipad|ipod|android/i.test(userAgent)
        
        setDeviceInfo({
          platform: isIOS ? 'ios' : isAndroid ? 'android' : 'desktop',
          isIOS,
          isAndroid,
          isMobile
        })
      } catch (err) {
        console.error('Failed to load model data:', err)
        setError(err instanceof Error ? err.message : 'Failed to load model data')
      } finally {
        setLoading(false)
      }
    }

    fetchModelData()
  }, [itemId])

  // Handle model events
  const handleModelLoad = useCallback(() => {
    setModelStatus('Loaded successfully')
    console.log('Model loaded successfully')
  }, [])

  const handleModelError = useCallback((event: any) => {
    const errorMessage = event.detail?.sourceError?.message || 'Unknown error'
    setModelStatus(`Error: ${errorMessage}`)
    console.error('Model failed to load:', event.detail)
  }, [])

  const handleModelProgress = useCallback((event: any) => {
    const progress = event.detail.totalProgress * 100
    setModelStatus(`Loading: ${progress.toFixed(0)}%`)
  }, [])

  const handleArStatus = useCallback((event: any) => {
    if (event.detail.status === 'failed') {
      console.error('AR error:', event.detail.error)
      alert('AR view failed. Your device may not support AR features or needs permissions.')
    } else if (event.detail.status === 'session-started') {
      console.log('AR session started')
    }
  }, [])

  // Reset view
  const resetView = useCallback(() => {
    setScale(1.0)
    setRotation(0)
    setAutoRotate(true)
    setExposure(1.5)
    setEnvironment('neutral')
    setShadowIntensity(0.5)
    setShadowSoftness(1.0)
  }, [])





  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-200 dark:from-slate-900 dark:via-purple-900/20 dark:to-slate-900">
        <div className="text-center text-foreground">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold mb-2">{t('ar.loadingTitle')}</h2>
          <p className="text-muted-foreground">{t('ar.loadingSubtitle')}</p>
        </div>
      </div>
    )
  }

  if (error || !modelData) {
    return (
      <div className="min-h-[400px] flex items-center justify-center bg-gradient-to-br from-white to-slate-100 dark:from-slate-900 dark:via-purple-900/20 dark:to-slate-900">
        <Card className="w-full max-w-md">
          <CardContent className="text-center p-6 space-y-4">
            <div className="text-destructive text-5xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold text-destructive">{t('ar.errorTitle')}</h2>
            <p className="text-muted-foreground">
              {error || t('ar.errorDesc')}
            </p>
            <div className="space-y-2 pt-4">
              <Button asChild className="w-full">
                <Link to="/models">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  {t('common.returnToModels')}
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="relative min-h-[600px] bg-gradient-to-br from-white to-slate-100 dark:from-slate-900 dark:via-purple-900/20 dark:to-slate-900">


      {/* AR Viewer */}
      <ModelViewer
        src={modelData.modelUrl}
        iosSrc={modelData.iosModelUrl}
        alt={`${itemName} 3D model`}
        ar={true}
        arModes="webxr scene-viewer quick-look"
        arScale="auto"
        autoRotate={autoRotate}
        autoplay={true}
        cameraControls={true}
        environmentImage={environment}
        exposure={exposure}
        shadowIntensity={shadowIntensity}
        shadowSoftness={shadowSoftness}
        style={{ 
          width: '100%', 
          height: '500px',
          backgroundColor: 'transparent'
        }}
        onLoad={handleModelLoad}
        onError={handleModelError}
        onProgress={handleModelProgress}
        onArStatus={handleArStatus}
      >
        {/* AR Button provided by model-viewer */}
        <button slot="ar-button" id="ar-button" style={{
          backgroundColor: '#E30A17',
          color: 'white',
          borderRadius: '4px',
          border: 'none',
          padding: '12px 24px',
          position: 'absolute',
          bottom: '100px',
          right: '16px',
          fontWeight: 'bold',
          fontSize: '18px',
          boxShadow: '0 4px 8px rgba(0,0,0,0.3)'
        }}>
          <span className="mr-2">📱</span>
          {t('ar.viewOnTable')}
        </button>
        
        {/* Loading UI */}
        <div className="loading-spinner" slot="poster">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-foreground mx-auto mb-4"></div>
          <div className="mt-3 text-foreground">{t('ar.preparingFood')}</div>
        </div>
        
        {/* Error message for when model fails to load */}
        <div slot="error" className="error">
          <div className="p-4 bg-destructive/90 text-destructive-foreground rounded-lg m-4 shadow-lg">
            <h4 className="text-lg font-bold mb-2">⚠️ {t('ar.issueOccurred')}</h4>
            <p>{t('ar.issueDetail1')}</p>
            <p className="mt-2">{t('ar.issueDetail2')}</p>
          </div>
        </div>
      </ModelViewer>
      
      {/* Floating Controls */}
      <div className="absolute top-4 left-4 z-10">
        {onBack ? (
          <Button onClick={onBack} variant="ghost" className="hover:bg-foreground/10">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('common.goBack')}
          </Button>
        ) : (
          <Button asChild variant="ghost" className="hover:bg-foreground/10">
            <Link to="/models">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('common.returnToModels')}
            </Link>
          </Button>
        )}
      </div>
      
      {/* Item Info Panel */}
      <div className="absolute bottom-0 left-0 right-0 p-3 bg-white/90 text-foreground backdrop-blur-sm dark:bg-black/70">
        <div className="container mx-auto">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex gap-2">
              <Button 
                variant="ghost" 
                className="hover:bg-foreground/10 border border-border text-foreground"
                onClick={() => setShowControls(!showControls)}
              >
                <Sliders className="h-4 w-4 mr-2" />
                {t('common.settings')}
              </Button>
              <Button 
                variant="ghost" 
                className="hover:bg-foreground/10 border border-border text-foreground"
                onClick={resetView}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                {t('common.reset')}
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* AR Controls Panel */}
      {showControls && (
        <motion.div 
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 100 }}
          className="absolute top-1/2 right-4 -translate-y-1/2 bg-white/90 text-foreground dark:bg-black/80 p-4 rounded-lg shadow-lg z-20 backdrop-blur-sm"
          style={{ maxWidth: '300px' }}
        >
          <h5 className="font-bold border-b border-border pb-2 mb-4">View Settings</h5>
          
          {/* Scale Control */}
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-1">
              <span>Size</span>
              <span>{scale.toFixed(1)}x</span>
            </div>
            <input 
              type="range" 
              min="0.5" 
              max="2" 
              step="0.1" 
              value={scale}
              onChange={(e) => setScale(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
          
          {/* Rotation Control */}
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-1">
              <span>Rotation</span>
              <span>{rotation}°</span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="360" 
              step="5" 
              value={rotation}
              onChange={(e) => setRotation(parseInt(e.target.value))}
              className="w-full"
            />
          </div>
          
          {/* Auto-Rotate Toggle */}
          <div className="mb-4 flex items-center justify-between">
            <span className="text-sm">Auto Rotate</span>
            <div className="relative inline-block w-10 align-middle select-none">
              <input 
                type="checkbox" 
                checked={autoRotate}
                onChange={(e) => setAutoRotate(e.target.checked)}
                className="sr-only"
                id="auto-rotate-toggle"
              />
              <label 
                htmlFor="auto-rotate-toggle"
                className={`block overflow-hidden h-6 rounded-full cursor-pointer ${autoRotate ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'}`}
              >
                <span 
                  className={`block h-6 w-6 rounded-full bg-white transform transition-transform ${autoRotate ? 'translate-x-4' : 'translate-x-0'}`} 
                />
              </label>
            </div>
          </div>
          
          {/* Lighting Control */}
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-1">
              <span>Brightness</span>
              <span>{exposure.toFixed(1)}</span>
            </div>
            <input 
              type="range" 
              min="0.5" 
              max="3" 
              step="0.1" 
              value={exposure}
              onChange={(e) => setExposure(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
          
          {/* Environment Dropdown */}
          <div className="mb-4">
            <label htmlFor="environment-select" className="block text-sm mb-1">
              Lighting Style
            </label>
            <select 
              id="environment-select"
              value={environment}
              onChange={(e) => setEnvironment(e.target.value)}
              className="w-full bg-white text-foreground border border-border rounded py-1 px-2 text-sm dark:bg-gray-800 dark:text-white dark:border-gray-700"
            >
              <option value="neutral">Default</option>
              <option value="restaurant">Warm</option>
              <option value="kitchen">Bright</option>
              <option value="outdoor">Natural</option>
            </select>
          </div>
          
          {/* Shadow Intensity Control */}
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-1">
              <span>Shadow Intensity</span>
              <span>{shadowIntensity.toFixed(1)}</span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="1" 
              step="0.1" 
              value={shadowIntensity}
              onChange={(e) => setShadowIntensity(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
          
          {/* Shadow Softness Control */}
          <div className="mb-2">
            <div className="flex justify-between text-sm mb-1">
              <span>Shadow Softness</span>
              <span>{shadowSoftness.toFixed(1)}</span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="2" 
              step="0.1" 
              value={shadowSoftness}
              onChange={(e) => setShadowSoftness(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
        </motion.div>
      )}
    </div>
  )
}
