import { apiClient } from './client'
import { 
  ItemSchema, 
  ItemSearchParamsSchema,
  type Item, 
  type ItemDetail,
  type Category,
  type ItemSearchParams
} from '@/types/item.schema'

// Individual item validation is now handled per-item rather than array-level

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
      // Flask API now properly supports query parameters
      const queryParams: Record<string, string> = {}
      if (validatedParams?.category) {
        queryParams.category = validatedParams.category
      }
      if (validatedParams?.search) {
        queryParams.search = validatedParams.search
      }
      
      // Use the proper API endpoint
      const response = await apiClient.get('/items', {
        params: queryParams
      })
      
      // Check if Flask returned data
      let items: Item[] = []
      if (Array.isArray(response.data) && response.data.length > 0) {
        // Parse and validate each item individually to handle partial failures
        items = response.data
          .map((item: any, index: number) => {
            try {
              return ItemSchema.parse(item)
            } catch (error) {
              console.warn(`Item at index ${index} failed validation and will be skipped:`, error, item)
              return null
            }
          })
          .filter((item: Item | null): item is Item => item !== null)
      } else {
        // Return empty array if no items from backend
        items = []
      }
      
      return items
    } catch (error) {
      console.error('Error fetching items:', error)
      // Return empty array if API fails
      return []
    }
  },

  /**
   * Get single item by ID
   * GET /api/items/:id
   */
  async getById(id: string): Promise<ItemDetail | null> {
    if (!id || typeof id !== 'string') {
      throw new Error('Item ID is required and must be a string')
    }

    try {
      // Use new dedicated API endpoint for items
      const response = await apiClient.get(`items/${id}`)
      if (response.data) {
        return ItemSchema.parse(response.data)
      }
      return null
    } catch (error) {
      console.error(`Error fetching item ${id}:`, error)
      // Fall back to findById as a backup strategy
      return await this.findById(id)
    }
  },

  /**
   * Find item by ID from all items list (fallback method)
   */
  async findById(id: string): Promise<Item | null> {
    try {
      // Try the direct API endpoint first
      return await this.getById(id)
    } catch {
      // Fall back to client-side filtering
      const items = await this.getAll()
      const item = items.find(item => item.id === id)
      return item || null
    }
  },

  /**
   * Get items by category
   */
  async getByCategory(category: string): Promise<Item[]> {
    if (!category || typeof category !== 'string') {
      throw new Error('Category is required and must be a string')
    }

    try {
      // Use query parameters for filtering via API
      const response = await apiClient.get('/items', {
        params: { category }
      })
      
      if (Array.isArray(response.data) && response.data.length > 0) {
        // Parse each item individually to handle validation failures gracefully
        return response.data
          .map((item: any, index: number) => {
            try {
              return ItemSchema.parse(item)
            } catch (error) {
              console.warn(`Item at index ${index} failed validation and will be skipped:`, error, item)
              return null
            }
          })
          .filter((item: Item | null): item is Item => item !== null)
      }
      return []
    } catch (error) {
      console.error(`Error fetching items by category ${category}:`, error)
      // Fall back to client-side filtering
      const allItems = await this.getAll()
      return allItems.filter(item => item.category.toLowerCase() === category.toLowerCase())
    }
  },

  /**
   * Search items by text query
   */
  async search(query: string): Promise<Item[]> {
    if (!query || typeof query !== 'string') {
      throw new Error('Search query is required and must be a string')
    }

    try {
      // Use query parameters for searching via API
      const response = await apiClient.get('/items', {
        params: { search: query }
      })
      
      if (Array.isArray(response.data)) {
        // Parse each item individually to handle validation failures gracefully
        return response.data
          .map((item: any, index: number) => {
            try {
              return ItemSchema.parse(item)
            } catch (error) {
              console.warn(`Item at index ${index} failed validation and will be skipped:`, error, item)
              return null
            }
          })
          .filter((item: Item | null): item is Item => item !== null)
      }
      return []
    } catch (error) {
      console.error(`Error searching items with query "${query}":`, error)
      // Fall back to client-side search
      const allItems = await this.getAll()
      const lowercaseQuery = query.toLowerCase().trim()
      
      return allItems.filter(item => 
        item.name.toLowerCase().includes(lowercaseQuery) ||
        item.description.toLowerCase().includes(lowercaseQuery) ||
        item.category.toLowerCase().includes(lowercaseQuery)
      )
    }
  },

  /**
   * Get all available categories
   * GET /api/categories
   */
  async getCategories(): Promise<Category[]> {
    try {
      // Use the dedicated categories API endpoint
      const response = await apiClient.get('/categories')
      
      if (Array.isArray(response.data) && response.data.length > 0) {
        return response.data.map((cat: { name: string; count: number }) => ({
          name: cat.name,
          count: cat.count
        }))
      }
      
      // If empty response or error, fall back to client-side derivation
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
    } catch (error) {
      console.error('Error fetching categories:', error)
      // Fall back to client-side derivation
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
    }
  },

  /**
   * Get paginated items (when backend supports pagination)
   */
  async getPaginated(page: number = 1, limit: number = 20): Promise<{
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
  },


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
