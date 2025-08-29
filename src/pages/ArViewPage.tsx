import * as React from "react"
import { useSearchParams, useParams, Link } from "react-router-dom"
import { ArrowLeft, Smartphone, Info } from "lucide-react"
import { Button, Card, CardContent, CardHeader, CardTitle, Badge } from "@/components/ui"
import { useItem, useItems } from "@/hooks"
import { startArSession } from "@/api/ar"
import { motion } from "framer-motion"
import { ArViewer } from "@/components/ar"

export function ArViewPage() {
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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 text-white flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-slate-800/80 border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-center text-white">AR Experience Unavailable</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-slate-300">
              Currently no AR model available to display. Please try again later.
            </p>
            <div className="space-y-2">
              <Button asChild className="gap-2 w-full">
                <Link to="/menu">
                  <ArrowLeft className="h-4 w-4" />
                  Explore Menu
                </Link>
              </Button>
              <Button asChild variant="outline" className="gap-2 w-full">
                <Link to="/">
                  <ArrowLeft className="h-4 w-4" />
                  Home Page
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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 flex items-center justify-center">
        <div className="text-center text-white">
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
          <h2 className="text-xl font-semibold mb-2">Loading AR Experience...</h2>
          <p className="text-slate-300">Preparing 3D model</p>
        </div>
      </div>
    )
  }

  if (error || (!loading && !item && targetItemId)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 text-white flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-slate-800/80 border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-center text-white">AR Model Could Not Load</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-slate-300">
              {error || "The requested AR model cannot be loaded. Please try another model."}
            </p>
            <div className="space-y-2">
              <Button asChild className="gap-2 w-full">
                <Link to="/menu">
                  <ArrowLeft className="h-4 w-4" />
                  Explore Menu
                </Link>
              </Button>
              <Button asChild variant="outline" className="gap-2 w-full">
                <Link to="/">
                  <ArrowLeft className="h-4 w-4" />
                  Home Page
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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 text-white flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-slate-800/80 border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-center text-white">AR Model Not Found</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-slate-300">
              AR model cannot be loaded. Please refresh the page or try another model.
            </p>
            <div className="space-y-2">
              <Button asChild className="gap-2 w-full">
                <Link to="/menu">
                  <ArrowLeft className="h-4 w-4" />
                  Explore Menu
                </Link>
              </Button>
              <Button asChild variant="outline" className="gap-2 w-full">
                <Link to="/">
                  <ArrowLeft className="h-4 w-4" />
                  Home Page
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
          <Button asChild variant="ghost" size="sm" className="text-white/80 hover:text-white hover:bg-white/10 transition-all">
            <Link to="/menu" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="text-center">
            <Badge variant="secondary" className="text-xs px-3 py-1 bg-white/10 text-white/90 border-white/20">
              AR Experience
            </Badge>
          </div>
          <Button asChild variant="ghost" size="sm" className="text-white/80 hover:text-white hover:bg-white/10 transition-all">
            <Link to={`/menu/${item.id}`} className="gap-2">
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
                <h1 className="text-3xl md:text-4xl font-bold text-white">
                  {item.name}
                </h1>
                <div className="flex items-center justify-center gap-4">
                  <Badge variant="secondary" className="px-4 py-1 text-sm">
                    {item.category}
                  </Badge>
                  <span className="text-2xl font-bold text-white">₺{item.price}</span>
                </div>
              </div>

              {/* Description */}
              <p className="text-lg text-gray-300 leading-relaxed max-w-lg mx-auto">
                {item.description}
              </p>

              {/* AR Features - Simplified */}
              <div className="flex flex-wrap items-center justify-center gap-6 py-6">
                <div className="flex items-center gap-2 text-white/80">
                  <div className="h-1.5 w-1.5 bg-green-400 rounded-full"></div>
                  <span className="text-sm">360° View</span>
                </div>
                <div className="flex items-center gap-2 text-white/80">
                  <div className="h-1.5 w-1.5 bg-green-400 rounded-full"></div>
                  <span className="text-sm">Real Scale</span>
                </div>
                <div className="flex items-center gap-2 text-white/80">
                  <div className="h-1.5 w-1.5 bg-green-400 rounded-full"></div>
                  <span className="text-sm">HD Quality</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Button onClick={handleStartAr} size="lg" className="px-8">
                  Start AR Experience
                </Button>
                <Button asChild variant="outline" size="lg" className="px-8 bg-white/10 border-white/20 text-white hover:bg-white/20">
                  <Link to="/menu">
                    Return to Menu
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