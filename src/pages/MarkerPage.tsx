import * as React from "react"
import { Link } from "react-router-dom"
import { ArrowLeft, Camera, QrCode, Target } from "lucide-react"
import { Button, Card, CardContent, CardHeader, CardTitle } from "@/components/ui"

export function MarkerPage() {
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
            <h1 className="text-lg font-semibold">AR Marker Detection</h1>
            <div className="w-16" /> {/* Spacer */}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Instructions */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                How to Use AR Markers
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                  1
                </div>
                <p className="text-sm">Point your camera at the AR marker below</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                  2
                </div>
                <p className="text-sm">Allow camera access when prompted</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                  3
                </div>
                <p className="text-sm">Watch as the 3D model appears on the marker</p>
              </div>
            </CardContent>
          </Card>

          {/* Camera View */}
          <Card className="mb-8">
            <CardContent className="p-0">
              <div className="aspect-video bg-black rounded-lg flex items-center justify-center relative">
                <div className="text-center text-white">
                  <Camera className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">Camera View</h3>
                  <p className="text-sm opacity-75">AR camera feed would appear here</p>
                </div>
                
                {/* Crosshair overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-8 h-8 border-2 border-white border-dashed rounded-full opacity-50"></div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AR Marker */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="h-5 w-5" />
                AR Marker
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="bg-white p-8 rounded-lg border-2 border-dashed border-gray-300 inline-block">
                <div className="w-32 h-32 bg-black rounded-lg flex items-center justify-center">
                  <div className="grid grid-cols-3 gap-1">
                    {[...Array(9)].map((_, i) => (
                      <div
                        key={i}
                        className={`w-3 h-3 ${
                          [0, 2, 6, 8].includes(i) ? 'bg-white' : 'bg-gray-600'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                Point your camera at this marker to activate AR
              </p>
            </CardContent>
          </Card>

          {/* Status */}
          <div className="mt-8 text-center">
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-yellow-100 text-yellow-800 rounded-full text-sm">
              <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
              <span>Scanning for marker...</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
