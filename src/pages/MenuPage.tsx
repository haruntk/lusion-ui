import * as React from "react"
import { Link, useLocation } from "react-router-dom"
import { motion } from "framer-motion"
import { 
  Search, 
  Filter, 
  Grid3X3, 
  List,
  ArrowRight,
  Sparkles,
  RefreshCw,
  Package
} from "lucide-react"
import { 
  Button, 
  Card, 
  CardContent, 
  CardHeader, 
  Input,
  Badge,
  Spinner
} from "@/components/ui"
import { ErrorState, EmptyState } from "@/components/common"
import { useItems } from "@/hooks"
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
  initial: { opacity: 0 },
  animate: { 
    opacity: 1,
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 24
    }
  }
}

export function MenuPage() {
  const location = useLocation()
  const { lang, t } = useLanguage()
  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedCategory, setSelectedCategory] = React.useState<string | null>(null)
  const [viewMode, setViewMode] = React.useState<'grid' | 'list'>('grid')

  // Set document title for accessibility
  React.useEffect(() => {
    document.title = t('menu.headerTitle') + ' - Lusion AR Dining'
  }, [])

  // Memoize options to prevent infinite re-renders
  const itemsOptions = React.useMemo(() => ({
    enabled: true,
    refetchInterval: undefined, // No auto-refresh
    params: { search: searchQuery || undefined, category: selectedCategory || undefined }
  }), [lang, searchQuery, selectedCategory])

  const { 
    data: items, 
    categories, 
    loading, 
    error, 
    refetch,
    isEmpty,
    searchItems,
    getItemsByCategory
  } = useItems(itemsOptions)

  // Defensive revalidation when arriving to /menu from other routes
  React.useEffect(() => {
    if (location.pathname === '/menu') {
      // Refetch to ensure fresh data after navigating back from details or language change
      refetch()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, lang])

  // Refetch when language changes to avoid showing stale cached data
  React.useEffect(() => {
    refetch()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang])

  // Auto recover if empty without error after a brief moment (race protection)
  React.useEffect(() => {
    if (!loading && !error && items.length === 0) {
      const t = setTimeout(() => {
        refetch()
      }, 200)
      return () => clearTimeout(t)
    }
  }, [items.length, loading, error, refetch, lang])

  // Filter items based on search and category
  const filteredItems = React.useMemo(() => {
    let result = items

    if (searchQuery.trim()) {
      result = searchItems(searchQuery.trim())
    }

    if (selectedCategory) {
      result = getItemsByCategory(selectedCategory)
    }

    return result
  }, [items, searchQuery, selectedCategory, searchItems, getItemsByCategory])

  // Handle loading state (avoid full-page blank by keeping skeleton ready)
  if (loading && items.length === 0) {
    return (
      <motion.div
        variants={pageVariants}
        initial="initial"
        animate="animate"
        className="container mx-auto px-4 py-8"
      >
        <div className="text-center py-16">
          <Spinner size="lg" className="mx-auto mb-4" />
          <h1 className="text-2xl font-semibold mb-2">{t('menu.loadingTitle')}</h1>
          <p className="text-muted-foreground">{t('menu.loadingSubtitle')}</p>
        </div>
      </motion.div>
    )
  }

  // Handle error state
  if (error) {
    return (
      <motion.div
        variants={pageVariants}
        initial="initial"
        animate="animate"
        className="container mx-auto px-4 py-8"
      >
        <ErrorState
          title={t('menu.failedTitle')}
          message={error}
          retry={refetch}
        />
      </motion.div>
    )
  }

  // Handle empty state
  if (isEmpty) {
    return (
      <motion.div
        variants={pageVariants}
        initial="initial"
        animate="animate"
        className="container mx-auto px-4 py-8"
      >
        <EmptyState
          title={t('menu.emptyAvailableTitle')}
          message={t('menu.emptyAvailableDesc')}
          action={{
            label: t('menu.emptyRefreshLabel'),
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
      exit="exit"
      className="container mx-auto px-4 py-8"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              {t('menu.headerTitle')}
            </h1>
            <p className="text-muted-foreground text-lg">
              {t('menu.headerSubtitle')}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={refetch}
              disabled={loading}
              aria-label="Refresh menu items"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
            <div className="flex border rounded-lg p-1">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                aria-label="Grid view"
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                aria-label="List view"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Search and Filters */}
      <motion.div variants={itemVariants} className="mb-8 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder={t('menu.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              aria-label="Search menu items"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => {
              setSearchQuery("")
              setSelectedCategory(null)
            }}
            disabled={!searchQuery && !selectedCategory}
            aria-label="Clear all filters"
          >
            <Filter className="h-4 w-4 mr-2" />
            {t('common.clearFilters')}
          </Button>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedCategory === null ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(null)}
            aria-label="Show all categories"
          >
            {t('menu.allCategories', { count: items.length })}
          </Button>
          {categories.map((category) => (
            <Button
              key={category.name}
              variant={selectedCategory === category.name ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category.name)}
              className="capitalize"
              aria-label={`Filter by ${category.name} category`}
            >
              {category.name} {category.count && `(${category.count})`}
            </Button>
          ))}
        </div>
      </motion.div>

      {/* Results Info */}
      <motion.div variants={itemVariants} className="mb-6">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {filteredItems.length === items.length 
              ? t('menu.resultsSummaryAll', { count: items.length })
              : t('menu.resultsSummarySome', { shown: filteredItems.length, total: items.length })}
            {searchQuery && ` "${searchQuery}"`}
            {selectedCategory && ` / ${selectedCategory}`}
          </p>
          <Badge variant="outline" className="text-xs">
            {filteredItems.length} {t('menu.resultsLabel')}
          </Badge>
        </div>
      </motion.div>

      {/* Menu Items */}
      {filteredItems.length === 0 ? (
        <motion.div variants={itemVariants}>
          {searchQuery || selectedCategory ? (
            <EmptyState
              title={t('common.noItemsFoundTitle')}
              message={`No items match your current filters${searchQuery ? ` for "${searchQuery}"` : ''}${selectedCategory ? ` in ${selectedCategory}` : ''}.`}
              action={{
                label: t('common.clearFilters'),
                onClick: () => {
                  setSearchQuery("")
                  setSelectedCategory(null)
                }
              }}
            />
          ) : (
            <EmptyState
              title={t('menu.emptyNoItemsTitle')}
              message={t('menu.emptyNoItemsDesc')}
              action={{
                label: t('common.refresh'),
                onClick: refetch
              }}
            />
          )}
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
              whileHover={{ 
                scale: 1.02, 
                y: -2,
                transition: { type: "spring", stiffness: 300, damping: 20 }
              }}
            >
              <Card className="h-full hover:shadow-lg transition-shadow duration-300 group">
                <CardHeader className="p-0">
                  <div className={`${viewMode === 'grid' ? 'aspect-video' : 'aspect-[4/3] md:aspect-video'} bg-muted rounded-t-lg overflow-hidden`}>
                    {item.image && item.image !== "" ? (
                      <img
                        src={item.image}
                        alt={`${item.name} - ${item.description}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                        <Package className="h-12 w-12 text-muted-foreground/30" />
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-lg leading-tight">
                      {item.name}
                    </h3>
                    <Badge variant="outline" className="text-xs ml-2 flex-shrink-0">
                      {item.category}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                    {item.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold text-primary">
                      {item.price}
                    </span>
                    <div className="flex gap-2">
                      {item.has_ar_model ? (
                        <Button asChild size="sm" variant="outline">
                          <Link 
                            to={`/menu/${item.id}`}
                            aria-label={`View ${item.name} details and AR experience`}
                          >
                            <Sparkles className="h-4 w-4 mr-1" />
                            {t('common.viewAr')}
                          </Link>
                        </Button>
                      ) : (
                        <Button asChild size="sm" variant="outline">
                          <Link 
                            to={`/menu/${item.id}`}
                            aria-label={`View ${item.name} details`}
                          >
                            {t('common.details')}
                          </Link>
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Back to Top */}
      {filteredItems.length > 12 && (
        <motion.div
          variants={itemVariants}
          className="text-center mt-12"
        >
          <Button
            variant="outline"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            aria-label="Scroll to top of page"
          >
            {t('common.backToTop')}
            <ArrowRight className="h-4 w-4 ml-2 rotate-[-90deg]" />
          </Button>
        </motion.div>
      )}
    </motion.div>
  )
}
