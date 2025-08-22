# 🍽️ Lusion AR Dining - Frontend

A modern React + TypeScript frontend for an immersive AR dining experience. Built with Vite, Tailwind CSS, and Framer Motion.

## 🚀 Quick Start

### Prerequisites
- Node.js 20.14.0+ (current: 20.14.0)
- npm 10.7.0+
- Running Flask backend on `http://localhost:5000`

### Development Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```
   - Frontend runs on: `http://localhost:5173`
   - Auto-opens browser
   - API requests proxied to Flask backend

3. **Backend Requirements**
   - Flask backend must be running on `http://localhost:5000`
   - No backend changes required - frontend uses existing endpoints
   - Proxying handles CORS automatically

## 📁 Project Structure

```
src/
├── api/                    # API Layer
│   ├── client.ts          # Axios instance with interceptors
│   ├── api.ts             # Core API utilities and helpers
│   ├── items.ts           # Menu items API
│   ├── ar.ts              # AR session management (client-side)
│   ├── qr.ts              # QR code generation and management
│   ├── examples.ts        # API usage examples
│   └── index.ts           # API exports
│
├── components/             # React Components
│   ├── ui/                # Reusable UI primitives
│   │   ├── Button.tsx     # Enhanced button with variants & animations
│   │   ├── Card.tsx       # Card components
│   │   ├── Input.tsx      # Form inputs with validation states
│   │   ├── Badge.tsx      # Status badges
│   │   ├── Spinner.tsx    # Loading indicators
│   │   ├── Toast.tsx      # Toast notifications (portal-based)
│   │   └── index.ts       # UI exports
│   │
│   ├── layout/            # Layout components
│   │   ├── Navbar.tsx     # Responsive navigation with animations
│   │   ├── Footer.tsx     # Footer with links and animations
│   │   ├── Layout.tsx     # Main layout with page transitions
│   │   └── index.ts       # Layout exports
│   │
│   ├── common/            # Common utility components
│   │   ├── ErrorState.tsx # Error display component
│   │   ├── EmptyState.tsx # Empty state component
│   │   ├── ConfirmDialog.tsx # Confirmation dialogs
│   │   └── index.ts       # Common exports
│   │
│   └── ErrorBoundary.tsx  # Global error boundary
│
├── hooks/                 # Custom React Hooks
│   ├── useItems.ts        # Menu items management
│   ├── useItem.ts         # Single item details
│   ├── useArSession.ts    # AR session management
│   ├── useQr.ts           # QR code operations
│   └── index.ts           # Hook exports
│
├── pages/                 # Page Components
│   ├── SimpleWelcomePage.tsx    # Main landing page (no API calls)
│   ├── ItemDetailPage.tsx       # Item details with AR integration
│   ├── ArViewPage.tsx          # Web AR viewer
│   ├── ModelViewerPage.tsx     # 3D model viewer
│   ├── MarkerPage.tsx          # AR marker detection
│   ├── AndroidArPage.tsx       # Android Scene Viewer launcher
│   ├── AndroidRedirectPage.tsx # Android fallback handler
│   ├── IosArLauncherPage.tsx   # iOS AR Quick Look launcher
│   ├── UiDemoPage.tsx          # Component showcase
│   ├── NotFoundPage.tsx        # 404 error page
│   └── index.ts                # Page exports
│
├── routes/                # Router Configuration
│   ├── AppRoutes.tsx      # Main routing with lazy loading
│   └── index.ts           # Route exports
│
├── types/                 # TypeScript Definitions
│   ├── api.schema.ts      # Generic API types
│   ├── item.schema.ts     # Menu item types & Zod schemas
│   ├── ar.schema.ts       # AR session types & Zod schemas
│   ├── qr.schema.ts       # QR code types & Zod schemas
│   ├── ui.ts              # UI component types
│   ├── webxr.d.ts         # WebXR type declarations
│   └── index.ts           # Type exports
│
├── utils/                 # Utility Functions
│   ├── cn.ts              # Class name utility (clsx + tailwind-merge)
│   ├── constants.ts       # App constants and configuration
│   └── index.ts           # Utility exports
│
├── styles/                # Styling
│   └── globals.css        # Tailwind CSS + custom styles
│
├── App.tsx                # Root component
└── main.tsx               # Application entry point
```

## 🎯 Key Features

### ✅ **Modern React Stack**
- **React 19** with TypeScript
- **Vite** for fast development and building
- **React Router v6** with lazy loading
- **Tailwind CSS** for styling
- **Framer Motion** for animations

### ✅ **Type Safety & Validation**
- **Strict TypeScript** configuration
- **Zod schemas** for runtime validation
- **Comprehensive error handling**
- **API response validation**

### ✅ **UI/UX Excellence**
- **Responsive design** (mobile-first)
- **Accessibility compliance** (WCAG)
- **Smooth animations** with Framer Motion
- **Professional component library**
- **Toast notifications**
- **Error boundaries**

### ✅ **AR Integration**
- **Platform detection** (iOS/Android/Desktop)
- **AR Quick Look** support (iOS)
- **Scene Viewer** support (Android)
- **WebXR** fallback for web
- **QR code generation** for easy sharing

### ✅ **Developer Experience**
- **Path aliases** (`@/components`, `@/hooks`, etc.)
- **API proxy** for seamless backend integration
- **Hot reload** with fast refresh
- **Comprehensive error logging**
- **TypeScript intellisense**

## 🔗 API Integration

### Backend Endpoints Used
```
GET  /api/items           # Fetch all menu items
GET  /qr/:itemId          # Generate QR code (PNG image)
GET  /ar-start/:itemId    # AR dispatcher (redirects)
GET  /ar-view/:itemId     # Web AR viewer (HTML)
```

### Proxy Configuration
```typescript
// vite.config.ts
server: {
  proxy: {
    '/api': { target: 'http://localhost:5000' },
    '/qr': { target: 'http://localhost:5000' },
    '/ar-start': { target: 'http://localhost:5000' },
    '/ar-view': { target: 'http://localhost:5000' },
  }
}
```

## 🎨 Available Routes

| Route | Component | Description |
|-------|-----------|-------------|
| `/` | `SimpleWelcomePage` | Landing page with hero and features |
| `/menu/:id` | `ItemDetailPage` | Item details with AR integration |
| `/ar-view` | `ArViewPage` | Web AR viewer |
| `/model-viewer` | `ModelViewerPage` | 3D model viewer |
| `/marker` | `MarkerPage` | AR marker detection |
| `/android-ar` | `AndroidArPage` | Android Scene Viewer launcher |
| `/android-redirect` | `AndroidRedirectPage` | Android fallback |
| `/ios-ar-launcher` | `IosArLauncherPage` | iOS AR Quick Look launcher |
| `/ui-demo` | `UiDemoPage` | Component showcase |
| `*` | `NotFoundPage` | 404 error page |

## 🛠️ Development Commands

```bash
# Development
npm run dev          # Start dev server with hot reload

# Building
npm run build        # Build for production
npm run preview      # Preview production build

# Code Quality
npm run lint         # Run ESLint
```

## 🌍 Environment Variables

Create `.env.development`:
```env
VITE_API_BASE=/api
VITE_APP_VERSION=1.0.0
VITE_NODE_ENV=development
VITE_DEV_MODE=true
VITE_ENABLE_LOGGING=true
```

## 📱 Browser Support

- **Chrome 90+** (full WebXR support)
- **Safari 14+** (AR Quick Look support)
- **Firefox 90+** (limited AR support)
- **Edge 90+** (WebXR support)
- **Mobile browsers** (iOS Safari, Chrome Mobile)

## 🎯 Performance Features

- **Code splitting** with lazy-loaded routes
- **Optimized bundles** with manual chunks
- **Image lazy loading**
- **Efficient re-renders** with React.memo and useCallback
- **No continuous API polling**

## 🔧 Troubleshooting

### Common Issues

1. **Continuous API requests**: Fixed by removing health monitoring and stabilizing hook dependencies
2. **CORS errors**: Resolved by Vite proxy configuration
3. **TypeScript errors**: All Zod and WebXR issues resolved
4. **Build errors**: Proper import paths and type declarations

### Development Tips

- Backend must be running before starting frontend
- Check browser console for API proxy logs
- Use `/ui-demo` to test components
- All AR features work best on mobile devices

---

**Built with ❤️ using React, TypeScript, and AR technology**