import { describe, it, expect, vi, beforeEach } from 'vitest'
import { itemsApi } from '../items'
import { apiClient } from '../client'
import { mockItems, mockItem } from '@/test/utils'

// Mock the API client
vi.mock('../client', () => ({
  apiClient: {
    get: vi.fn(),
  },
}))

describe('Items API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getAll', () => {
    it('should fetch all items successfully', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({
        data: mockItems,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {},
      })

      const result = await itemsApi.getAll()
      
      expect(apiClient.get).toHaveBeenCalledWith('/items')
      expect(result).toEqual(mockItems)
    })

    it('should return demo items when API fails', async () => {
      vi.mocked(apiClient.get).mockRejectedValue(new Error('Network error'))

      const result = await itemsApi.getAll()
      
      expect(result).toBeDefined()
      expect(Array.isArray(result)).toBe(true)
      expect(result.length).toBeGreaterThan(0)
      // Should return demo items
      expect(result[0]).toHaveProperty('id')
      expect(result[0]).toHaveProperty('name')
    })

    it('should filter items by category when params provided', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({
        data: mockItems,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {},
      })

      const result = await itemsApi.getAll({ category: 'Ana Yemek' })
      
      expect(result).toHaveLength(1)
      expect(result[0].category).toBe('Ana Yemek')
    })

    it('should filter items by search query when params provided', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({
        data: mockItems,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {},
      })

      const result = await itemsApi.getAll({ search: 'soup' })
      
      expect(result).toHaveLength(1)
      expect(result[0].name.toLowerCase()).toContain('soup')
    })
  })

  describe('findById', () => {
    it('should find item by ID', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({
        data: mockItems,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {},
      })

      const result = await itemsApi.findById('test-item-1')
      
      expect(result).toEqual(mockItem)
    })

    it('should return null when item not found', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({
        data: mockItems,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {},
      })

      const result = await itemsApi.findById('non-existent-id')
      
      expect(result).toBeNull()
    })
  })

  describe('getByCategory', () => {
    it('should throw error for invalid category', async () => {
      await expect(itemsApi.getByCategory('')).rejects.toThrow('Category is required and must be a string')
    })

    it('should filter items by category', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({
        data: mockItems,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {},
      })

      const result = await itemsApi.getByCategory('Ana Yemek')
      
      expect(result).toHaveLength(1)
      expect(result[0].category).toBe('Ana Yemek')
    })
  })

  describe('search', () => {
    it('should throw error for invalid query', async () => {
      await expect(itemsApi.search('')).rejects.toThrow('Search query is required and must be a string')
    })

    it('should search items by query', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({
        data: mockItems,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {},
      })

      const result = await itemsApi.search('test')
      
      expect(result).toHaveLength(2) // Both items contain 'test'
    })
  })

  describe('getCategories', () => {
    it('should derive categories from items', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({
        data: mockItems,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {},
      })

      const result = await itemsApi.getCategories()
      
      expect(result).toEqual([
        { name: 'Ana Yemek', count: 1 },
        { name: 'Çorba', count: 1 },
      ])
    })
  })

  describe('getPaginated', () => {
    it('should return paginated results', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({
        data: mockItems,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {},
      })

      const result = await itemsApi.getPaginated(1, 1)
      
      expect(result.items).toHaveLength(1)
      expect(result.pagination).toEqual({
        page: 1,
        limit: 1,
        total: 2,
        totalPages: 2,
        hasNextPage: true,
        hasPrevPage: false,
      })
    })
  })
})
