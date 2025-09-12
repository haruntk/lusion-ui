import { useParams, Link } from "react-router-dom"
import { motion } from "framer-motion"
import { useState } from "react"
import { 
  ArrowLeft, 
  QrCode, 
  Smartphone, 
  Download,
  Share2,
  Copy,
  Clock,
  RefreshCw,
  Sparkles,
  Package,
  ChevronDown,
  ChevronUp
} from "lucide-react"
import { 
  Button, 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  Badge,
  Spinner,
  useToast
} from "@/components/ui"
import { ErrorState } from "@/components/common"
import { useItem, useQr, useArSession, useLanguage, useNutrition } from "@/hooks"
import { localizeItemFields } from '@/utils/i18n'

const pageVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 24
    }
  }
}

export function ItemDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { toast } = useToast()
  const { t, lang } = useLanguage()
  
  // Yerel state'i tanımla
  interface LoadingState {
    downloadLoading: boolean;
    shareLoading: boolean;
    copyLoading: boolean;
  }
  
  const [state, setState] = useState<LoadingState>({
    downloadLoading: false,
    shareLoading: false,
    copyLoading: false
  })
  
  const [isModelDetailsExpanded, setIsModelDetailsExpanded] = useState<boolean>(false)
  
  // Use enhanced hooks with proper error handling
  const { 
    data: item, 
    loading: itemLoading, 
    error: itemError,
    isNotFound,
    retry: retryItem,
    refetch: refetchItem
  } = useItem(id, {
    enabled: !!id,
    retryOnError: true,
    maxRetries: 3
  })

  const {
    qrUrl,
    analytics: qrAnalytics,
    loading: qrLoading,
    error: qrError,
    generate: generateQr,
    download: downloadQr,
    share: shareQr,
    copyToClipboard,
    canShare,
    canCopy,
    refetch: refetchQr
  } = useQr({
    itemId: id,
    enabled: !!id,
    includeAnalytics: true,
    autoGenerate: true // QR kodu otomatik olarak oluştur
  })

  const {
    deviceInfo,
    loading: arLoading,
    error: arError,
    startAr
  } = useArSession({
    itemId: id,
    enabled: !!id
  })

  const {
    data: nutritionData,
    loading: nutritionLoading,
    error: nutritionError,
    refetch: refetchNutrition
  } = useNutrition(id, {
    enabled: !!id
  })

  // Handle loading state
  if (itemLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-16">
          <Spinner size="lg" className="mx-auto mb-4" />
          <p className="text-lg text-muted-foreground">{t('item.loadingTitle')}</p>
          <p className="text-sm text-muted-foreground mt-2">
            {t('item.loadingSubtitle')}
          </p>
        </div>
      </div>
    )
  }

  // Handle not found state
  if (isNotFound) {
    return (
      <div className="container mx-auto px-4 py-8">
        <ErrorState
          title={t('item.notFoundTitle')}
          message={t('item.notFoundDesc')}
          retry={retryItem}
        />
      </div>
    )
  }

  // Handle error state
  if (itemError || !item) {
    return (
      <div className="container mx-auto px-4 py-8">
        <ErrorState
          title={t('item.failedTitle')}
          message={itemError || t('item.failedDesc')}
          retry={retryItem}
        />
      </div>
    )
  }

  // Handle actions
  const handleQrGenerate = async () => {
    try {
      console.log("Generating QR code for item:", id);
      const result = await generateQr();
      console.log("QR generation result:", result);
      
      toast({
        variant: "success",
        title: "QR Code Generated",
        description: "QR code has been generated successfully",
      })
    } catch (error) {
      console.error("QR generation error:", error);
      
      toast({
        variant: "destructive",
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate QR code",
      })
    }
  }

  const handleDownload = async () => {
    try {
      // Update loading state when download operation starts
      setState((prev: LoadingState) => ({...prev, downloadLoading: true}));
      
      console.log("Starting QR download for:", item.name);
      await downloadQr(`${item.name.replace(/\s+/g, '-').toLowerCase()}-qr.png`);
      
      toast({
        variant: "success",
        title: "Downloaded",
        description: "QR code has been downloaded to your device",
      });
    } catch (error) {
      console.error("QR download error:", error);
      toast({
        variant: "destructive",
        title: "Download Failed",
        description: error instanceof Error ? error.message : "An error occurred while downloading the QR code",
      });
    } finally {
      // İşlem tamamlandığında loading state'ini güncelle
      setState((prev: LoadingState) => ({...prev, downloadLoading: false}));
    }
  }

  const handleShare = async () => {
    try {
      setState((prev: LoadingState) => ({...prev, shareLoading: true}));
      
      await shareQr(item.name);
      
      toast({
        variant: "success",
        title: "Shared",
        description: "AR experience link has been shared",
      });
    } catch (error) {
      console.log("Share error, trying clipboard fallback:", error);
      
      // Try clipboard fallback
      try {
        await copyToClipboard();
        
        toast({
          variant: "success",
          title: "Copied to Clipboard",
          description: "AR experience link has been copied to clipboard",
        });
      } catch (clipError) {
        console.error("Both share and clipboard failed:", clipError);
        
        toast({
          variant: "destructive",
          title: "Sharing Failed",
          description: "The link could not be shared or copied",
        });
      }
    } finally {
      setState((prev: LoadingState) => ({...prev, shareLoading: false}));
    }
  }
  
  const handleCopy = async () => {
    try {
      setState((prev: LoadingState) => ({...prev, copyLoading: true}));
      
      await copyToClipboard();
      
      toast({
        variant: "success",
        title: "Copied",
        description: "AR experience link has been copied to clipboard",
      });
    } catch (error) {
      console.error("Copy to clipboard error:", error);
      
      toast({
        variant: "destructive",
        title: "Copy Failed",
        description: "The link could not be copied to clipboard",
      });
    } finally {
      setState((prev: LoadingState) => ({...prev, copyLoading: false}));
    }
  }

  return (
    <motion.div
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      className="container mx-auto px-4 py-8"
    >
      {/* Back Button */}
      <motion.div variants={itemVariants}>
        <Button asChild variant="ghost" className="mb-6 gap-2">
          <Link to="/menu">
            <ArrowLeft className="h-4 w-4" />
            {t('common.returnToMenu')}
          </Link>
        </Button>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Item Image & QR Code */}
        <div className="space-y-6">
          <motion.div variants={itemVariants}>
            <div className="aspect-[4/3] bg-muted rounded-xl overflow-hidden shadow-lg ring-1 ring-black/5 w-full max-w-2xl">
              {item.image && item.image !== "" ? (
                <img
                  src={`${item.image}&w=1200&h=900&q=95&fit=crop&crop=center`}
                  alt={item.name}
                  className="w-full h-full object-contain hover:scale-105 transition-transform duration-300"
                  loading="eager"
                  style={{ 
                    imageRendering: 'crisp-edges',
                    objectFit: 'contain',
                    objectPosition: 'center',
                    backgroundColor: '#f8f9fa'
                  }}
                  width="800"
                  height="600"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-muted to-muted/30 flex flex-col items-center justify-center">
                  <Package className="h-24 w-24 text-muted-foreground/20 mb-4" />
                  <p className="text-muted-foreground text-lg font-medium">{item.name}</p>
                  <p className="text-muted-foreground/60 text-sm">No image available</p>
                </div>
              )}
            </div>
          </motion.div>
          
          {/* QR Code Section - Only show if item has AR model */}
          {item.has_ar_model && (
            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <QrCode className="h-5 w-5" />
                      {t('item.qrCode')}
                    </div>
                    {qrLoading && <Spinner size="sm" />}
                  </CardTitle>
                </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center space-y-4">
                  {/* QR Code Display */}
                  <div className="relative">
                    {qrUrl ? (
                      <img
                        src={qrUrl}
                        alt={`QR Code for ${item.name}`}
                        className="w-32 h-32 border rounded-lg shadow-sm"
                      />
                    ) : (
                      <div className="w-32 h-32 border-2 border-dashed border-muted-foreground/50 rounded-lg flex items-center justify-center">
                        <QrCode className="h-8 w-8 text-muted-foreground/50" />
                      </div>
                    )}
                    {qrLoading && (
                      <div className="absolute inset-0 bg-background/80 rounded-lg flex items-center justify-center">
                        <Spinner size="sm" />
                      </div>
                    )}
                  </div>

                  {/* QR Actions */}
                  <div className="flex flex-wrap gap-2 justify-center">
                    {!qrUrl && (
                      <Button
                        size="sm"
                        onClick={handleQrGenerate}
                        loading={qrLoading}
                        leftIcon={<QrCode className="h-4 w-4" />}
                      >
                        {t('item.generateQr')}
                      </Button>
                    )}
                    
                    {qrUrl && (
                      <>
                        <Button
                          size="sm"
                          onClick={handleDownload}
                          loading={state.downloadLoading}
                          disabled={state.downloadLoading}
                          leftIcon={<Download className="h-4 w-4" />}
                        >
                          {t('common.download')}
                        </Button>
                        
                        {canShare && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={handleShare}
                            loading={state.shareLoading}
                            disabled={state.shareLoading}
                            leftIcon={<Share2 className="h-4 w-4" />}
                          >
                            {t('common.share')}
                          </Button>
                        )}
                        
                        {canCopy && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={handleCopy}
                            loading={state.copyLoading}
                            disabled={state.copyLoading}
                            leftIcon={<Copy className="h-4 w-4" />}
                          >
                            {t('common.copyLink')}
                          </Button>
                        )}
                      </>
                    )}
                  </div>

                  {/* QR Error State */}
                  {qrError && (
                    <div className="text-center">
                      <p className="text-sm text-destructive mb-2">{qrError}</p>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={refetchQr}
                        leftIcon={<RefreshCw className="h-4 w-4" />}
                      >
                        {t('common.retry')}
                      </Button>
                    </div>
                  )}

                  {/* QR Analytics */}
                  {qrAnalytics && (
                    <div className="text-center space-y-1 mt-2">
                      <p className="text-xs text-muted-foreground">
                        {t('item.scans')}: {qrAnalytics.totalScans || 0}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {t('item.uniqueScans')}: {qrAnalytics.uniqueScans || 0}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {t('item.arLaunches')}: {qrAnalytics.arLaunches || 0}
                      </p>
                      {qrAnalytics.conversionRate > 0 && (
                        <p className="text-xs text-muted-foreground">
                          {t('item.conversionRate')}: {Math.round((qrAnalytics.conversionRate || 0) * 100)}%
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
          )}

          {/* 3D Model Info - Only show if item has AR model */}
          {item.has_ar_model && (
            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader className="cursor-pointer" onClick={() => setIsModelDetailsExpanded(!isModelDetailsExpanded)}>
                  <CardTitle className="flex items-center justify-between">
                    <span>{t('item.modelDetails')}</span>
                    {isModelDetailsExpanded ? (
                      <ChevronUp className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    )}
                  </CardTitle>
                </CardHeader>
                {isModelDetailsExpanded && (
                  <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Format:</span>
                    <span className="font-medium">GLB</span>
                  </div>
                  {item.model_ios && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{t('item.iosFormat')}</span>
                      <span className="font-medium">USDZ</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t('item.arReady')}</span>
                    <Badge variant="success" className="text-xs">
                      ✓ {t('item.yes')}
                    </Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t('item.platformSupport')}</span>
                    <div className="flex gap-1">
                      <Badge variant="outline" className="text-xs">iOS</Badge>
                      <Badge variant="outline" className="text-xs">Android</Badge>
                      <Badge variant="outline" className="text-xs">Web</Badge>
                    </div>
                  </div>
                  </CardContent>
                )}
              </Card>
            </motion.div>
          )}
        </div>

        {/* Item Details */}
        <div className="space-y-6">
          <motion.div variants={itemVariants}>
            <div>
              <h1 className="text-3xl font-bold mb-4">{localizeItemFields(item, (document.documentElement.getAttribute('lang') as 'en'|'tr'|'ar') || 'en').name}</h1>
              <div className="flex items-center gap-4 mb-4">
                <span className="text-3xl font-bold text-primary">{item.price}</span>
                <Badge variant="outline" className="capitalize text-sm px-3 py-1">
                  {localizeItemFields(item, (document.documentElement.getAttribute('lang') as 'en'|'tr'|'ar') || 'en').category}
                </Badge>
              </div>
              <p className="text-muted-foreground leading-relaxed text-lg">
                {localizeItemFields(item, (document.documentElement.getAttribute('lang') as 'en'|'tr'|'ar') || 'en').description}
              </p>
            </div>
          </motion.div>

          {/* AR Experience Card - Only show if item has AR model */}
          {item.has_ar_model ? (
            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5" />
                      {t('common.arExperience')}
                    </div>
                    {arLoading && <Spinner size="sm" />}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Device Info */}
                  {deviceInfo && (
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Smartphone className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {deviceInfo.platform === 'ios' ? t('item.deviceIos') : 
                           deviceInfo.platform === 'android' ? t('item.deviceAndroid') : 
                           t('item.deviceDesktop')}
                        </span>
                      </div>
                      <Badge variant="success">
                        {t('item.arReadyBadge')}
                      </Badge>
                    </div>
                  )}

                  <p className="text-sm text-muted-foreground">
                    {t('item.viewOnMobile')}
                  </p>
                  
                  <div className="flex flex-col gap-3">
                    <Button 
                      className="gap-2 w-full" 
                      onClick={startAr}
                      size="lg"
                    >
                      <Smartphone className="h-5 w-5" />
                      {t('ar.ctaStart')}
                    </Button>
                  </div>
                  
                  {arError && (
                    <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                      <p className="text-sm text-destructive">{arError}</p>
                    </div>
                  )}

                  <p className="text-xs text-muted-foreground">
                    {deviceInfo?.isMobile 
                      ? t('item.optimizedForMobile') 
                      : t('item.bestOnMobile')}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            /* Alternative content when AR is not available */
            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    {t('item.itemInfo')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {t('ar.unavailableDesc')}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Additional Item Info */}
          {item.tags && item.tags.length > 0 && (
            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader>
                  <CardTitle>{t('item.tags')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {item.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Nutrition Facts */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {t('nutrition.title')}
                  {nutritionLoading && <Spinner size="sm" />}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {nutritionError ? (
                  <div className="text-center py-4">
                    <p className="text-sm text-destructive mb-2">{nutritionError}</p>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={refetchNutrition}
                      leftIcon={<RefreshCw className="h-4 w-4" />}
                    >
                      {t('common.retry')}
                    </Button>
                  </div>
                ) : nutritionData ? (
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{t('nutrition.calories')}</span>
                      <span className="font-medium">{nutritionData.calories} {t('nutrition.kcal')}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{t('nutrition.protein')}</span>
                      <span className="font-medium">{nutritionData.protein} {t('nutrition.grams')}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{t('nutrition.carbs')}</span>
                      <span className="font-medium">{nutritionData.carbs} {t('nutrition.grams')}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{t('nutrition.fat')}</span>
                      <span className="font-medium">{nutritionData.fat} {t('nutrition.grams')}</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    {t('nutrition.notAvailable')}
                  </p>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Availability Info */}
          {item.availability && (
            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    {t('item.availability')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{t('item.inStock')}</span>
                    <Badge variant={item.availability.in_stock ? "success" : "destructive"}>
                      {item.availability.in_stock ? t('item.available') : t('item.outOfStock')}
                    </Badge>
                  </div>
                  {item.availability.estimated_prep_time && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{t('item.prepTime')}</span>
                      <span>{item.availability.estimated_prep_time}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Quick Actions */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle>{t('item.quickActions')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full gap-2"
                  onClick={refetchItem}
                  loading={itemLoading}
                >
                  <RefreshCw className="h-4 w-4" />
                  {t('item.refreshItemData')}
                </Button>
                
                <Button asChild variant="outline" className="w-full gap-2">
                  <Link to="/menu">
                    <Package className="h-4 w-4" />
                    {t('item.browseMoreItems')}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}
