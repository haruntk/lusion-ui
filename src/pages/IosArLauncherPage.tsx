import * as React from "react"
import { useSearchParams, Link } from "react-router-dom"
import { ArrowLeft, Smartphone, ExternalLink } from "lucide-react"
import { Button, Card, CardContent, CardHeader, CardTitle } from "@/components/ui"
import { useItem } from "@/hooks"

export function IosArLauncherPage() {
  const [searchParams] = useSearchParams()
  const itemId = searchParams.get("item_id") || ""
  const { item, loading, error } = useItem(itemId)

  React.useEffect(() => {
    // Auto-redirect to AR Quick Look if on iOS and USDZ model is available
    if (item?.model_ios && navigator.userAgent.toLowerCase().includes('iphone')) {
      // Small delay to show the page briefly
      setTimeout(() => {
        window.location.href = item.model_ios!
      }, 2000)
    }
  }, [item])

  if (loading) {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="text-center p-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading AR experience...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error || !item) {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-red-600">AR Not Available</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              {error || "Unable to load AR experience for this item."}
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
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
            <h1 className="text-lg font-semibold">iOS AR Experience</h1>
            <div className="w-16" /> {/* Spacer */}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Loading State */}
          <Card className="mb-8">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Smartphone className="h-8 w-8 text-white" />
              </div>
              <CardTitle>Opening AR Quick Look...</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-muted-foreground">
                We're launching AR Quick Look to display <strong>{item.name}</strong> in AR.
              </p>
              
              <div className="flex items-center justify-center space-x-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              </div>
            </CardContent>
          </Card>

          {/* Item Preview */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-20 h-20 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{item.name}</h3>
                  <p className="text-muted-foreground text-sm">{item.description}</p>
                  <p className="text-primary font-bold mt-1">{item.price}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Instructions */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>If AR Quick Look doesn't open automatically:</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  1
                </div>
                <p className="text-sm">Make sure you're using iOS 12 or later</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  2
                </div>
                <p className="text-sm">Allow camera permissions when prompted</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  3
                </div>
                <p className="text-sm">Point your camera at a flat surface</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  4
                </div>
                <p className="text-sm">Tap the AR button to place the object</p>
              </div>
            </CardContent>
          </Card>

          {/* Manual Actions */}
          <div className="space-y-4">
            {item.model_ios && (
              <Button
                className="w-full gap-2"
                onClick={() => window.location.href = item.model_ios!}
              >
                <ExternalLink className="h-4 w-4" />
                Open AR Quick Look Manually
              </Button>
            )}
            
            <Button asChild variant="outline" className="w-full gap-2">
              <Link to={`/ar-view/${item.id}`}>
                <ArrowLeft className="h-4 w-4" />
                Try Web AR Instead
              </Link>
            </Button>
          </div>

          {/* Model Format Info */}
          <Card className="mt-8">
            <CardContent className="p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Model Format:</span>
                <span className="font-medium">
                  {item.model_ios ? 'USDZ (iOS Optimized)' : 'GLB (Fallback)'}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
