import * as React from "react"
import { motion } from "framer-motion"
import { 
  Link2, 
  QrCode, 
  Download, 
  Copy, 
  Check, 
  Smartphone,
  Upload,
  Eye,
  Share2,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Apple,
  Globe
} from "lucide-react"
import { 
  Button, 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription,
  Input,
  Badge
} from "@/components/ui"
import { useLanguage } from '@/hooks/useLanguage'

const pageVariants = {
  initial: { opacity: 0 },
  animate: { 
    opacity: 1,
    transition: {
      duration: 0.4,
      staggerChildren: 0.1
    }
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

// Cloud storage URL patterns
const CLOUD_STORAGE_PATTERNS = {
  googleDrive: {
    // Match: https://drive.google.com/file/d/FILE_ID/view?...
    filePattern: /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/,
    // Match: https://drive.google.com/uc?export=download&id=FILE_ID
    directPattern: /drive\.google\.com\/uc\?.*id=([a-zA-Z0-9_-]+)/,
    // Match: https://drive.google.com/open?id=FILE_ID
    openPattern: /drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/,
  },
  dropbox: {
    // Match: https://www.dropbox.com/s/xxxxx/file.glb?dl=0
    pattern: /dropbox\.com\/s(h)?\/([a-zA-Z0-9]+)\/([^?]+)/,
  },
  oneDrive: {
    // Match: https://onedrive.live.com/...
    pattern: /onedrive\.live\.com|1drv\.ms/,
  },
}

/**
 * Extract Google Drive file ID from various URL formats
 */
function extractGoogleDriveFileId(url: string): string | null {
  for (const pattern of Object.values(CLOUD_STORAGE_PATTERNS.googleDrive)) {
    const match = url.match(pattern)
    if (match && match[1]) {
      return match[1]
    }
  }
  return null
}

/**
 * Convert Google Drive URL to direct download URL
 */
function convertGoogleDriveUrl(url: string): string {
  const fileId = extractGoogleDriveFileId(url)
  if (fileId) {
    // Use direct download format
    return `https://drive.google.com/uc?export=download&id=${fileId}`
  }
  return url
}

/**
 * Convert Dropbox share URL to direct download URL
 */
function convertDropboxUrl(url: string): string {
  // Change ?dl=0 to ?dl=1 or add ?raw=1
  if (url.includes('dropbox.com')) {
    // Replace dl=0 with dl=1
    let directUrl = url.replace(/(\?|&)dl=0/, '$1dl=1')
    // If no dl parameter, add it
    if (!directUrl.includes('dl=1')) {
      directUrl += directUrl.includes('?') ? '&dl=1' : '?dl=1'
    }
    return directUrl
  }
  return url
}

/**
 * Check if URL is from a known cloud storage provider
 */
function isCloudStorageUrl(url: string): boolean {
  const lowercaseUrl = url.toLowerCase()
  return (
    lowercaseUrl.includes('drive.google.com') ||
    lowercaseUrl.includes('dropbox.com') ||
    lowercaseUrl.includes('onedrive.live.com') ||
    lowercaseUrl.includes('1drv.ms') ||
    lowercaseUrl.includes('firebasestorage.googleapis.com') ||
    lowercaseUrl.includes('storage.googleapis.com') ||
    lowercaseUrl.includes('amazonaws.com') ||
    lowercaseUrl.includes('blob.core.windows.net') ||
    lowercaseUrl.includes('cloudinary.com')
  )
}

/**
 * Convert cloud storage URL to direct download format
 * Google Drive URLs are proxied through backend to avoid CORS issues
 */
export function convertToDirectUrl(url: string): string {
  if (!url) return url
  
  const trimmedUrl = url.trim()
  
  // Already a proxy URL - return as-is to avoid double encoding
  if (trimmedUrl.includes('/api/proxy/gdrive')) {
    return trimmedUrl
  }
  
  // Google Drive - use backend proxy to avoid CORS issues
  if (trimmedUrl.includes('drive.google.com')) {
    // Encode the Google Drive URL and use our backend proxy
    const encodedUrl = encodeURIComponent(trimmedUrl)
    return `/api/proxy/gdrive?url=${encodedUrl}`
  }
  
  // Dropbox
  if (trimmedUrl.includes('dropbox.com')) {
    return convertDropboxUrl(trimmedUrl)
  }
  
  // Other URLs - return as-is
  return trimmedUrl
}

// Guide steps configuration
const GUIDE_STEPS = [
  {
    icon: Upload,
    titleKey: 'tryModel.guide.step1Title',
    descKey: 'tryModel.guide.step1Desc'
  },
  {
    icon: Link2,
    titleKey: 'tryModel.guide.step2Title',
    descKey: 'tryModel.guide.step2Desc'
  },
  {
    icon: QrCode,
    titleKey: 'tryModel.guide.step3Title',
    descKey: 'tryModel.guide.step3Desc'
  }
]

// QR Card Component for each format
interface QrCardProps {
  type: 'glb' | 'usdz'
  modelUrl: string
  modelName: string
  qrGenerated: boolean
  t: (key: string, params?: Record<string, any>) => string
}

function QrCard({ type, modelUrl, modelName, qrGenerated, t }: QrCardProps) {
  const [copied, setCopied] = React.useState(false)
  
  const isGlb = type === 'glb'
  const icon = isGlb ? <Globe className="h-5 w-5" /> : <Apple className="h-5 w-5" />
  const label = isGlb ? 'Android / Web (GLB)' : 'iOS (USDZ)'
  const color = isGlb ? 'text-green-600' : 'text-blue-600'
  const bgColor = isGlb ? 'bg-green-50 dark:bg-green-950/30' : 'bg-blue-50 dark:bg-blue-950/30'
  const borderColor = isGlb ? 'border-green-200 dark:border-green-800' : 'border-blue-200 dark:border-blue-800'

  // Generate AR view URL (convert cloud storage URLs to direct download format)
  const arViewUrl = React.useMemo(() => {
    if (!modelUrl.trim()) return ""
    const baseUrl = window.location.origin
    // Convert cloud storage URLs to direct download format
    const directUrl = convertToDirectUrl(modelUrl)
    const encodedUrl = encodeURIComponent(directUrl)
    const encodedName = modelName.trim() ? encodeURIComponent(modelName.trim()) : ''
    const formatParam = type === 'usdz' ? '&format=usdz' : ''
    return `${baseUrl}/custom-ar?model=${encodedUrl}${encodedName ? `&name=${encodedName}` : ''}${formatParam}`
  }, [modelUrl, modelName, type])

  // QR code URL - using reliable QR API with fallback
  const qrCodeUrl = React.useMemo(() => {
    if (!arViewUrl) return ""
    // Primary: goqr.me API (reliable, no rate limits)
    // Fallback: api.qrserver.com
    const encodedData = encodeURIComponent(arViewUrl)
    return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&format=png&data=${encodedData}`
  }, [arViewUrl])

  // Handle copy link
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(arViewUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      const textArea = document.createElement('textarea')
      textArea.value = arViewUrl
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  // Handle download QR
  const handleDownloadQr = async () => {
    try {
      const response = await fetch(qrCodeUrl)
      const blob = await response.blob()
      
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `${modelName || 'model'}-${type}-qr.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(link.href)
    } catch {
      // Download failed - user can right-click and save image manually
    }
  }

  // Handle share
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${modelName || t('tryModel.share.title')} (${label})`,
          text: t('tryModel.share.text'),
          url: arViewUrl,
        })
      } catch {
        // Share cancelled or not supported - fallback to copy
        handleCopyLink()
      }
    } else {
      handleCopyLink()
    }
  }

  if (!modelUrl.trim()) {
    return (
      <Card className={`${bgColor} ${borderColor} border-2`}>
        <CardHeader className="pb-3">
          <CardTitle className={`text-base flex items-center gap-2 ${color}`}>
            {icon}
            {label}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center min-h-[280px]">
          <div className="w-40 h-40 bg-muted/50 rounded-xl border-2 border-dashed border-muted-foreground/20 flex items-center justify-center mb-4">
            <QrCode className="h-12 w-12 text-muted-foreground/20" />
          </div>
          <p className="text-sm text-muted-foreground text-center">
            {t('tryModel.qr.enterUrl')}
          </p>
        </CardContent>
      </Card>
    )
  }

  if (!qrGenerated) {
    return (
      <Card className={`${bgColor} ${borderColor} border-2`}>
        <CardHeader className="pb-3">
          <CardTitle className={`text-base flex items-center gap-2 ${color}`}>
            {icon}
            {label}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center min-h-[280px]">
          <div className="w-40 h-40 bg-muted/50 rounded-xl border-2 border-dashed border-muted-foreground/20 flex items-center justify-center mb-4">
            <QrCode className="h-12 w-12 text-muted-foreground/20" />
          </div>
          <p className="text-sm text-muted-foreground text-center">
            {t('tryModel.qr.clickGenerate')}
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={`${bgColor} ${borderColor} border-2`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className={`text-base flex items-center gap-2 ${color}`}>
            {icon}
            {label}
          </CardTitle>
          <Badge variant="outline" className={`${color} border-current`}>
            <CheckCircle2 className="h-3 w-3 mr-1" />
            {t('tryModel.qr.ready')}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col items-center">
        {/* QR Code */}
        <div className="bg-white p-3 rounded-xl shadow-md mb-4">
          <img
            src={qrCodeUrl}
            alt={`QR Code for ${label}`}
            className="w-40 h-40"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 justify-center w-full">
          <Button onClick={handleDownloadQr} variant="outline" size="sm" className="gap-1">
            <Download className="h-3 w-3" />
            {t('tryModel.qr.download')}
          </Button>
          <Button onClick={handleCopyLink} variant="outline" size="sm" className="gap-1">
            {copied ? (
              <>
                <Check className="h-3 w-3" />
                {t('tryModel.qr.copied')}
              </>
            ) : (
              <>
                <Copy className="h-3 w-3" />
                {t('tryModel.qr.copyLink')}
              </>
            )}
          </Button>
          <Button onClick={handleShare} variant="outline" size="sm" className="gap-1">
            <Share2 className="h-3 w-3" />
            {t('tryModel.qr.share')}
          </Button>
        </div>

        {/* Preview Button */}
        <Button asChild variant="default" size="sm" className="gap-1 mt-3 w-full">
          <a href={arViewUrl} target="_blank" rel="noopener noreferrer">
            <Eye className="h-3 w-3" />
            {t('tryModel.qr.preview')}
          </a>
        </Button>
      </CardContent>
    </Card>
  )
}

export function TryModelPage() {
  const { t } = useLanguage()
  const [modelName, setModelName] = React.useState("")
  const [glbUrl, setGlbUrl] = React.useState("")
  const [usdzUrl, setUsdzUrl] = React.useState("")
  const [qrGenerated, setQrGenerated] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  // Set document title
  React.useEffect(() => {
    document.title = t('tryModel.headerTitle') + ' - Lusion AR'
  }, [t])

  // Validate model URL - now supports cloud storage URLs
  const validateUrl = (url: string, type: 'glb' | 'usdz'): boolean => {
    if (!url.trim()) return true // Empty is allowed (optional)
    
    try {
      const urlObj = new URL(url)
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        return false
      }
      
      // Check for correct extension
      const expectedExt = type === 'glb' ? ['.glb', '.gltf'] : ['.usdz']
      const hasCorrectExtension = expectedExt.some(ext => url.toLowerCase().includes(ext))
      
      // If has correct extension, valid
      if (hasCorrectExtension) {
        return true
      }
      
      // Cloud storage URLs don't always have extensions in the URL
      // Accept them if they're from known providers
      if (isCloudStorageUrl(url)) {
        return true
      }
      
      return false
    } catch {
      return false
    }
  }

  // Handle generate QR
  const handleGenerateQr = () => {
    setError(null)
    
    // At least one URL must be provided
    if (!glbUrl.trim() && !usdzUrl.trim()) {
      setError(t('tryModel.error.atLeastOne'))
      return
    }
    
    // Validate GLB URL if provided
    if (glbUrl.trim() && !validateUrl(glbUrl, 'glb')) {
      setError(t('tryModel.error.invalidGlb'))
      return
    }
    
    // Validate USDZ URL if provided
    if (usdzUrl.trim() && !validateUrl(usdzUrl, 'usdz')) {
      setError(t('tryModel.error.invalidUsdz'))
      return
    }
    
    setQrGenerated(true)
  }

  // Reset form
  const handleReset = () => {
    setModelName("")
    setGlbUrl("")
    setUsdzUrl("")
    setQrGenerated(false)
    setError(null)
  }

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="container mx-auto px-4 py-8"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">
          {t('tryModel.headerTitle')}
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          {t('tryModel.headerSubtitle')}
        </p>
      </motion.div>

      {/* How it Works Guide */}
      <motion.div variants={itemVariants} className="mb-12">
        <h2 className="text-xl font-semibold text-center mb-6">
          {t('tryModel.guide.title')}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {GUIDE_STEPS.map((step, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.02, y: -4 }}
              className="relative"
            >
              <Card className="h-full text-center hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <step.icon className="h-6 w-6 text-primary" />
                  </div>
                  <Badge variant="outline" className="mb-3">
                    {t('tryModel.guide.step', { number: index + 1 })}
                  </Badge>
                  <h3 className="font-semibold mb-2">
                    {t(step.titleKey)}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {t(step.descKey)}
                  </p>
                </CardContent>
              </Card>
              {index < GUIDE_STEPS.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-3 transform -translate-y-1/2 z-10">
                  <ArrowRight className="h-6 w-6 text-muted-foreground/30" />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto">
        {/* Input Section */}
        <motion.div variants={itemVariants} className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Link2 className="h-5 w-5" />
                {t('tryModel.input.title')}
              </CardTitle>
              <CardDescription>
                {t('tryModel.input.description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Model Name Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {t('tryModel.input.nameLabel')}
                  <span className="text-muted-foreground ml-1">({t('common.optional')})</span>
                </label>
                <Input
                  placeholder={t('tryModel.input.namePlaceholder')}
                  value={modelName}
                  onChange={(e) => setModelName(e.target.value)}
                  disabled={qrGenerated}
                />
              </div>

              {/* URL Inputs Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* GLB URL Input */}
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Globe className="h-4 w-4 text-green-600" />
                    {t('tryModel.input.glbLabel')}
                  </label>
                  <Input
                    placeholder={t('tryModel.input.glbPlaceholder')}
                    value={glbUrl}
                    onChange={(e) => {
                      setGlbUrl(e.target.value)
                      setError(null)
                    }}
                    disabled={qrGenerated}
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    {t('tryModel.input.glbFormats')}
                  </p>
                </div>

                {/* USDZ URL Input */}
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Apple className="h-4 w-4 text-blue-600" />
                    {t('tryModel.input.usdzLabel')}
                  </label>
                  <Input
                    placeholder={t('tryModel.input.usdzPlaceholder')}
                    value={usdzUrl}
                    onChange={(e) => {
                      setUsdzUrl(e.target.value)
                      setError(null)
                    }}
                    disabled={qrGenerated}
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    {t('tryModel.input.usdzFormats')}
                  </p>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </p>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                {!qrGenerated ? (
                  <Button 
                    onClick={handleGenerateQr} 
                    className="flex-1 gap-2"
                    disabled={!glbUrl.trim() && !usdzUrl.trim()}
                  >
                    <QrCode className="h-4 w-4" />
                    {t('tryModel.input.generateButton')}
                  </Button>
                ) : (
                  <Button 
                    onClick={handleReset} 
                    variant="outline"
                    className="flex-1 gap-2"
                  >
                    {t('tryModel.input.resetButton')}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* QR Codes Section */}
        <motion.div variants={itemVariants}>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            {t('tryModel.qr.title')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* GLB QR Card */}
            <QrCard
              type="glb"
              modelUrl={glbUrl}
              modelName={modelName}
              qrGenerated={qrGenerated}
              t={t}
            />

            {/* USDZ QR Card */}
            <QrCard
              type="usdz"
              modelUrl={usdzUrl}
              modelName={modelName}
              qrGenerated={qrGenerated}
              t={t}
            />
          </div>
        </motion.div>

        {/* Tips Card */}
        <motion.div variants={itemVariants} className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Smartphone className="h-4 w-4" />
                {t('tryModel.tips.title')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>• {t('tryModel.tips.tip1')}</p>
              <p>• {t('tryModel.tips.tip2')}</p>
              <p>• {t('tryModel.tips.tip3')}</p>
              <p>• {t('tryModel.tips.tip4')}</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  )
}
