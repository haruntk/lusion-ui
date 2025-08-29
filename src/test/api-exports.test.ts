import { arApi, getDeviceCapabilities, getModelUrls, startArSession, getArSessionInfo } from '@/api'
import { qrApi } from '@/api'
import { itemsApi, getAllItems, getItemById, findItemById, getItemsByCategory, searchItems, getItemCategories, getPaginatedItems } from '@/api'

// Bu dosya sadece import ifadelerini test etmek için oluşturulmuştur.
// Eğer import ifadelerinde bir hata varsa, TypeScript derleme sırasında hata verecektir.

describe('API Exports', () => {
  it('should import AR API functions correctly', () => {
    expect(arApi).toBeDefined()
    expect(getDeviceCapabilities).toBeDefined()
    expect(getModelUrls).toBeDefined()
    expect(startArSession).toBeDefined()
    expect(getArSessionInfo).toBeDefined()
  })

  it('should import QR API functions correctly', () => {
    expect(qrApi).toBeDefined()
  })

  it('should import Items API functions correctly', () => {
    expect(itemsApi).toBeDefined()
    expect(getAllItems).toBeDefined()
    expect(getItemById).toBeDefined()
    expect(findItemById).toBeDefined()
    expect(getItemsByCategory).toBeDefined()
    expect(searchItems).toBeDefined()
    expect(getItemCategories).toBeDefined()
    expect(getPaginatedItems).toBeDefined()
  })
})
