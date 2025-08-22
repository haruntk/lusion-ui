import * as React from "react"
import { useSearchParams, Link } from "react-router-dom"
import { ArrowLeft, RotateCcw, ZoomIn, ZoomOut, Move3D } from "lucide-react"
import { Button, Card, CardContent } from "@/components/ui"
import { useItem } from "@/hooks"

export function ModelViewerPage() {
  const [searchParams] = useSearchParams()
  const itemId = searchParams.get("item_id") || ""
  const { item, loading, error } = useItem(itemId)

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading 3D model...</p>
        </div>
      </div>
    )
  }

  if (error || !item) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="text-center p-6">
            <h2 className="text-lg font-semibold mb-2">Model Not Available</h2>
            <p className="text-muted-foreground mb-4">
              {error || "Unable to load the 3D model for this item."}
            </p>
            <Button asChild variant="outline" className="gap-2">
              <Link to="/">
                <ArrowLeft className="h-4 w-4" />
                Return Home
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
              <Link to="/">
                <ArrowLeft className="h-4 w-4" />
                Back
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
                <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center relative">
                  <div className="text-center">
                    <Move3D className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-600 mb-2">3D Model Viewer</h3>
                    <p className="text-gray-500">Interactive 3D model of {item.name}</p>
                    <p className="text-sm text-gray-400 mt-2">
                      Click and drag to rotate • Scroll to zoom
                    </p>
                  </div>
                  
                  {/* Model Controls */}
                  <div className="absolute bottom-4 right-4 flex space-x-2">
                    <Button size="sm" variant="outline" className="bg-white/80 hover:bg-white">
                      <ZoomIn className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" className="bg-white/80 hover:bg-white">
                      <ZoomOut className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" className="bg-white/80 hover:bg-white">
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
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
                <p className="text-2xl font-bold text-primary mb-4">{item.price}</p>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {item.description}
                </p>
              </CardContent>
            </Card>

            {/* Model Info */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Model Details</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Format:</span>
                    <span>GLB</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">AR Ready:</span>
                    <span className="text-green-600">✓ Yes</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Category:</span>
                    <span className="capitalize">{item.category}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Actions</h3>
                <div className="space-y-3">
                  <Button asChild className="w-full">
                    <Link to={`/ar-view/${item.id}`}>
                      View in AR
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full">
                    <Link to={`/menu/${item.id}`}>
                      Item Details
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
