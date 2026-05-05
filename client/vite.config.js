import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  define: {
    'process.env.VITE_API_URL': JSON.stringify(process.env.VITE_API_URL || ''),
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      },
      '/socket.io': {
        target: 'http://localhost:5000',
        ws: true
      }
    }
  },
  build: {
    target: 'esnext',
    minify: 'terser',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            if (id.includes('react')) return 'vendor-react';
            if (id.includes('socket.io')) return 'vendor-socket';
            if (id.includes('framer-motion') || id.includes('lucide')) return 'vendor-ui';
            if (id.includes('axios')) return 'vendor-http';
            return 'vendor-common';
          }
        }
      }
    },
    chunkSizeWarningLimit: 1000,
    cssCodeSplit: true
  }
})

