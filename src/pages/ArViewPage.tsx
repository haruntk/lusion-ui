import * as React from "react"
import { useSearchParams, Link } from "react-router-dom"
import { ArrowLeft, Smartphone, RotateCcw, Maximize2 } from "lucide-react"
import { Button, Card, CardContent, CardHeader, CardTitle } from "@/components/ui"
import { useItem, useArSession } from "@/hooks"

export function ArViewPage() {
  const [searchParams] = useSearchParams()
  const itemId = searchParams.get("item_id") || ""
  const { item, loading, error } = useItem(itemId)
  const { isSupported, startArSession, getDeviceInfo } = useArSession()
  const deviceInfo = getDeviceInfo()

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading AR experience...</p>
        </div>
      </div>
    )
  }

  if (error || !item) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">AR View Not Available</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              {error || "Unable to load the requested item for AR viewing."}
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-10 p-4">
        <div className="flex items-center justify-between">
          <Button asChild variant="ghost" size="sm" className="text-white hover:bg-white/10">
            <Link to="/" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
          </Button>
          <h1 className="text-lg font-semibold truncate">{item.name}</h1>
          <div className="w-16" /> {/* Spacer for centering */}
        </div>
      </header>

      {/* AR Viewer Container */}
      <main className="flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-4xl">
          {/* AR Model Viewer Placeholder */}
          <div className="aspect-square bg-gray-800 rounded-lg border-2 border-dashed border-gray-600 flex items-center justify-center mb-6">
            <div className="text-center">
              <Smartphone className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">AR Model Viewer</h2>
              <p className="text-gray-400 mb-4">3D model of {item.name} would appear here</p>
              
              {/* Device-specific instructions */}
              {deviceInfo.isIOS && (
                <p className="text-sm text-blue-400">
                  Tap to view in AR Quick Look (iOS)
                </p>
              )}
              {deviceInfo.isAndroid && (
                <p className="text-sm text-green-400">
                  Tap to open in Scene Viewer (Android)
                </p>
              )}
              {!deviceInfo.isMobile && (
                <p className="text-sm text-yellow-400">
                  Best experienced on mobile devices
                </p>
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="flex justify-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset View
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <Maximize2 className="h-4 w-4 mr-2" />
              Fullscreen
            </Button>
            
            {isSupported && (
              <Button
                onClick={startArSession}
                className="bg-primary hover:bg-primary/90"
              >
                <Smartphone className="h-4 w-4 mr-2" />
                Start AR
              </Button>
            )}
          </div>

          {/* Item Info */}
          <Card className="mt-6 bg-white/5 border-white/10">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-white">{item.name}</h3>
                  <p className="text-sm text-gray-300 mt-1">{item.description}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-primary">{item.price}</p>
                  <p className="text-xs text-gray-400 capitalize">{item.category}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
