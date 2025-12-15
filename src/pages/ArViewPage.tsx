import * as React from "react"
import { useSearchParams, useParams, Link } from "react-router-dom"
import { ArrowLeft, Smartphone, Info } from "lucide-react"
import { Button, Card, CardContent, CardHeader, CardTitle, Badge } from "@/components/ui"
import { useItem, useItems } from "@/hooks"
import { startArSession } from "@/api/ar"
import { motion } from "framer-motion"
import { ArViewer } from "@/components/ar"
import { useLanguage } from '@/hooks/useLanguage'
import { localizeItemFields } from '@/utils/i18n'

export function ArViewPage() {
  const { t } = useLanguage()
  const { itemId: paramItemId } = useParams<{ itemId: string }>()
  const [searchParams] = useSearchParams()
  const queryItemId = searchParams.get("item_id")
  
  // Always fetch all items to ensure we have a default item to show
  const { data: allItems, loading: itemsLoading } = useItems({ enabled: true })
  
  // Determine which item to show - prioritize param, then query param, then first available item
  const targetItemId = React.useMemo(() => {
    if (paramItemId && paramItemId.trim()) return paramItemId.trim()
    if (queryItemId && queryItemId.trim()) return queryItemId.trim()
    if (allItems && allItems.length > 0) return allItems[0].id
    return ""
  }, [paramItemId, queryItemId, allItems])
  
  // Fetch the target item
  const { data: item, loading: itemLoading, error } = useItem(targetItemId, { enabled: !!targetItemId })
  
  // Combined loading state
  const loading = itemsLoading || itemLoading
  


  // Start AR session handler - simply redirect to backend
  const handleStartAr = React.useCallback(() => {
    if (!targetItemId) {
      console.warn('Cannot start AR: targetItemId missing')
      return
    }

    // Use the API function to redirect to backend AR start endpoint
    startArSession(targetItemId)
  }, [targetItemId])

  // Show error state only if there's a real error or no items available after loading
  if (!loading && !targetItemId && allItems && allItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white to-slate-100 dark:from-slate-900 dark:via-purple-900/20 dark:to-slate-900 text-foreground flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">{t('ar.unavailableTitle')}</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              {t('ar.unavailableDesc')}
            </p>
            <div className="space-y-2">
              <Button asChild className="gap-2 w-full">
                <Link to="/models">
                  <ArrowLeft className="h-4 w-4" />
                  {t('common.exploreModels')}
                </Link>
              </Button>
              <Button asChild variant="outline" className="gap-2 w-full">
                <Link to="/">
                  <ArrowLeft className="h-4 w-4" />
                  {t('common.homePage')}
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-200 dark:from-slate-900 dark:via-purple-900/20 dark:to-slate-900 flex items-center justify-center">
        <div className="text-center text-foreground">
          <motion.div
            animate={{ 
              rotate: 360,
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              rotate: { duration: 2, repeat: Infinity, ease: "linear" },
              scale: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
            }}
            className="relative mx-auto mb-6"
          >
            <Smartphone className="h-12 w-12 text-purple-400" />
            <div className="absolute inset-0 bg-purple-400/20 rounded-full blur-lg"></div>
          </motion.div>
          <h2 className="text-xl font-semibold mb-2">{t('ar.loadingTitle')}</h2>
          <p className="text-muted-foreground">{t('ar.loadingSubtitle')}</p>
        </div>
      </div>
    )
  }

  if (error || (!loading && !item && targetItemId)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white to-slate-100 dark:from-slate-900 dark:via-purple-900/20 dark:to-slate-900 text-foreground flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">{t('ar.errorTitle')}</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              {error || t('ar.errorDesc')}
            </p>
            <div className="space-y-2">
              <Button asChild className="gap-2 w-full">
                <Link to="/models">
                  <ArrowLeft className="h-4 w-4" />
                  {t('common.exploreModels')}
                </Link>
              </Button>
              <Button asChild variant="outline" className="gap-2 w-full">
                <Link to="/">
                  <ArrowLeft className="h-4 w-4" />
                  {t('common.homePage')}
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Safety check - if we get to this point, item should exist
  if (!item) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white to-slate-100 dark:from-slate-900 dark:via-purple-900/20 dark:to-slate-900 text-foreground flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">{t('ar.notFoundTitle')}</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              {t('ar.notFoundDesc')}
            </p>
            <div className="space-y-2">
              <Button asChild className="gap-2 w-full">
                <Link to="/models">
                  <ArrowLeft className="h-4 w-4" />
                  {t('common.exploreModels')}
                </Link>
              </Button>
              <Button asChild variant="outline" className="gap-2 w-full">
                <Link to="/">
                  <ArrowLeft className="h-4 w-4" />
                  {t('common.homePage')}
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    },
    exit: { 
      opacity: 0, 
      y: -20,
      transition: { duration: 0.3 }
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

  // Use our new ArViewer component
  return (
    <motion.div 
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="min-h-screen"
    >
      {/* Header - Minimalist */}
      <motion.header 
        variants={itemVariants}
        className="absolute top-0 left-0 right-0 z-50 p-6"
      >
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <Button asChild variant="ghost" size="sm" className="hover:bg-foreground/10 transition-all">
            <Link to="/models" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="text-center">
            <Badge variant="secondary" className="text-xs px-3 py-1">
              {t('common.arExperience')}
            </Badge>
          </div>
          <Button asChild variant="ghost" size="sm" className="hover:bg-foreground/10 transition-all">
            <Link to={`/models/${item.id}`} className="gap-2">
              <Info className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </motion.header>

      {/* Main AR Experience */}
      <main className="pt-16">
        <motion.div variants={itemVariants} className="w-full">
          {/* AR Viewer Component */}
          <ArViewer 
            itemId={item.id}
            itemName={item.name}
            itemDescription={item.description}
            showDebugInfo={false}
          />
          
          {/* Item Information Panel - Modern & Minimalist */}
          <div className="container mx-auto px-4 mt-16 max-w-2xl">
            <motion.div variants={itemVariants} className="text-center space-y-6">
              {/* Item Title & Category */}
              <div className="space-y-3">
                <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                  {localizeItemFields(item, (document.documentElement.getAttribute('lang') as 'en'|'tr'|'ar') || 'en').name}
                </h1>
                <div className="flex items-center justify-center gap-4">
                  <Badge variant="secondary" className="px-4 py-1 text-sm">
                    {localizeItemFields(item, (document.documentElement.getAttribute('lang') as 'en'|'tr'|'ar') || 'en').category}
                  </Badge>
                  <span className="text-2xl font-bold text-foreground">₺{item.price}</span>
                </div>
              </div>

              {/* Description */}
              <p className="text-lg text-foreground/80 leading-relaxed max-w-lg mx-auto">
                {localizeItemFields(item, (document.documentElement.getAttribute('lang') as 'en'|'tr'|'ar') || 'en').description}
              </p>

              {/* AR Features - Simplified */}
              <div className="flex flex-wrap items-center justify-center gap-6 py-6">
                <div className="flex items-center gap-2 text-foreground/80">
                  <div className="h-1.5 w-1.5 bg-green-400 rounded-full"></div>
                  <span className="text-sm">{t('ar.features.view360')}</span>
                </div>
                <div className="flex items-center gap-2 text-foreground/80">
                  <div className="h-1.5 w-1.5 bg-green-400 rounded-full"></div>
                  <span className="text-sm">{t('ar.features.realScale')}</span>
                </div>
                <div className="flex items-center gap-2 text-foreground/80">
                  <div className="h-1.5 w-1.5 bg-green-400 rounded-full"></div>
                  <span className="text-sm">{t('ar.features.hd')}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Button onClick={handleStartAr} size="lg" className="px-8">
                  {t('ar.ctaStart')}
                </Button>
                <Button asChild variant="outline" size="lg" className="px-8">
                  <Link to="/models">
                    {t('common.returnToModels')}
                  </Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </main>
    </motion.div>
  )
}