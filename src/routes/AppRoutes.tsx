import * as React from "react"
import { Routes, Route } from "react-router-dom"
import { Layout } from "@/components/layout"
import { Spinner } from "@/components/ui"

// Lazy load pages for better performance
const WelcomePage = React.lazy(() => import("@/pages/SimpleWelcomePage").then(m => ({ default: m.SimpleWelcomePage })))
const MenuPage = React.lazy(() => import("@/pages/MenuPage").then(m => ({ default: m.MenuPage })))
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
  return (
    <React.Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Routes with Layout */}
        <Route path="/" element={<Layout />}>
          <Route index element={<WelcomePage />} />
          <Route path="menu" element={<MenuPage />} />
          <Route path="menu/:id" element={<ItemDetailPage />} />
          <Route path="view/:id" element={<ModelViewerPage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="contact" element={<ContactPage />} />
          <Route path="qr" element={<QrCodesPage />} />
          <Route path="ar-view" element={<ArViewPage />} />
          <Route path="ui-demo" element={<UiDemoPage />} />
          <Route path="debug" element={<DebugPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>

        {/* Standalone AR/Mobile Routes (no layout) */}
        <Route path="/ar/:itemId" element={<ArViewPage />} />
        <Route path="/model-viewer" element={<ModelViewerPage />} />
        <Route path="/marker" element={<MarkerPage />} />
        <Route path="/android-ar" element={<AndroidArPage />} />
        <Route path="/android-redirect" element={<AndroidRedirectPage />} />
        <Route path="/ios-ar-launcher" element={<IosArLauncherPage />} />
      </Routes>
    </React.Suspense>
  )
}
