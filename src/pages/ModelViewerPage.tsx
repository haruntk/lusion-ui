import * as React from "react"
import { useSearchParams, Link } from "react-router-dom"
import { ArrowLeft, RotateCcw, ZoomIn, ZoomOut, Smartphone } from "lucide-react"
import { Button, Card, CardContent, CardHeader, CardTitle } from "@/components/ui"
import { useItem } from "@/hooks"
import { ModelViewer } from "@/components/ar"
import { startArSession } from "@/api/ar"

export function ModelViewerPage() {
  const [searchParams] = useSearchParams()
  const itemId = searchParams.get("item_id") || ""
  const { item, loading, error } = useItem(itemId)
  


  // Start AR session handler
  const handleStartAr = React.useCallback(() => {
    if (!itemId) {
      console.warn('Cannot start AR: itemId missing')
      return
    }

    // Use the API function to redirect to backend AR start endpoint
    startArSession(itemId)
  }, [itemId])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">3D model yükleniyor...</p>
        </div>
      </div>
    )
  }

  if (error || !item) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="text-center p-6">
            <h2 className="text-lg font-semibold mb-2">Model Bulunamadı</h2>
            <p className="text-muted-foreground mb-4">
              {error || "Bu ürünün 3D modeli yüklenemedi."}
            </p>
            <Button asChild variant="outline" className="gap-2">
              <Link to="/menu">
                <ArrowLeft className="h-4 w-4" />
                Menüye Dön
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Button asChild variant="ghost" size="sm" className="gap-2">
              <Link to="/menu">
                <ArrowLeft className="h-4 w-4" />
                Geri
              </Link>
            </Button>
            <h1 className="text-lg font-semibold">{item.name} - 3D Model</h1>
            <div className="w-16" /> {/* Spacer */}
          </div>
        </div>
      </header>

      {/* Model Viewer */}
      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* 3D Viewer */}
          <div className="lg:col-span-3">
            <Card>
              <CardContent className="p-0">
                {item.model ? (
                  <ModelViewer
                    src={item.model}
                    iosSrc={item.model_ios}
                    alt={`${item.name} 3D model`}
                    autoRotate={true}
                    cameraControls={true}
                    environmentImage="neutral"
                    exposure={1.5}
                    shadowIntensity={1}
                    style={{ 
                      width: '100%', 
                      height: '400px',
                      backgroundColor: '#f5f5f5',
                      borderRadius: '0.5rem'
                    }}
                  >
                    {/* Loading UI */}
                    <div className="loading-spinner" slot="poster">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                      <div className="mt-3 text-muted-foreground">3D Model Yükleniyor...</div>
                    </div>
                    
                    {/* Error message for when model fails to load */}
                    <div slot="error" className="error">
                      <div className="p-4 bg-destructive/10 text-destructive rounded-lg m-4">
                        <h4 className="text-lg font-bold mb-2">⚠️ An Issue Occurred</h4>
                        <p>We couldn't load the 3D model for this product. There might be a connection issue.</p>
                        <p className="mt-2">Please try again.</p>
                      </div>
                    </div>
                  </ModelViewer>
                ) : (
                  <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
                    <div className="text-center p-6">
                      <Smartphone className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-600 mb-2">3D Model Bulunamadı</h3>
                      <p className="text-gray-500">Bu ürün için 3D model mevcut değil.</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Item Details Sidebar */}
          <div className="space-y-6">
            {/* Item Info */}
            <Card>
              <CardContent className="p-6">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full aspect-square object-cover rounded-lg mb-4"
                />
                <h2 className="text-xl font-bold mb-2">{item.name}</h2>
                <p className="text-2xl font-bold text-primary mb-4">₺{item.price}</p>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {item.description}
                </p>
              </CardContent>
            </Card>

            {/* Model Info */}
            <Card>
              <CardHeader>
                <CardTitle>Model Bilgileri</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Format:</span>
                  <span>GLB</span>
                </div>
                {item.model_ios && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">iOS Format:</span>
                    <span>USDZ</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">AR Uyumlu:</span>
                  <span className="text-green-600">✓ Evet</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Kategori:</span>
                  <span className="capitalize">{item.category}</span>
                </div>
                

              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle>İşlemler</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  className="w-full gap-2" 
                  onClick={handleStartAr}
                >
                  <Smartphone className="h-4 w-4" />
                  AR'da Görüntüle
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <Link to={`/menu/${item.id}`}>
                    Ürün Detayları
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <Link to="/menu">
                    Menüye Dön
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
