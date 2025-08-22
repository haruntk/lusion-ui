import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
    host: true, // Allow external connections
    open: true, // Auto-open browser
    proxy: {
      // Proxy all /api requests to Flask backend
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
        ws: true, // Enable WebSocket proxying if needed
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('Proxy error:', err)
          })
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Proxying request:', req.method, req.url, '→', proxyReq.path)
          })
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Proxy response:', req.url, '→', proxyRes.statusCode)
          })
        },
      },
      // Proxy Flask AR/QR routes directly (no /api prefix)
      '/ar-start': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/ar-view': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/qr': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/item': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/view': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/healthz': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  // Environment variables configuration
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version || '1.0.0'),
  },
  // Build configuration
  build: {
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['framer-motion', 'lucide-react'],
          api: ['axios', 'zod'],
        },
      },
    },
  },
})
