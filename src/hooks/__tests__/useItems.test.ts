import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useItems } from '../useItems'
import { itemsApi } from '@/api'
import { mockItems } from '@/test/utils'

// Mock the itemsApi module
vi.mock('@/api', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    itemsApi: {
      getAll: vi.fn(),
      getCategories: vi.fn(),
    },
  }
})

describe('useItems Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return initial state correctly', () => {
    const { result } = renderHook(() => useItems({ enabled: false }))
    
    expect(result.current.data).toEqual([])
    expect(result.current.categories).toEqual([])
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBe(null)
    expect(result.current.isEmpty).toBe(true)
    expect(result.current.isStale).toBe(false)
  })

  it('should fetch items successfully', async () => {
    const mockCategories = [
      { name: 'Ana Yemek', count: 1 },
      { name: 'Çorba', count: 1 },
    ]

    vi.mocked(itemsApi.getAll).mockResolvedValue(mockItems)
    vi.mocked(itemsApi.getCategories).mockResolvedValue(mockCategories)

    const { result } = renderHook(() => useItems())

    // Wait for the hook to fetch data
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.data).toEqual(mockItems)
    expect(result.current.categories).toEqual(mockCategories)
    expect(result.current.error).toBe(null)
    expect(result.current.isEmpty).toBe(false)
  })

  it('should handle API errors gracefully', async () => {
    const mockError = new Error('Failed to fetch items')
    vi.mocked(itemsApi.getAll).mockRejectedValue(mockError)
    vi.mocked(itemsApi.getCategories).mockRejectedValue(mockError)

    const { result } = renderHook(() => useItems())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    }, { timeout: 3000 })

    expect(result.current.data).toEqual([])
    expect(result.current.error).toBe('Failed to fetch items')
  })

  it('should filter items by category', async () => {
    vi.mocked(itemsApi.getAll).mockResolvedValue(mockItems)
    vi.mocked(itemsApi.getCategories).mockResolvedValue([])

    const { result } = renderHook(() => useItems())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    const kebapItems = result.current.getItemsByCategory('Ana Yemek')
    expect(kebapItems).toHaveLength(1)
    expect(kebapItems[0].name).toBe('Test Kebap')
  })

  it('should search items correctly', async () => {
    vi.mocked(itemsApi.getAll).mockResolvedValue(mockItems)
    vi.mocked(itemsApi.getCategories).mockResolvedValue([])

    const { result } = renderHook(() => useItems())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    const searchResults = result.current.searchItems('soup')
    expect(searchResults).toHaveLength(1)
    expect(searchResults[0].name).toBe('Test Soup')
  })

  it('should refetch data when refetch is called', async () => {
    vi.mocked(itemsApi.getAll).mockResolvedValue(mockItems)
    vi.mocked(itemsApi.getCategories).mockResolvedValue([])

    const { result } = renderHook(() => useItems())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    // Clear the mock to track new calls
    vi.clearAllMocks()
    vi.mocked(itemsApi.getAll).mockResolvedValue(mockItems)
    vi.mocked(itemsApi.getCategories).mockResolvedValue([])

    await result.current.refetch()

    expect(itemsApi.getAll).toHaveBeenCalledTimes(1)
    expect(itemsApi.getCategories).toHaveBeenCalledTimes(1)
  })
})
