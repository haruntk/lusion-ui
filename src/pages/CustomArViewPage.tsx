import * as React from "react"
import { useSearchParams, Link } from "react-router-dom"
import { motion } from "framer-motion"
import { 
  ArrowLeft, 
  Smartphone, 
  AlertCircle,
  RotateCcw,
  Maximize2,
  Home,
  Sparkles,
  ExternalLink
} from "lucide-react"
import { 
  Button, 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  Badge,
  Spinner
} from "@/components/ui"
import { ModelViewer } from "@/components/ar"
import { useLanguage } from '@/hooks/useLanguage'
import { convertToDirectUrl } from './TryModelPage'

const pageVariants = {
  initial: { opacity: 0 },
  animate: { 
    opacity: 1,
    transition: { duration: 0.4 }
  },
  exit: { 
    opacity: 0,
    transition: { duration: 0.2 }
  }
}

const itemVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 24
    }
  }
}

export function CustomArViewPage() {
  const { t } = useLanguage()
  const [searchParams] = useSearchParams()
  
  // Get model URL, name and format from query parameters
  const rawModelUrl = searchParams.get("model") || ""
  // Convert cloud storage URLs (Google Drive, Dropbox, etc.) to direct download format
  const modelUrl = React.useMemo(() => convertToDirectUrl(rawModelUrl), [rawModelUrl])
  const modelName = searchParams.get("name") || t('customAr.defaultModelName')
  const formatParam = searchParams.get("format") || ""
  const isUsdzFormat = formatParam === 'usdz' || rawModelUrl.toLowerCase().endsWith('.usdz')
  
  // State
  const [isLoading, setIsLoading] = React.useState(true)
  const [hasError, setHasError] = React.useState(false)
  const [isFullscreen, setIsFullscreen] = React.useState(false)
  const [arSupported, setArSupported] = React.useState<boolean | null>(null)
  
  // Set document title
  React.useEffect(() => {
    document.title = modelName 
      ? `${modelName} - ${t('customAr.pageTitle')}`
      : t('customAr.pageTitle') + ' - Lusion AR'
  }, [modelName, t])

  // Handle model load
  const handleModelLoad = React.useCallback(() => {
    setIsLoading(false)
    setHasError(false)
  }, [])

  // Handle model error
  const handleModelError = React.useCallback((_event: unknown) => {
    // Model loading failed - could be CORS, invalid URL, or network issue
    setIsLoading(false)
    setHasError(true)
  }, [])

  // Handle fullscreen toggle
  const handleFullscreen = React.useCallback(() => {
    const elem = document.documentElement
    if (!document.fullscreenElement) {
      elem.requestFullscreen?.()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen?.()
      setIsFullscreen(false)
    }
  }, [])

  // Listen for fullscreen changes
  React.useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  // Validate model URL
  const isValidUrl = React.useMemo(() => {
    if (!modelUrl) return false
    
    // Proxy URLs are valid (relative URLs starting with /api/)
    if (modelUrl.startsWith('/api/')) {
      return true
    }
    
    try {
      const url = new URL(modelUrl)
      return ['http:', 'https:'].includes(url.protocol)
    } catch {
      return false
    }
  }, [modelUrl])

  // Detect iOS device
  const isIOS = React.useMemo(() => {
    return /iPad|iPhone|iPod/.test(navigator.userAgent)
  }, [])

  // Determine model URLs based on format
  const { glbModelUrl, iosModelUrl } = React.useMemo(() => {
    if (!modelUrl) return { glbModelUrl: undefined, iosModelUrl: undefined }
    
    // If USDZ format, use for iOS AR
    if (isUsdzFormat) {
      return { 
        glbModelUrl: undefined, 
        iosModelUrl: modelUrl 
      }
    }
    
    // Otherwise it's GLB/GLTF for general use
    return { 
      glbModelUrl: modelUrl, 
      iosModelUrl: undefined 
    }
  }, [modelUrl, isUsdzFormat])
  
  // Determine which URL to use for model-viewer (GLB only, USDZ doesn't work in model-viewer src)
  const effectiveModelUrl = glbModelUrl || modelUrl
  
  // Check if we should show iOS-only USDZ view (no GLB available)
  const showIosOnlyView = isUsdzFormat && isIOS && !glbModelUrl

  // Check AR support (must be after useMemo that defines iosModelUrl and glbModelUrl)
  React.useEffect(() => {
    const checkArSupport = async () => {
      // Check for WebXR support
      if ('xr' in navigator) {
        try {
          // @ts-ignore
          const supported = await navigator.xr?.isSessionSupported('immersive-ar')
          if (supported) {
            setArSupported(true)
            return
          }
        } catch {
          // WebXR not available, continue checking other methods
        }
      }
      
      // Check for iOS (Quick Look support)
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
      if (isIOS && iosModelUrl) {
        setArSupported(true)
        return
      }
      
      // Check for Android (Scene Viewer support) 
      const isAndroid = /Android/.test(navigator.userAgent)
      if (isAndroid && glbModelUrl) {
        setArSupported(true)
        return
      }
      
      // Desktop or unsupported
      setArSupported(false)
    }
    
    checkArSupport()
  }, [iosModelUrl, glbModelUrl])

  // No model URL provided
  if (!modelUrl) {
    return (
      <motion.div
        variants={pageVariants}
        initial="initial"
        animate="animate"
        className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4"
      >
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              {t('customAr.error.noModel')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              {t('customAr.error.noModelDesc')}
            </p>
            <div className="flex gap-2">
              <Button asChild variant="default" className="flex-1 gap-2">
                <Link to="/try-model">
                  <Sparkles className="h-4 w-4" />
                  {t('customAr.error.tryModel')}
                </Link>
              </Button>
              <Button asChild variant="outline" className="flex-1 gap-2">
                <Link to="/">
                  <Home className="h-4 w-4" />
                  {t('common.goHome')}
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  // Invalid URL
  if (!isValidUrl) {
    return (
      <motion.div
        variants={pageVariants}
        initial="initial"
        animate="animate"
        className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4"
      >
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              {t('customAr.error.invalidUrl')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              {t('customAr.error.invalidUrlDesc')}
            </p>
            <div className="p-3 bg-muted rounded-lg text-sm font-mono break-all">
              {modelUrl}
            </div>
            <div className="flex gap-2">
              <Button asChild variant="default" className="flex-1 gap-2">
                <Link to="/try-model">
                  <ArrowLeft className="h-4 w-4" />
                  {t('customAr.error.goBack')}
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  // iOS-only USDZ view (USDZ can't be viewed in model-viewer, only AR)
  if (showIosOnlyView) {
    return (
      <motion.div
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="min-h-screen bg-gradient-to-br from-background to-muted"
      >
        {/* Header */}
        <motion.header 
          variants={itemVariants}
          className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b"
        >
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <Button asChild variant="ghost" size="sm" className="gap-2">
                <Link to="/try-model">
                  <ArrowLeft className="h-4 w-4" />
                  {t('common.goBack')}
                </Link>
              </Button>
              
              <Badge variant="secondary" className="gap-1">
                <Sparkles className="h-3 w-3" />
                iOS AR
              </Badge>

              <div className="w-20" />
            </div>
          </div>
        </motion.header>

        {/* Main Content - iOS USDZ AR Only */}
        <main className="container mx-auto px-4 py-12">
          <div className="max-w-lg mx-auto text-center">
            <motion.div variants={itemVariants}>
              <Card className="overflow-hidden">
                <CardContent className="p-8">
                  {/* AR Icon */}
                  <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Smartphone className="h-12 w-12 text-white" />
                  </div>
                  
                  {/* Title */}
                  <h1 className="text-2xl font-bold mb-2">{modelName}</h1>
                  <p className="text-muted-foreground mb-6">
                    {t('customAr.iosArReady')}
                  </p>
                  
                  {/* AR Button - iOS Quick Look */}
                  <a
                    rel="ar"
                    href={iosModelUrl || modelUrl}
                    className="inline-flex items-center justify-center gap-3 w-full py-4 px-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all"
                  >
                    <span className="text-2xl">📱</span>
                    {t('customAr.viewInAr')}
                    {/* Hidden image required for iOS Quick Look */}
                    <img 
                      src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" 
                      alt="" 
                      style={{ display: 'none' }}
                    />
                  </a>
                  
                  <p className="text-sm text-muted-foreground mt-4">
                    {t('customAr.iosTapToView')}
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Info Card */}
            <motion.div variants={itemVariants} className="mt-6">
              <Card>
                <CardContent className="p-4 text-sm text-muted-foreground">
                  <p className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-blue-500" />
                    {t('customAr.usdzOnlyInfo')}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </main>
      </motion.div>
    )
  }

  // Error loading model
  if (hasError) {
    return (
      <motion.div
        variants={pageVariants}
        initial="initial"
        animate="animate"
        className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4"
      >
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              {t('customAr.error.loadFailed')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              {t('customAr.error.loadFailedDesc')}
            </p>
            <div className="p-3 bg-muted rounded-lg text-sm font-mono break-all">
              {modelUrl}
            </div>
            <p className="text-sm text-muted-foreground">
              {t('customAr.error.checkUrl')}
            </p>
            <div className="flex gap-2">
              <Button 
                onClick={() => window.location.reload()} 
                variant="outline" 
                className="flex-1 gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                {t('common.retry')}
              </Button>
              <Button asChild variant="default" className="flex-1 gap-2">
                <Link to="/try-model">
                  <ArrowLeft className="h-4 w-4" />
                  {t('customAr.error.goBack')}
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="min-h-screen bg-gradient-to-br from-background to-muted"
    >
      {/* Header */}
      <motion.header 
        variants={itemVariants}
        className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b"
      >
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Button asChild variant="ghost" size="sm" className="gap-2">
              <Link to="/try-model">
                <ArrowLeft className="h-4 w-4" />
                {t('common.goBack')}
              </Link>
            </Button>
            
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="gap-1">
                <Sparkles className="h-3 w-3" />
                {t('customAr.badge')}
              </Badge>
              {modelName && (
                <span className="font-medium text-sm hidden sm:inline">
                  {modelName}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={handleFullscreen}
                className="gap-2"
              >
                <Maximize2 className="h-4 w-4" />
                <span className="hidden sm:inline">
                  {isFullscreen ? t('customAr.exitFullscreen') : t('customAr.fullscreen')}
                </span>
              </Button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <div className="max-w-5xl mx-auto">
          {/* Model Viewer */}
          <motion.div variants={itemVariants}>
            <Card className="overflow-hidden">
              <CardContent className="p-0 relative">
                {/* Loading Overlay */}
                {isLoading && (
                  <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-10">
                    <div className="text-center">
                      <Spinner size="lg" className="mx-auto mb-4" />
                      <p className="text-muted-foreground">{t('customAr.loading')}</p>
                    </div>
                  </div>
                )}

                {/* Model Viewer Component */}
                <ModelViewer
                  src={effectiveModelUrl}
                  iosSrc={iosModelUrl || undefined}
                  alt={modelName || 'Custom 3D Model'}
                  ar={true}
                  arModes="webxr scene-viewer quick-look"
                  arScale="auto"
                  autoRotate={true}
                  autoplay={true}
                  cameraControls={true}
                  environmentImage="neutral"
                  exposure={1.5}
                  shadowIntensity={1}
                  shadowSoftness={1}
                  style={{ 
                    width: '100%', 
                    height: '500px',
                    backgroundColor: 'transparent'
                  }}
                  onLoad={handleModelLoad}
                  onError={handleModelError}
                >
                  {/* AR Button - styled for visibility */}
                  <button 
                    slot="ar-button" 
                    className="ar-button-custom"
                    style={{
                      backgroundColor: '#7c3aed',
                      color: 'white',
                      borderRadius: '12px',
                      border: 'none',
                      padding: '16px 32px',
                      position: 'absolute',
                      bottom: '24px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      fontWeight: 'bold',
                      fontSize: '18px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      boxShadow: '0 8px 24px rgba(124, 58, 237, 0.4)',
                      cursor: 'pointer',
                      zIndex: 100,
                      whiteSpace: 'nowrap'
                    }}
                  >
                    📱 {t('customAr.viewInAr')}
                  </button>

                  {/* Loading Poster */}
                  <div slot="poster" className="flex items-center justify-center h-full bg-muted">
                    <div className="text-center">
                      <Spinner size="lg" className="mx-auto mb-4" />
                      <p className="text-muted-foreground">{t('customAr.loading')}</p>
                    </div>
                  </div>

                  {/* Error Slot */}
                  <div slot="error" className="p-8 text-center">
                    <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
                    <p className="text-destructive font-medium">
                      {t('customAr.error.loadFailed')}
                    </p>
                  </div>
                </ModelViewer>
              </CardContent>
            </Card>

            {/* External AR Button - Always visible on mobile */}
            {!isLoading && (
              <div className="mt-4 flex justify-center">
                <a
                  rel="ar"
                  href={glbModelUrl ? 
                    `intent://arvr.google.com/scene-viewer/1.0?file=${encodeURIComponent(glbModelUrl)}&mode=ar_preferred#Intent;scheme=https;package=com.google.android.googlequicksearchbox;action=android.intent.action.VIEW;S.browser_fallback_url=${encodeURIComponent(window.location.href)};end;`
                    : (iosModelUrl || modelUrl)}
                  className="inline-flex items-center justify-center gap-3 py-4 px-8 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all active:scale-95"
                >
                  <Smartphone className="h-6 w-6" />
                  {t('customAr.viewInAr')}
                  {/* Hidden image for iOS Quick Look */}
                  <img 
                    src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" 
                    alt=""
                    style={{ display: 'none' }}
                  />
                </a>
              </div>
            )}
          </motion.div>

          {/* Model Info */}
          <motion.div variants={itemVariants} className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Model Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t('customAr.info.title')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {modelName && (
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">{t('customAr.info.name')}</span>
                    <span className="font-medium">{modelName}</span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">{t('customAr.info.source')}</span>
                  <a 
                    href={modelUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline flex items-center gap-1 text-sm"
                  >
                    {t('customAr.info.viewSource')}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">{t('customAr.info.arSupport')}</span>
                  <Badge variant="secondary" className="gap-1">
                    <Sparkles className="h-3 w-3" />
                    {t('customAr.info.arReady')}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Instructions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t('customAr.instructions.title')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>• {t('customAr.instructions.step1')}</p>
                <p>• {t('customAr.instructions.step2')}</p>
                <p>• {t('customAr.instructions.step3')}</p>
                
                {/* AR Support Warning */}
                {arSupported === false && (
                  <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg">
                    <p className="text-amber-800 dark:text-amber-200 font-medium text-sm">
                      ⚠️ {t('customAr.arNotSupported')}
                    </p>
                  </div>
                )}
                
                {/* Format Warning for iOS */}
                {isUsdzFormat === false && /iPad|iPhone|iPod/.test(navigator.userAgent) && (
                  <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <p className="text-blue-800 dark:text-blue-200 font-medium text-sm">
                      📱 {t('customAr.iosNeedsUsdz')}
                    </p>
                  </div>
                )}
                
                {/* Format Warning for Android */}
                {isUsdzFormat === true && /Android/.test(navigator.userAgent) && (
                  <div className="mt-4 p-3 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg">
                    <p className="text-green-800 dark:text-green-200 font-medium text-sm">
                      🤖 {t('customAr.androidNeedsGlb')}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
    </motion.div>
  )
}
