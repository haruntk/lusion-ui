import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

// Reintroduce alias support (works in ESM) with explicit Node helpers; tsconfig.node.json already included
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
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
        configure: () => {
          // Simplified proxy configuration without detailed logging
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

    },
  },
  // Environment variables configuration
  define: {
    // Expose common environment variables (if they exist)
    // These will be available as import.meta.env.VITE_*
    'import.meta.env.VITE_API_URL': JSON.stringify(process.env.VITE_API_URL || 'http://localhost:5000/api'),
    'import.meta.env.VITE_API_BASE': JSON.stringify(process.env.VITE_API_BASE || 'http://localhost:5000/api'),
    'import.meta.env.VITE_APP_VERSION': JSON.stringify(process.env.VITE_APP_VERSION || '1.0.0'),
    'import.meta.env.VITE_DISABLE_STRICT_MODE': JSON.stringify(process.env.VITE_DISABLE_STRICT_MODE || 'false'),
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
