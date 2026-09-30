import { defineConfig } from 'vite'
import path from 'path'
import { fileURLToPath } from 'url'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)


function figmaAssetResolver() {
  return {
    name: 'figma-asset-resolver',
    resolveId(id: string) {
      if (id.startsWith('figma:asset/')) {
        const filename = id.replace('figma:asset/', '')
        return path.resolve(__dirname, 'src/assets', filename)
      }
    },
  }
}

export default defineConfig({
  plugins: [
    figmaAssetResolver(),
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      // Alias @ to the src/core directory
      '@': path.resolve(__dirname, './src/core'),
    },
  },
  define: {
    // Polyfill global for sockjs-client
    global: 'window',
  },
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('recharts') || id.includes('d3-')) {
              return 'chart-vendor';
            }
            if (id.includes('lucide-react')) {
              return 'icons-vendor';
            }
            if (
              id.includes('@radix-ui') ||
              id.includes('class-variance-authority') ||
              id.includes('clsx') ||
              id.includes('tailwind-merge') ||
              id.includes('sonner') ||
              id.includes('vaul')
            ) {
              return 'ui-vendor';
            }
            if (
              id.includes('react/') ||
              id.includes('react-dom/') ||
              id.includes('react-router') ||
              id.includes('scheduler')
            ) {
              return 'react-vendor';
            }
            if (
              id.includes('@reduxjs') ||
              id.includes('react-redux') ||
              id.includes('redux-persist')
            ) {
              return 'redux-vendor';
            }
            if (id.includes('@tanstack') || id.includes('axios')) {
              return 'query-vendor';
            }
            if (
              id.includes('motion') ||
              id.includes('embla-carousel') ||
              id.includes('react-slick')
            ) {
              return 'motion-vendor';
            }
            if (id.includes('@stomp') || id.includes('sockjs-client')) {
              return 'stomp-vendor';
            }
          }
        },
      },
    },
  },

  // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
  assetsInclude: ['**/*.svg', '**/*.csv'],
})
