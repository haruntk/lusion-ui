import * as React from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { 
  Home, 
  Menu, 
  Info, 
  Phone, 
  QrCode, 
  ArrowLeft,
  RefreshCw,
  CheckCircle,
  XCircle
} from "lucide-react"
import { 
  Button, 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  Badge
} from "@/components/ui"

/**
 * NavigationTest Component
 * Tests React Router navigation between pages
 * Demonstrates proper page transitions without double-renders or blank screens
 */
export function NavigationTest() {
  const location = useLocation()
  const navigate = useNavigate()
  const [renderCount, setRenderCount] = React.useState(0)
  const [navigationHistory, setNavigationHistory] = React.useState<string[]>([])

  // Track component renders (should only happen once per route change)
  React.useEffect(() => {
    setRenderCount(prev => prev + 1)
    setNavigationHistory(prev => [...prev, location.pathname].slice(-5)) // Keep last 5 navigations
  }, [location.pathname])

  const testRoutes = [
    { path: "/", label: "Home", icon: Home },
    { path: "/menu", label: "Menu", icon: Menu },
    { path: "/about", label: "About", icon: Info },
    { path: "/contact", label: "Contact", icon: Phone },
    { path: "/qr", label: "QR Codes", icon: QrCode },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="container mx-auto px-4 py-8"
    >
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5" />
                Navigation Test Dashboard
              </CardTitle>
              <CardDescription>
                Test React Router navigation and monitor rendering behavior
              </CardDescription>
            </div>
            <Button
              variant="outline"
              onClick={() => navigate(-1)}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Go Back
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Current Status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="font-medium">Current Route</span>
                </div>
                <Badge variant="default" className="text-sm">
                  {location.pathname}
                </Badge>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <RefreshCw className="h-5 w-5 text-blue-500" />
                  <span className="font-medium">Render Count</span>
                </div>
                <div className="text-2xl font-bold text-blue-600">
                  {renderCount}
                </div>
                <div className="text-xs text-muted-foreground">
                  {renderCount === 1 ? "✅ Normal" : "⚠️ Multiple renders"}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  {renderCount === 1 ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-yellow-500" />
                  )}
                  <span className="font-medium">Status</span>
                </div>
                <Badge 
                  variant={renderCount === 1 ? "default" : "secondary"}
                  className={renderCount === 1 ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}
                >
                  {renderCount === 1 ? "Healthy" : "Check StrictMode"}
                </Badge>
              </CardContent>
            </Card>
          </div>

          {/* Navigation History */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Navigation History</CardTitle>
              <CardDescription>Last 5 page visits (most recent first)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {navigationHistory.slice().reverse().map((path, index) => (
                  <Badge 
                    key={`${path}-${index}`}
                    variant={index === 0 ? "default" : "secondary"}
                    className="text-xs"
                  >
                    {index === 0 && "📍 "}{path}
                  </Badge>
                ))}
                {navigationHistory.length === 0 && (
                  <span className="text-muted-foreground text-sm">No navigation yet</span>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Test Navigation Links */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Test Navigation</CardTitle>
              <CardDescription>
                Click these links to test navigation between pages
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {testRoutes.map((route) => {
                  const Icon = route.icon
                  const isActive = location.pathname === route.path
                  
                  return (
                    <motion.div
                      key={route.path}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        asChild
                        variant={isActive ? "default" : "outline"}
                        className="w-full h-auto p-4 flex-col gap-2"
                        disabled={isActive}
                      >
                        <Link to={route.path}>
                          <Icon className="h-5 w-5" />
                          <span className="text-sm">{route.label}</span>
                          {isActive && (
                            <Badge variant="secondary" className="text-xs">
                              Current
                            </Badge>
                          )}
                        </Link>
                      </Button>
                    </motion.div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Technical Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Technical Information</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <div><strong>React Router Version:</strong> v7.8.1</div>
              <div><strong>Navigation Type:</strong> Browser Router</div>
              <div><strong>Lazy Loading:</strong> Enabled with React.Suspense</div>
              <div><strong>StrictMode:</strong> {process.env.NODE_ENV === 'development' ? 'Enabled (Dev)' : 'Disabled (Prod)'}</div>
              <div className="pt-2 text-muted-foreground">
                💡 <strong>Expected Behavior:</strong> Render count should be 1 per route change. 
                If you see higher numbers in development, it's due to React StrictMode 
                (which is normal and helps catch bugs).
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </motion.div>
  )
}
