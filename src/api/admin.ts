import { apiClient } from './client'
import type { Item } from '@/types/item.schema'

export interface AdminItemInput {
  // Zorunlu alanlar
  name: string
  description: string
  category: string
  price: string
  has_ar_model: boolean
  
  // Opsiyonel alanlar
  image?: string
  model?: string
  model_ios?: string
  gluten_free?: boolean
  vegan?: boolean
  vegetarian?: boolean
  rating?: number
  review_count?: number
}

export interface AdminAddItemResponse {
  success: boolean
  message: string
  item_id: string
  data: Item
}

export interface AdminVerifyResponse {
  valid: boolean
  message: string
}

export interface AdminDeleteItemResponse {
  success: boolean
  message: string
  item_id: string
}

export interface AdminListItemsResponse {
  success: boolean
  items: Item[]
  count: number
}

/**
 * Admin key'i doğrula
 */
export async function verifyAdminKey(adminKey: string): Promise<AdminVerifyResponse> {
  const response = await apiClient.post<AdminVerifyResponse>('/admin/verify', 
    { admin_key: adminKey },
    {
      headers: {
        'X-Admin-Key': adminKey
      }
    }
  )
  return response.data
}

/**
 * Yeni item/model ekle (Admin only)
 */
export async function addItem(
  adminKey: string, 
  itemData: AdminItemInput
): Promise<AdminAddItemResponse> {
  const response = await apiClient.post<AdminAddItemResponse>(
    '/admin/items/add',
    {
      ...itemData,
      admin_key: adminKey
    },
    {
      headers: {
        'X-Admin-Key': adminKey
      }
    }
  )
  return response.data
}

/**
 * Item/model sil (Admin only)
 */
export async function deleteItem(
  adminKey: string,
  itemId: string
): Promise<AdminDeleteItemResponse> {
  const response = await apiClient.delete<AdminDeleteItemResponse>(
    `/admin/items/${itemId}`,
    {
      headers: {
        'X-Admin-Key': adminKey
      }
    }
  )
  return response.data
}

/**
 * Tüm item'ları listele (Admin only)
 */
export async function listAllItems(adminKey: string): Promise<AdminListItemsResponse> {
  const response = await apiClient.get<AdminListItemsResponse>(
    '/admin/items',
    {
      headers: {
        'X-Admin-Key': adminKey
      }
    }
  )
  return response.data
}

