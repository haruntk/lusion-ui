import * as React from "react"
import { motion } from "framer-motion"
import { 
  QrCode, 
  Download, 
  Share2,
  Grid3X3,
  List,
  Search,
  ArrowLeft
} from "lucide-react"
import { 
  Button, 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  Input,
  Badge,
  Spinner
} from "@/components/ui"
import { ErrorState, EmptyState } from "@/components/common"
import { useItems } from "@/hooks"
import { Link } from "react-router-dom"

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.5,
      staggerChildren: 0.1
    }
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

export function QrCodesPage() {
  const [searchQuery, setSearchQuery] = React.useState("")
  const [viewMode, setViewMode] = React.useState<'grid' | 'list'>('grid')

  React.useEffect(() => {
    document.title = "QR Codes - Lusion AR Dining"
  }, [])

  // Memoize options to prevent infinite re-renders
  const itemsOptions = React.useMemo(() => ({
    enabled: true,
    refetchInterval: undefined,
  }), [])

  const { 
    data: items, 
    loading, 
    error, 
    refetch,
    isEmpty,
    searchItems
  } = useItems(itemsOptions)

  // Filter items based on search
  const filteredItems = React.useMemo(() => {
    return searchQuery.trim() ? searchItems(searchQuery.trim()) : items
  }, [items, searchQuery, searchItems])

  const handleDownloadQr = (itemId: string, itemName: string) => {
    // Create download link for QR code
    const qrUrl = `/qr/${itemId}`
    const link = document.createElement('a')
    link.href = qrUrl
    link.download = `${itemName}-qr.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (loading) {
    return (
      <motion.div
        variants={pageVariants}
        initial="initial"
        animate="animate"
        className="container mx-auto px-4 py-8"
      >
        <div className="text-center py-16">
          <Spinner size="lg" className="mx-auto mb-4" />
          <h1 className="text-2xl font-semibold mb-2">Loading QR Codes</h1>
          <p className="text-muted-foreground">Preparing AR QR codes for all menu items...</p>
        </div>
      </motion.div>
    )
  }

  if (error) {
    return (
      <motion.div
        variants={pageVariants}
        initial="initial"
        animate="animate"
        className="container mx-auto px-4 py-8"
      >
        <ErrorState
          title="Failed to Load QR Codes"
          message={error}
          retry={refetch}
        />
      </motion.div>
    )
  }

  if (isEmpty) {
    return (
      <motion.div
        variants={pageVariants}
        initial="initial"
        animate="animate"
        className="container mx-auto px-4 py-8"
      >
        <EmptyState
          title="No QR Codes Available"
          message="No menu items available to generate QR codes."
          action={{
            label: "Refresh",
            onClick: refetch
          }}
        />
      </motion.div>
    )
  }

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      className="container mx-auto px-4 py-8"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="mb-8">
        <Button asChild variant="ghost" className="mb-6 gap-2">
          <Link to="/">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </Button>
        
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              QR Codes
            </h1>
            <p className="text-muted-foreground text-lg">
              Download QR codes for AR experiences of all menu items
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex border rounded-lg p-1">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Search */}
      <motion.div variants={itemVariants} className="mb-8">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search items for QR codes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </motion.div>

      {/* QR Codes Grid */}
      {filteredItems.length === 0 ? (
        <motion.div variants={itemVariants}>
          <EmptyState
            title="No Items Found"
            message={`No items match "${searchQuery}". Try adjusting your search.`}
            action={{
              label: "Clear Search",
              onClick: () => setSearchQuery("")
            }}
          />
        </motion.div>
      ) : (
        <motion.div 
          variants={itemVariants}
          className={
            viewMode === 'grid' 
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              : "space-y-4"
          }
        >
          {filteredItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
              whileHover={{ scale: 1.02, y: -2 }}
            >
              <Card className="h-full hover:shadow-lg transition-shadow duration-300">
                <CardHeader className="text-center">
                  <div className="mx-auto mb-4 p-4 bg-muted rounded-lg">
                    <img
                      src={`/qr/${item.id}`}
                      alt={`QR Code for ${item.name}`}
                      className="w-32 h-32 mx-auto"
                      loading="lazy"
                    />
                  </div>
                  <CardTitle className="text-lg">{item.name}</CardTitle>
                  <Badge variant="outline" className="text-xs">
                    {item.category}
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground text-center line-clamp-2">
                    {item.description}
                  </p>
                  
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 gap-1"
                      onClick={() => handleDownloadQr(item.id, item.name)}
                    >
                      <Download className="h-3 w-3" />
                      Download
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 gap-1"
                      onClick={() => {
                        if (navigator.share) {
                          navigator.share({
                            title: `AR View: ${item.name}`,
                            url: `/ar-start/${item.id}`
                          })
                        } else {
                          navigator.clipboard.writeText(`${window.location.origin}/ar-start/${item.id}`)
                        }
                      }}
                    >
                      <Share2 className="h-3 w-3" />
                      Share
                    </Button>
                  </div>
                  
                  <Button asChild size="sm" className="w-full gap-2">
                    <Link to={`/menu/${item.id}`}>
                      <QrCode className="h-3 w-3" />
                      View Item
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  )
}
