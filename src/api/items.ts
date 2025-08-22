import { z } from 'zod'
import { apiClient } from './client'
import { 
  ItemSchema, 
  ItemDetailSchema,
  CategorySchema,
  ItemSearchParamsSchema,
  validateItem,
  validateItemDetail,
  type Item, 
  type ItemDetail,
  type Category,
  type ItemSearchParams
} from '@/types/item.schema'

// Response schemas for API validation
const ItemsListResponseSchema = z.array(ItemSchema)
const CategoriesListResponseSchema = z.array(CategorySchema)

/**
 * Items API module
 * Handles all menu item related API calls with full type safety and validation
 */
export const itemsApi = {
  /**
   * Get all menu items
   * GET /api/items (Flask endpoint returns array directly)
   */
  async getAll(params?: ItemSearchParams): Promise<Item[]> {
    // Validate search parameters
    const validatedParams = params ? ItemSearchParamsSchema.parse(params) : undefined
    
    try {
      // Flask backend only supports /api/items endpoint - returns data directly as array
      console.log('Fetching items from /api/items')
      const response = await apiClient.get('/items')
      console.log('Raw response from Flask:', response.data)
      
      // Flask returns items array directly, not wrapped in response object
      const items = ItemsListResponseSchema.parse(response.data)
      console.log('Validated items:', items)
      
      // Apply client-side filtering if parameters provided
      let filteredItems = items
      if (validatedParams) {
        if (validatedParams.category) {
          filteredItems = filteredItems.filter(item => 
            item.category.toLowerCase() === validatedParams.category!.toLowerCase()
          )
        }
        if (validatedParams.search) {
          const query = validatedParams.search.toLowerCase()
          filteredItems = filteredItems.filter(item =>
            item.name.toLowerCase().includes(query) ||
            item.description.toLowerCase().includes(query) ||
            item.category.toLowerCase().includes(query)
          )
        }
      }
      
      return filteredItems
    } catch (error) {
      console.error('Error in itemsApi.getAll:', error)
      throw error
    }
  },

  /**
   * Get single item by ID
   * Note: Backend doesn't have dedicated /api/items/:id endpoint, so we fetch all and filter
   */
  async getById(id: string): Promise<ItemDetail | null> {
    if (!id || typeof id !== 'string') {
      throw new Error('Item ID is required and must be a string')
    }

    try {
      // Backend doesn't support individual item API endpoints
      // Use findById which fetches all items and filters client-side
      return await this.findById(id)
    } catch (error) {
      console.error(`Error fetching item ${id}:`, error)
      throw error
    }
  },

  /**
   * Find item by ID from all items list (current backend limitation workaround)
   */
  async findById(id: string): Promise<Item | null> {
    const items = await this.getAll()
    const item = items.find(item => item.id === id)
    return item || null
  },

  /**
   * Get items by category
   */
  async getByCategory(category: string): Promise<Item[]> {
    if (!category || typeof category !== 'string') {
      throw new Error('Category is required and must be a string')
    }

    // For now, filter client-side since backend doesn't support category filtering
    const allItems = await this.getAll()
    return allItems.filter(item => item.category === category)
  },

  /**
   * Search items by text query
   */
  async search(query: string, params?: Omit<ItemSearchParams, 'search'>): Promise<Item[]> {
    if (!query || typeof query !== 'string') {
      throw new Error('Search query is required and must be a string')
    }

    // For now, search client-side since backend doesn't support text search
    const allItems = await this.getAll()
    const lowercaseQuery = query.toLowerCase().trim()
    
    return allItems.filter(item => 
      item.name.toLowerCase().includes(lowercaseQuery) ||
      item.description.toLowerCase().includes(lowercaseQuery) ||
      item.category.toLowerCase().includes(lowercaseQuery)
    )
  },

  /**
   * Get all available categories
   * Derived from items since backend doesn't have dedicated endpoint
   */
  async getCategories(): Promise<Category[]> {
    const items = await this.getAll()
    
    // Group items by category and count
    const categoryMap = new Map<string, number>()
    items.forEach(item => {
      const count = categoryMap.get(item.category) || 0
      categoryMap.set(item.category, count + 1)
    })

    // Convert to Category objects and sort
    const categories: Category[] = Array.from(categoryMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => a.name.localeCompare(b.name))

    return categories
  },

  /**
   * Get paginated items (when backend supports pagination)
   */
  async getPaginated(page: number = 1, limit: number = 20, params?: Omit<ItemSearchParams, 'page' | 'limit'>): Promise<{
    items: Item[]
    pagination: {
      page: number
      limit: number
      total: number
      totalPages: number
      hasNextPage: boolean
      hasPrevPage: boolean
    }
  }> {
    const allParams: ItemSearchParams = {
      ...params,
      page: Math.max(1, page),
      limit: Math.min(100, Math.max(1, limit))
    }

    // For now, simulate pagination client-side since backend doesn't support it
    const allItems = await this.getAll()
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const items = allItems.slice(startIndex, endIndex)
    
    const total = allItems.length
    const totalPages = Math.ceil(total / limit)

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    }
  }
}

// Export individual functions for convenience
export const {
  getAll: getAllItems,
  getById: getItemById,
  findById: findItemById,
  getByCategory: getItemsByCategory,
  search: searchItems,
  getCategories: getItemCategories,
  getPaginated: getPaginatedItems
} = itemsApi
