import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    target: 'es2020',
    cssCodeSplit: true,
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: {
        // Split heavy, cache-stable vendors into their own chunks so the
        // main bundle stays small and the browser can parallel-fetch.
        // (Vite 8 / rolldown expects a function here, not an object.)
        manualChunks(id) {
          if (!id.includes('node_modules')) return
          if (/[\\/]node_modules[\\/](react|react-dom|react-redux|@reduxjs|scheduler)[\\/]/.test(id)) return 'react-vendor'
          if (/[\\/]node_modules[\\/](@firebase|firebase)[\\/]/.test(id)) return 'firebase'
          if (/[\\/]node_modules[\\/](react-markdown|remark-|micromark|mdast-|unist-|react-syntax-highlighter|refractor|hast-|property-information|space-separated-tokens|comma-separated-tokens)[\\/]/.test(id)) return 'markdown'
          if (/[\\/]node_modules[\\/](motion|framer-motion)[\\/]/.test(id)) return 'motion'
        },
      },
    },
  },
})
