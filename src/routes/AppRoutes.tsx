import * as React from "react"
import { Routes, Route, useLocation } from "react-router-dom"
import { Layout } from "@/components/layout"
import { Spinner } from "@/components/ui"

// Lazy load all pages for consistent behavior  
const WelcomePage = React.lazy(() => import("@/pages/SimpleWelcomePage").then(m => ({ default: m.SimpleWelcomePage })))
// Lazy load other pages for better performance
const MenuPage = React.lazy(() => import("@/pages/MenuPage").then(m => ({ default: m.MenuPage })))
const RealEstatePage = React.lazy(() => import("@/pages/RealEstatePage").then(m => ({ default: m.RealEstatePage })))
const AboutPage = React.lazy(() => import("@/pages/AboutPage").then(m => ({ default: m.AboutPage })))
const ContactPage = React.lazy(() => import("@/pages/ContactPage").then(m => ({ default: m.ContactPage })))
const QrCodesPage = React.lazy(() => import("@/pages/QrCodesPage").then(m => ({ default: m.QrCodesPage })))
const ItemDetailPage = React.lazy(() => import("@/pages/ItemDetailPage").then(m => ({ default: m.ItemDetailPage })))
const ArViewPage = React.lazy(() => import("@/pages/ArViewPage").then(m => ({ default: m.ArViewPage })))
const ModelViewerPage = React.lazy(() => import("@/pages/ModelViewerPage").then(m => ({ default: m.ModelViewerPage })))
const MarkerPage = React.lazy(() => import("@/pages/MarkerPage").then(m => ({ default: m.MarkerPage })))
const AndroidArPage = React.lazy(() => import("@/pages/AndroidArPage").then(m => ({ default: m.AndroidArPage })))
const AndroidRedirectPage = React.lazy(() => import("@/pages/AndroidRedirectPage").then(m => ({ default: m.AndroidRedirectPage })))
const IosArLauncherPage = React.lazy(() => import("@/pages/IosArLauncherPage").then(m => ({ default: m.IosArLauncherPage })))
const UiDemoPage = React.lazy(() => import("@/pages/UiDemoPage").then(m => ({ default: m.UiDemoPage })))
const DebugPage = React.lazy(() => import("@/pages/DebugPage").then(m => ({ default: m.DebugPage })))
const AdminModelAddPage = React.lazy(() => import("@/pages/AdminModelAddPage").then(m => ({ default: m.AdminModelAddPage })))
const NotFoundPage = React.lazy(() => import("@/pages/NotFoundPage").then(m => ({ default: m.NotFoundPage })))

// Loading fallback component
function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="text-center">
        <Spinner size="lg" className="mx-auto mb-4" />
        <p className="text-muted-foreground">Loading...</p>
      </div>
    </div>
  )
}

export function AppRoutes() {
  const location = useLocation()
  
  // Debug route changes in development
  React.useEffect(() => {
    if (import.meta.env.DEV) {
      // Navigation tracking is handled by RouteDebugger component
      // No need for additional logging here
    }
  }, [location.pathname])

  return (
    <React.Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Routes with Layout */}
        <Route path="/" element={<Layout key="layout" />}>
          <Route index element={<WelcomePage />} />
          <Route path="menu" element={<MenuPage />} />
          <Route path="real-estate" element={<RealEstatePage />} />
          <Route path="menu/:id" element={<ItemDetailPage />} />
          <Route path="view/:id" element={<ModelViewerPage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="contact" element={<ContactPage />} />
          <Route path="qr" element={<QrCodesPage />} />
          <Route path="ar/:itemId" element={<ArViewPage />} />
          <Route path="ui-demo" element={<UiDemoPage />} />
          <Route path="debug" element={<DebugPage />} />
          <Route path="lusion-admin-model" element={<AdminModelAddPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>

        {/* Standalone AR/Mobile Routes (no layout) - separate from main layout to avoid conflicts */}
        <Route path="/ar-view" element={<ArViewPage />} />  {/* Legacy route with query param support: ?item_id= */}
        <Route path="/model-viewer" element={<ModelViewerPage />} />  {/* Query param support: ?item_id= */}
        <Route path="/marker" element={<MarkerPage />} />
        <Route path="/android-ar" element={<AndroidArPage />} />
        <Route path="/android-redirect" element={<AndroidRedirectPage />} />
        <Route path="/ios-ar-launcher" element={<IosArLauncherPage />} />
      </Routes>
    </React.Suspense>
  )
}
