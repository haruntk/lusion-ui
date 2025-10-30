import * as React from "react"
import { motion } from "framer-motion"
import { 
  Lock, 
  Save, 
  Eye, 
  EyeOff, 
  CheckCircle, 
  AlertCircle,
  Package,
  Image as ImageIcon,
  Box,
  FileText,
  Trash2,
  RefreshCw,
  List
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
import { addItem, verifyAdminKey, deleteItem, listAllItems, type AdminItemInput } from "@/api/admin"
import type { Item } from "@/types"

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
    }
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: { duration: 0.2 }
  }
}

export function AdminModelAddPage() {
  const [adminKey, setAdminKey] = React.useState("")
  const [showAdminKey, setShowAdminKey] = React.useState(false)
  const [isKeyVerified, setIsKeyVerified] = React.useState(false)
  const [isVerifying, setIsVerifying] = React.useState(false)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [submitStatus, setSubmitStatus] = React.useState<{
    type: 'success' | 'error' | null
    message: string
  }>({ type: null, message: '' })
  
  // Model listesi state
  const [showItemList, setShowItemList] = React.useState(false)
  const [items, setItems] = React.useState<Item[]>([])
  const [isLoadingItems, setIsLoadingItems] = React.useState(false)
  const [deletingItemId, setDeletingItemId] = React.useState<string | null>(null)

  // Form state
  const [formData, setFormData] = React.useState<AdminItemInput>({
    name: '',
    description: '',
    category: '',
    price: '',
    has_ar_model: false,
    image: '',
    model: '',
    model_ios: '',
    gluten_free: false,
    vegan: false,
    vegetarian: false,
    rating: undefined,
    review_count: undefined,
  })

  // Admin key doğrulama
  const handleVerifyKey = async () => {
    if (!adminKey.trim()) {
      setSubmitStatus({
        type: 'error',
        message: 'Lütfen admin key giriniz'
      })
      return
    }

    setIsVerifying(true)
    setSubmitStatus({ type: null, message: '' })

    try {
      const response = await verifyAdminKey(adminKey)
      if (response.valid) {
        setIsKeyVerified(true)
        setSubmitStatus({
          type: 'success',
          message: 'Admin key doğrulandı! Şimdi model ekleyebilirsiniz.'
        })
      } else {
        setSubmitStatus({
          type: 'error',
          message: 'Geçersiz admin key'
        })
      }
    } catch (error) {
      setSubmitStatus({
        type: 'error',
        message: 'Admin key doğrulama başarısız: ' + (error instanceof Error ? error.message : 'Bilinmeyen hata')
      })
    } finally {
      setIsVerifying(false)
    }
  }

  // Form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Zorunlu alanları kontrol et
    if (!formData.name.trim() || !formData.description.trim() || 
        !formData.category.trim() || !formData.price.trim()) {
      setSubmitStatus({
        type: 'error',
        message: 'Lütfen tüm zorunlu alanları doldurun'
      })
      return
    }

    setIsSubmitting(true)
    setSubmitStatus({ type: null, message: '' })

    try {
      // Boş string'leri kaldır
      const cleanedData: AdminItemInput = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        category: formData.category.trim(),
        price: formData.price.trim(),
        has_ar_model: formData.has_ar_model,
      }

      // Opsiyonel alanları ekle (sadece dolu olanlar)
      if (formData.image?.trim()) cleanedData.image = formData.image.trim()
      if (formData.model?.trim()) cleanedData.model = formData.model.trim()
      if (formData.model_ios?.trim()) cleanedData.model_ios = formData.model_ios.trim()
      if (formData.gluten_free) cleanedData.gluten_free = formData.gluten_free
      if (formData.vegan) cleanedData.vegan = formData.vegan
      if (formData.vegetarian) cleanedData.vegetarian = formData.vegetarian
      if (formData.rating !== undefined && formData.rating > 0) cleanedData.rating = formData.rating
      if (formData.review_count !== undefined && formData.review_count > 0) cleanedData.review_count = formData.review_count

      const response = await addItem(adminKey, cleanedData)
      
      setSubmitStatus({
        type: 'success',
        message: `Model başarıyla eklendi! ID: ${response.item_id}`
      })

      // Formu temizle
      setTimeout(() => {
        setFormData({
          name: '',
          description: '',
          category: '',
          price: '',
          has_ar_model: false,
          image: '',
          model: '',
          model_ios: '',
          gluten_free: false,
          vegan: false,
          vegetarian: false,
          rating: undefined,
          review_count: undefined,
        })
      }, 2000)

    } catch (error) {
      setSubmitStatus({
        type: 'error',
        message: 'Model eklenirken hata oluştu: ' + (error instanceof Error ? error.message : 'Bilinmeyen hata')
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Input değişikliklerini handle et
  const handleInputChange = (field: keyof AdminItemInput, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // Model listesini yükle
  const loadItems = async () => {
    if (!adminKey) return
    
    setIsLoadingItems(true)
    try {
      const response = await listAllItems(adminKey)
      setItems(response.items)
    } catch (error) {
      setSubmitStatus({
        type: 'error',
        message: 'Model listesi yüklenemedi: ' + (error instanceof Error ? error.message : 'Bilinmeyen hata')
      })
    } finally {
      setIsLoadingItems(false)
    }
  }

  // Model sil
  const handleDeleteItem = async (itemId: string, itemName: string) => {
    if (!confirm(`"${itemName}" modelini silmek istediğinizden emin misiniz?`)) {
      return
    }

    setDeletingItemId(itemId)
    try {
      await deleteItem(adminKey, itemId)
      setSubmitStatus({
        type: 'success',
        message: `Model başarıyla silindi: ${itemName}`
      })
      // Listeyi yenile
      await loadItems()
    } catch (error) {
      setSubmitStatus({
        type: 'error',
        message: 'Model silinirken hata oluştu: ' + (error instanceof Error ? error.message : 'Bilinmeyen hata')
      })
    } finally {
      setDeletingItemId(null)
    }
  }

  // Liste açıldığında modelleri yükle
  React.useEffect(() => {
    if (showItemList && isKeyVerified) {
      loadItems()
    }
  }, [showItemList, isKeyVerified])

  React.useEffect(() => {
    document.title = 'Admin Panel - Model Ekle'
  }, [])

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 py-12 px-4"
    >
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
            <Lock className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold mb-2">Admin Panel</h1>
          <p className="text-muted-foreground text-lg">Model / Item Ekleme Sistemi</p>
        </div>

        {/* Admin Key Verification */}
        {!isKeyVerified && (
          <Card className="mb-6">
            <CardHeader>
              <h2 className="text-2xl font-semibold flex items-center gap-2">
                <Lock className="h-6 w-6" />
                Admin Doğrulama
              </h2>
              <p className="text-muted-foreground">Devam etmek için admin key'inizi girin</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="relative">
                  <Input
                    type={showAdminKey ? "text" : "password"}
                    placeholder="Admin Key"
                    value={adminKey}
                    onChange={(e) => setAdminKey(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleVerifyKey()}
                    className="pr-10"
                    disabled={isVerifying}
                  />
                  <button
                    type="button"
                    onClick={() => setShowAdminKey(!showAdminKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showAdminKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <Button
                  onClick={handleVerifyKey}
                  disabled={isVerifying || !adminKey.trim()}
                  className="w-full"
                >
                  {isVerifying ? (
                    <>
                      <Spinner size="sm" className="mr-2" />
                      Doğrulanıyor...
                    </>
                  ) : (
                    <>
                      <Lock className="h-4 w-4 mr-2" />
                      Doğrula
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Status Messages */}
        {submitStatus.type && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-6 p-4 rounded-lg flex items-start gap-3 ${
              submitStatus.type === 'success' 
                ? 'bg-green-500/10 text-green-600 dark:text-green-400' 
                : 'bg-red-500/10 text-red-600 dark:text-red-400'
            }`}
          >
            {submitStatus.type === 'success' ? (
              <CheckCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            )}
            <p className="text-sm font-medium">{submitStatus.message}</p>
          </motion.div>
        )}

        {/* Form */}
        {isKeyVerified && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-semibold flex items-center gap-2">
                      <Package className="h-6 w-6" />
                      Yeni Model Ekle
                    </h2>
                    <p className="text-muted-foreground">Gerekli alanları doldurun ve kaydedin</p>
                  </div>
                  <Badge variant="outline" className="text-green-600">Doğrulandı ✓</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Zorunlu Alanlar */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                      <FileText className="h-5 w-5 text-primary" />
                      <h3 className="text-lg font-semibold">Zorunlu Alanlar</h3>
                      <Badge variant="destructive" className="text-xs">*</Badge>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        İsim <span className="text-red-500">*</span>
                      </label>
                      <Input
                        required
                        placeholder="Örn: Adana Kebap, Villa No: 5"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Açıklama <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        required
                        placeholder="Detaylı açıklama..."
                        value={formData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        className="w-full min-h-[100px] px-3 py-2 rounded-md border border-input bg-background"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Kategori <span className="text-red-500">*</span>
                        </label>
                        <select
                          required
                          value={formData.category}
                          onChange={(e) => handleInputChange('category', e.target.value)}
                          className="w-full px-3 py-2 rounded-md border border-input bg-background"
                        >
                          <option value="">Seçiniz...</option>
                          <option value="Real Estate">Real Estate</option>
                          <option value="Food">Food</option>
                          <option value="Appetizers">Appetizers</option>
                          <option value="Main Course">Main Course</option>
                          <option value="Desserts">Desserts</option>
                          <option value="Beverages">Beverages</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Fiyat <span className="text-red-500">*</span>
                        </label>
                        <Input
                          required
                          placeholder="Örn: ₺450, $250,000"
                          value={formData.price}
                          onChange={(e) => handleInputChange('price', e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="has_ar_model"
                        checked={formData.has_ar_model}
                        onChange={(e) => handleInputChange('has_ar_model', e.target.checked)}
                        className="w-4 h-4 rounded border-input"
                      />
                      <label htmlFor="has_ar_model" className="text-sm font-medium">
                        AR Model Mevcut <span className="text-red-500">*</span>
                      </label>
                    </div>
                  </div>

                  {/* Opsiyonel Alanlar - Model URLs */}
                  <div className="space-y-4 pt-6 border-t">
                    <div className="flex items-center gap-2 mb-4">
                      <Box className="h-5 w-5 text-muted-foreground" />
                      <h3 className="text-lg font-semibold">3D Model URL'leri</h3>
                      <Badge variant="outline" className="text-xs">Opsiyonel</Badge>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Model URL (GLB - Android)
                      </label>
                      <Input
                        type="url"
                        placeholder="https://example.com/model.glb"
                        value={formData.model}
                        onChange={(e) => handleInputChange('model', e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Model iOS URL (USDZ)
                      </label>
                      <Input
                        type="url"
                        placeholder="https://example.com/model.usdz"
                        value={formData.model_ios}
                        onChange={(e) => handleInputChange('model_ios', e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Opsiyonel Alanlar - Görsel */}
                  <div className="space-y-4 pt-6 border-t">
                    <div className="flex items-center gap-2 mb-4">
                      <ImageIcon className="h-5 w-5 text-muted-foreground" />
                      <h3 className="text-lg font-semibold">Görsel</h3>
                      <Badge variant="outline" className="text-xs">Opsiyonel</Badge>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Görsel URL
                      </label>
                      <Input
                        type="url"
                        placeholder="https://example.com/image.jpg"
                        value={formData.image}
                        onChange={(e) => handleInputChange('image', e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Opsiyonel Alanlar - Diğer */}
                  <div className="space-y-4 pt-6 border-t">
                    <div className="flex items-center gap-2 mb-4">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                      <h3 className="text-lg font-semibold">Diğer Özellikler</h3>
                      <Badge variant="outline" className="text-xs">Opsiyonel</Badge>
                    </div>

                    <div className="flex flex-wrap gap-4">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="gluten_free"
                          checked={formData.gluten_free}
                          onChange={(e) => handleInputChange('gluten_free', e.target.checked)}
                          className="w-4 h-4 rounded border-input"
                        />
                        <label htmlFor="gluten_free" className="text-sm">Glutensiz</label>
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="vegan"
                          checked={formData.vegan}
                          onChange={(e) => handleInputChange('vegan', e.target.checked)}
                          className="w-4 h-4 rounded border-input"
                        />
                        <label htmlFor="vegan" className="text-sm">Vegan</label>
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="vegetarian"
                          checked={formData.vegetarian}
                          onChange={(e) => handleInputChange('vegetarian', e.target.checked)}
                          className="w-4 h-4 rounded border-input"
                        />
                        <label htmlFor="vegetarian" className="text-sm">Vejetaryen</label>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Rating (0-5)
                        </label>
                        <Input
                          type="number"
                          min="0"
                          max="5"
                          step="0.1"
                          placeholder="4.5"
                          value={formData.rating || ''}
                          onChange={(e) => handleInputChange('rating', e.target.value ? parseFloat(e.target.value) : undefined)}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Değerlendirme Sayısı
                        </label>
                        <Input
                          type="number"
                          min="0"
                          placeholder="123"
                          value={formData.review_count || ''}
                          onChange={(e) => handleInputChange('review_count', e.target.value ? parseInt(e.target.value) : undefined)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-6 border-t">
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full"
                      size="lg"
                    >
                      {isSubmitting ? (
                        <>
                          <Spinner size="sm" className="mr-2" />
                          Kaydediliyor...
                        </>
                      ) : (
                        <>
                          <Save className="h-5 w-5 mr-2" />
                          Model Ekle
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Model Listesi ve Silme */}
        {isKeyVerified && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8"
          >
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-semibold flex items-center gap-2">
                      <List className="h-6 w-6" />
                      Mevcut Modeller
                    </h2>
                    <p className="text-muted-foreground">Tüm modelleri görüntüleyin ve silin</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={loadItems}
                      disabled={isLoadingItems}
                    >
                      <RefreshCw className={`h-4 w-4 mr-2 ${isLoadingItems ? 'animate-spin' : ''}`} />
                      Yenile
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowItemList(!showItemList)}
                    >
                      {showItemList ? 'Gizle' : 'Göster'}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              {showItemList && (
                <CardContent>
                  {isLoadingItems ? (
                    <div className="text-center py-8">
                      <Spinner size="lg" className="mx-auto mb-4" />
                      <p className="text-muted-foreground">Modeller yükleniyor...</p>
                    </div>
                  ) : items.length === 0 ? (
                    <div className="text-center py-8">
                      <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">Henüz hiç model eklenmemiş</p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-[500px] overflow-y-auto">
                      {items.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-start gap-4 flex-1">
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-16 h-16 object-cover rounded"
                              />
                            ) : (
                              <div className="w-16 h-16 bg-muted rounded flex items-center justify-center">
                                <Package className="h-8 w-8 text-muted-foreground" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-lg truncate">{item.name}</h3>
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {item.description}
                              </p>
                              <div className="flex gap-2 mt-2">
                                <Badge variant="outline" className="text-xs">
                                  {item.category}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {item.price}
                                </Badge>
                                {item.has_ar_model && (
                                  <Badge variant="outline" className="text-xs text-green-600">
                                    AR ✓
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteItem(item.id, item.name)}
                            disabled={deletingItemId === item.id}
                          >
                            {deletingItemId === item.id ? (
                              <Spinner size="sm" />
                            ) : (
                              <>
                                <Trash2 className="h-4 w-4 mr-2" />
                                Sil
                              </>
                            )}
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                  {items.length > 0 && (
                    <div className="mt-4 pt-4 border-t text-center text-sm text-muted-foreground">
                      Toplam {items.length} model bulundu
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          </motion.div>
        )}

        {/* Footer Info */}
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>🔒 Bu sayfa güvenli bir admin key ile korunmaktadır</p>
          <p className="mt-1">Model başarıyla eklendikten sonra ilgili kategori sayfasında görünecektir</p>
        </div>
      </div>
    </motion.div>
  )
}

