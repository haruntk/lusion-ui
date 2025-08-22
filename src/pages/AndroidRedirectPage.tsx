import * as React from "react"
import { useSearchParams, Link } from "react-router-dom"
import { ArrowLeft, Smartphone, AlertCircle, ExternalLink } from "lucide-react"
import { Button, Card, CardContent, CardHeader, CardTitle } from "@/components/ui"

export function AndroidRedirectPage() {
  const [searchParams] = useSearchParams()
  const fallbackUrl = searchParams.get("fallback") || "/"
  const [countdown, setCountdown] = React.useState(5)

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          window.location.href = fallbackUrl
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [fallbackUrl])

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100">
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
            <h1 className="text-lg font-semibold">AR Redirect</h1>
            <div className="w-16" /> {/* Spacer */}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Redirect Notice */}
          <Card className="mb-8">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Smartphone className="h-8 w-8 text-white" />
              </div>
              <CardTitle>AR App Not Available</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-muted-foreground">
                The AR application couldn't be opened on your device. 
                You'll be redirected to the web version in <strong>{countdown}</strong> seconds.
              </p>
              
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-orange-600 h-2 rounded-full transition-all duration-1000"
                  style={{ width: `${((5 - countdown) / 5) * 100}%` }}
                ></div>
              </div>
            </CardContent>
          </Card>

          {/* Troubleshooting */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Troubleshooting
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-orange-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    1
                  </div>
                  <div>
                    <p className="text-sm font-medium">Update Google App</p>
                    <p className="text-xs text-muted-foreground">Make sure you have the latest version of Google app installed</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-orange-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    2
                  </div>
                  <div>
                    <p className="text-sm font-medium">Check Device Compatibility</p>
                    <p className="text-xs text-muted-foreground">AR features require Android 7.0+ with ARCore support</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-orange-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    3
                  </div>
                  <div>
                    <p className="text-sm font-medium">Enable Camera Permissions</p>
                    <p className="text-xs text-muted-foreground">Allow camera access for AR functionality</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Manual Actions */}
          <div className="space-y-4">
            <Button
              className="w-full gap-2"
              onClick={() => window.location.href = fallbackUrl}
            >
              <ExternalLink className="h-4 w-4" />
              Go to Web Version Now
            </Button>
            
            <Button asChild variant="outline" className="w-full gap-2">
              <Link to="/">
                <ArrowLeft className="h-4 w-4" />
                Return to Home
              </Link>
            </Button>
          </div>

          {/* Help Text */}
          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">
              Having trouble? The web version provides a similar AR experience 
              that works on most devices.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
