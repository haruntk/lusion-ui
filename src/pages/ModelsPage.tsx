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
  Package,
  UtensilsCrossed,
  Building2,
  Layers,
  ChevronDown,
  Plus
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
import type { Item } from '@/types/item.schema'

// Items per page for pagination
const ITEMS_PER_PAGE = 8

// Model category types
type ModelCategory = 'food' | 'real_estate' | 'other'
type CategoryFilter = ModelCategory | 'all'

// Category configuration with icons and colors
const CATEGORY_CONFIG: Record<ModelCategory, {
  icon: React.ReactNode
  color: string
  bgColor: string
  borderColor: string
  activeColor: string
}> = {
  food: {
    icon: <UtensilsCrossed className="h-5 w-5" />,
    color: 'text-orange-600 dark:text-orange-400',
    bgColor: 'bg-orange-50 dark:bg-orange-950/30',
    borderColor: 'border-orange-200 dark:border-orange-800',
    activeColor: 'bg-orange-600 text-white hover:bg-orange-700'
  },
  real_estate: {
    icon: <Building2 className="h-5 w-5" />,
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-50 dark:bg-blue-950/30',
    borderColor: 'border-blue-200 dark:border-blue-800',
    activeColor: 'bg-blue-600 text-white hover:bg-blue-700'
  },
  other: {
    icon: <Layers className="h-5 w-5" />,
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-50 dark:bg-purple-950/30',
    borderColor: 'border-purple-200 dark:border-purple-800',
    activeColor: 'bg-purple-600 text-white hover:bg-purple-700'
  }
}

// Category matching patterns (case-insensitive)
const CATEGORY_PATTERNS: Record<ModelCategory, string[]> = {
  food: ['food', 'yemek', 'yiyecek', 'içecek', 'tatlı', 'ana yemek', 'meze', 'kebap', 'dessert', 'drink', 'main course', 'appetizer', 'طعام', 'مشروب'],
  real_estate: ['real estate', 'gayrimenkul', 'emlak', 'konut', 'building', 'property', 'house', 'apartment', 'عقارات', 'منزل'],
  other: [] // Catch-all for anything that doesn't match
}

// Function to determine category group
function getCategoryGroup(category: string): ModelCategory {
  const lowerCategory = category.toLowerCase().trim()
  
  for (const [group, patterns] of Object.entries(CATEGORY_PATTERNS)) {
    if (group === 'other') continue // Skip other as it's the fallback
    
    for (const pattern of patterns) {
      if (lowerCategory.includes(pattern.toLowerCase()) || pattern.toLowerCase().includes(lowerCategory)) {
        return group as ModelCategory
      }
    }
  }
  
  return 'other'
}

// Group items by category
function groupItemsByCategory(items: Item[]): Record<ModelCategory, Item[]> {
  const groups: Record<ModelCategory, Item[]> = {
    food: [],
    real_estate: [],
    other: []
  }
  
  items.forEach(item => {
    const group = getCategoryGroup(item.category)
    groups[group].push(item)
  })
  
  return groups
}

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

const sectionVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.4,
      staggerChildren: 0.05
    }
  }
}

// Category Section Component
interface CategorySectionProps {
  categoryKey: ModelCategory
  items: Item[]
  viewMode: 'grid' | 'list'
  searchQuery: string
  t: (key: string, params?: Record<string, any>) => string
  isExpanded: boolean
  onToggle: () => void
  visibleCount: number
  onLoadMore: () => void
}

function CategorySection({ 
  categoryKey, 
  items, 
  viewMode, 
  searchQuery,
  t, 
  isExpanded, 
  onToggle,
  visibleCount,
  onLoadMore
}: CategorySectionProps) {
  const config = CATEGORY_CONFIG[categoryKey]
  
  // Filter items based on search query
  const filteredItems = React.useMemo(() => {
    if (!searchQuery.trim()) return items
    
    const query = searchQuery.toLowerCase().trim()
    return items.filter(item =>
      item.name.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query) ||
      item.category.toLowerCase().includes(query)
    )
  }, [items, searchQuery])
  
  // Get visible items based on pagination
  const visibleItems = React.useMemo(() => {
    return filteredItems.slice(0, visibleCount)
  }, [filteredItems, visibleCount])
  
  const hasMoreItems = filteredItems.length > visibleCount
  const remainingCount = filteredItems.length - visibleCount
  
  if (filteredItems.length === 0) {
    return null
  }
  
  return (
    <motion.section
      variants={sectionVariants}
      initial="initial"
      animate="animate"
      className={`mb-8 rounded-xl border-2 ${config.borderColor} ${config.bgColor} overflow-hidden`}
    >
      {/* Section Header */}
      <button
        onClick={onToggle}
        className={`w-full px-6 py-4 flex items-center justify-between hover:bg-black/5 dark:hover:bg-white/5 transition-colors`}
      >
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${config.bgColor} ${config.color}`}>
            {config.icon}
          </div>
          <div className="text-left">
            <h2 className={`text-xl font-bold ${config.color}`}>
              {t(`models.categories.${categoryKey}`)}
            </h2>
            <p className="text-sm text-muted-foreground">
              {filteredItems.length} {t('models.itemsCount')}
            </p>
          </div>
        </div>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className={`h-5 w-5 ${config.color}`} />
        </motion.div>
      </button>
      
      {/* Section Content */}
      <motion.div
        initial={false}
        animate={{ 
          height: isExpanded ? 'auto' : 0,
          opacity: isExpanded ? 1 : 0
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="overflow-hidden"
      >
        <div className="px-6 pb-6">
          <div className={
            viewMode === 'grid' 
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
              : "space-y-4"
          }>
            {visibleItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03, duration: 0.3 }}
                whileHover={{ 
                  scale: 1.02, 
                  y: -2,
                  transition: { type: "spring", stiffness: 300, damping: 20 }
                }}
              >
                <Link to={`/models/${item.id}`} className="block h-full">
                  <Card className="h-full hover:shadow-lg transition-shadow duration-300 group cursor-pointer bg-background">
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
                        {item.has_ar_model && (
                          <Badge variant="secondary" className="text-xs ml-2 flex-shrink-0">
                            <Sparkles className="h-3 w-3 mr-1" />
                            AR
                          </Badge>
                        )}
                      </div>
                      <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                        {item.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xl font-bold text-primary">
                          {item.price}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {item.category}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
          
          {/* Load More Button */}
          {hasMoreItems && (
            <motion.div 
              className="mt-6 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <Button
                variant="outline"
                onClick={onLoadMore}
                className={`gap-2 ${config.color} border-current hover:${config.bgColor}`}
              >
                <Plus className="h-4 w-4" />
                {t('models.loadMore', { count: Math.min(remainingCount, ITEMS_PER_PAGE) })}
                <Badge variant="secondary" className="ml-2 text-xs">
                  +{remainingCount}
                </Badge>
              </Button>
            </motion.div>
          )}
        </div>
      </motion.div>
    </motion.section>
  )
}

export function ModelsPage() {
  const location = useLocation()
  const { lang, t } = useLanguage()
  const [searchQuery, setSearchQuery] = React.useState("")
  const [viewMode, setViewMode] = React.useState<'grid' | 'list'>('grid')
  const [categoryFilter, setCategoryFilter] = React.useState<CategoryFilter>('all')
  const [expandedSections, setExpandedSections] = React.useState<Record<ModelCategory, boolean>>({
    food: true,
    real_estate: true,
    other: true
  })
  
  // Pagination state for each category
  const [visibleCounts, setVisibleCounts] = React.useState<Record<ModelCategory, number>>({
    food: ITEMS_PER_PAGE,
    real_estate: ITEMS_PER_PAGE,
    other: ITEMS_PER_PAGE
  })

  // Set document title for accessibility
  React.useEffect(() => {
    document.title = t('models.headerTitle') + ' - Lusion AR'
  }, [t])

  // Memoize options to prevent infinite re-renders
  const itemsOptions = React.useMemo(() => ({
    enabled: true,
    refetchInterval: undefined
  }), [lang])

  const { 
    data: items, 
    loading, 
    error, 
    refetch,
    isEmpty
  } = useItems(itemsOptions)

  // Defensive revalidation when arriving to /models from other routes
  React.useEffect(() => {
    if (location.pathname === '/models') {
      refetch()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, lang])

  // Refetch when language changes
  React.useEffect(() => {
    refetch()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang])

  // Auto recover if empty without error after a brief moment
  React.useEffect(() => {
    if (!loading && !error && items.length === 0) {
      const timeout = setTimeout(() => {
        refetch()
      }, 200)
      return () => clearTimeout(timeout)
    }
  }, [items.length, loading, error, refetch, lang])

  // Reset pagination when search query or category filter changes
  React.useEffect(() => {
    setVisibleCounts({
      food: ITEMS_PER_PAGE,
      real_estate: ITEMS_PER_PAGE,
      other: ITEMS_PER_PAGE
    })
  }, [searchQuery, categoryFilter])

  // Group items by category
  const groupedItems = React.useMemo(() => {
    return groupItemsByCategory(items)
  }, [items])

  // Count items per section (for search results)
  const sectionCounts = React.useMemo(() => {
    const query = searchQuery.toLowerCase().trim()
    if (!query) {
      return {
        food: groupedItems.food.length,
        real_estate: groupedItems.real_estate.length,
        other: groupedItems.other.length
      }
    }
    
    const filterItems = (items: Item[]) => items.filter(item =>
      item.name.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query) ||
      item.category.toLowerCase().includes(query)
    ).length
    
    return {
      food: filterItems(groupedItems.food),
      real_estate: filterItems(groupedItems.real_estate),
      other: filterItems(groupedItems.other)
    }
  }, [groupedItems, searchQuery])

  const totalFilteredCount = sectionCounts.food + sectionCounts.real_estate + sectionCounts.other

  // Toggle section expansion
  const toggleSection = (section: ModelCategory) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  // Expand/Collapse all sections
  const toggleAllSections = (expanded: boolean) => {
    setExpandedSections({
      food: expanded,
      real_estate: expanded,
      other: expanded
    })
  }
  
  // Load more items for a category
  const loadMoreItems = (category: ModelCategory) => {
    setVisibleCounts(prev => ({
      ...prev,
      [category]: prev[category] + ITEMS_PER_PAGE
    }))
  }
  
  // Handle category filter change
  const handleCategoryFilterChange = (filter: CategoryFilter) => {
    setCategoryFilter(filter)
    // Expand only the selected category, or all if 'all' is selected
    if (filter === 'all') {
      setExpandedSections({
        food: true,
        real_estate: true,
        other: true
      })
    } else {
      setExpandedSections({
        food: filter === 'food',
        real_estate: filter === 'real_estate',
        other: filter === 'other'
      })
    }
  }

  // Handle loading state
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
          <h1 className="text-2xl font-semibold mb-2">{t('models.loadingTitle')}</h1>
          <p className="text-muted-foreground">{t('models.loadingSubtitle')}</p>
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
          title={t('models.failedTitle')}
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
          title={t('models.emptyTitle')}
          message={t('models.emptyDesc')}
          action={{
            label: t('models.emptyRefreshLabel'),
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
              {t('models.headerTitle')}
            </h1>
            <p className="text-muted-foreground text-lg">
              {t('models.headerSubtitle')}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={refetch}
              disabled={loading}
              aria-label={t('common.refresh')}
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

      {/* Category Filter Buttons */}
      <motion.div variants={itemVariants} className="mb-6">
        <div className="flex flex-wrap gap-2">
          <Button
            variant={categoryFilter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleCategoryFilterChange('all')}
            className="gap-2"
          >
            <Filter className="h-4 w-4" />
            {t('models.filterAll')}
            <Badge variant="secondary" className="ml-1">
              {items.length}
            </Badge>
          </Button>
          
          {sectionCounts.food > 0 && (
            <Button
              variant={categoryFilter === 'food' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleCategoryFilterChange('food')}
              className={`gap-2 ${categoryFilter === 'food' ? CATEGORY_CONFIG.food.activeColor : CATEGORY_CONFIG.food.color}`}
            >
              <UtensilsCrossed className="h-4 w-4" />
              {t('models.categories.food')}
              <Badge variant="secondary" className="ml-1">
                {sectionCounts.food}
              </Badge>
            </Button>
          )}
          
          {sectionCounts.real_estate > 0 && (
            <Button
              variant={categoryFilter === 'real_estate' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleCategoryFilterChange('real_estate')}
              className={`gap-2 ${categoryFilter === 'real_estate' ? CATEGORY_CONFIG.real_estate.activeColor : CATEGORY_CONFIG.real_estate.color}`}
            >
              <Building2 className="h-4 w-4" />
              {t('models.categories.real_estate')}
              <Badge variant="secondary" className="ml-1">
                {sectionCounts.real_estate}
              </Badge>
            </Button>
          )}
          
          {sectionCounts.other > 0 && (
            <Button
              variant={categoryFilter === 'other' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleCategoryFilterChange('other')}
              className={`gap-2 ${categoryFilter === 'other' ? CATEGORY_CONFIG.other.activeColor : CATEGORY_CONFIG.other.color}`}
            >
              <Layers className="h-4 w-4" />
              {t('models.categories.other')}
              <Badge variant="secondary" className="ml-1">
                {sectionCounts.other}
              </Badge>
            </Button>
          )}
        </div>
      </motion.div>

      {/* Search and Controls */}
      <motion.div variants={itemVariants} className="mb-8 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder={t('models.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              aria-label={t('models.searchPlaceholder')}
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchQuery("")
                setCategoryFilter('all')
              }}
              disabled={!searchQuery && categoryFilter === 'all'}
              aria-label={t('common.clearSearch')}
            >
              <Filter className="h-4 w-4 mr-2" />
              {t('common.clearFilters')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => toggleAllSections(true)}
              aria-label={t('models.expandAll')}
            >
              {t('models.expandAll')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => toggleAllSections(false)}
              aria-label={t('models.collapseAll')}
            >
              {t('models.collapseAll')}
            </Button>
          </div>
        </div>

        {/* Results Summary */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {searchQuery 
              ? t('models.searchResults', { count: totalFilteredCount, total: items.length })
              : t('models.totalItems', { count: items.length })}
            {categoryFilter !== 'all' && ` • ${t(`models.categories.${categoryFilter}`)}`}
          </p>
          <div className="flex gap-2">
            {sectionCounts.food > 0 && (categoryFilter === 'all' || categoryFilter === 'food') && (
              <Badge variant="outline" className={CATEGORY_CONFIG.food.color}>
                <UtensilsCrossed className="h-3 w-3 mr-1" />
                {sectionCounts.food}
              </Badge>
            )}
            {sectionCounts.real_estate > 0 && (categoryFilter === 'all' || categoryFilter === 'real_estate') && (
              <Badge variant="outline" className={CATEGORY_CONFIG.real_estate.color}>
                <Building2 className="h-3 w-3 mr-1" />
                {sectionCounts.real_estate}
              </Badge>
            )}
            {sectionCounts.other > 0 && (categoryFilter === 'all' || categoryFilter === 'other') && (
              <Badge variant="outline" className={CATEGORY_CONFIG.other.color}>
                <Layers className="h-3 w-3 mr-1" />
                {sectionCounts.other}
              </Badge>
            )}
          </div>
        </div>
      </motion.div>

      {/* No Results Message */}
      {totalFilteredCount === 0 && searchQuery && (
        <motion.div variants={itemVariants}>
          <EmptyState
            title={t('common.noItemsFoundTitle')}
            message={t('models.noSearchResults', { query: searchQuery })}
            action={{
              label: t('common.clearFilters'),
              onClick: () => setSearchQuery("")
            }}
          />
        </motion.div>
      )}

      {/* Category Sections */}
      {totalFilteredCount > 0 && (
        <motion.div variants={itemVariants}>
          {/* Food Section */}
          {(categoryFilter === 'all' || categoryFilter === 'food') && (
            <CategorySection
              categoryKey="food"
              items={groupedItems.food}
              viewMode={viewMode}
              searchQuery={searchQuery}
              t={t}
              isExpanded={expandedSections.food}
              onToggle={() => toggleSection('food')}
              visibleCount={visibleCounts.food}
              onLoadMore={() => loadMoreItems('food')}
            />
          )}

          {/* Real Estate Section */}
          {(categoryFilter === 'all' || categoryFilter === 'real_estate') && (
            <CategorySection
              categoryKey="real_estate"
              items={groupedItems.real_estate}
              viewMode={viewMode}
              searchQuery={searchQuery}
              t={t}
              isExpanded={expandedSections.real_estate}
              onToggle={() => toggleSection('real_estate')}
              visibleCount={visibleCounts.real_estate}
              onLoadMore={() => loadMoreItems('real_estate')}
            />
          )}

          {/* Other Section */}
          {(categoryFilter === 'all' || categoryFilter === 'other') && (
            <CategorySection
              categoryKey="other"
              items={groupedItems.other}
              viewMode={viewMode}
              searchQuery={searchQuery}
              t={t}
              isExpanded={expandedSections.other}
              onToggle={() => toggleSection('other')}
              visibleCount={visibleCounts.other}
              onLoadMore={() => loadMoreItems('other')}
            />
          )}
        </motion.div>
      )}

      {/* Back to Top */}
      {items.length > 12 && (
        <motion.div
          variants={itemVariants}
          className="text-center mt-12"
        >
          <Button
            variant="outline"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            aria-label={t('common.backToTop')}
          >
            {t('common.backToTop')}
            <ArrowRight className="h-4 w-4 ml-2 rotate-[-90deg]" />
          </Button>
        </motion.div>
      )}
    </motion.div>
  )
}
