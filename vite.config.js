import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
  ],

  build: {
    // Production optimizations
    target: 'es2020',
    outDir: 'dist',
    assetsDir: 'assets',
    minify: 'terser',
    
    terserOptions: {
      compress: {
        drop_console: true, // Remove console logs in production
        passes: 2,
      },
      mangle: true,
      format: {
        comments: false,
      }
    },

    // Rollup options
    rollupOptions: {
      output: {
        // Manual chunk splitting for better caching
        manualChunks: {
          'vendor': ['react', 'react-dom', 'react-router-dom'],
          'animations': ['framer-motion', '@gsap/react', 'gsap'],
          'ui': ['lucide-react'],
          'supabase': ['@supabase/supabase-js'],
        },
        // Asset naming strategy
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.')
          const ext = info[info.length - 1]
          if (/png|jpe?g|gif|svg|webp/.test(ext)) {
            return `images/[name]-[hash][extname]`
          } else if (/woff|woff2|eot|ttf|otf/.test(ext)) {
            return `fonts/[name]-[hash][extname]`
          } else if (ext === 'css') {
            return `css/[name]-[hash][extname]`
          }
          return `[name]-[hash][extname]`
        },
        chunkFileNames: 'js/[name]-[hash].js',
        entryFileNames: 'js/[name]-[hash].js',
      },
    },

    // Chunk size warnings
    chunkSizeWarningLimit: 500,
    
    // CSS optimization
    cssCodeSplit: true,
    
    // Source maps only in development
    sourcemap: false,
    
    // Reporting compressed size
    reportCompressedSize: true,

    // Increase size limit for assets
    assetsInlineLimit: 4096,

    // Enable dynamic import
    dynamicImportInCjs: false,
  },

  // Development server optimizations
  server: {
    middlewareMode: false,
    headers: {
      'Cache-Control': 'public, max-age=31536000, immutable'
    }
  },

  // Optimization
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'framer-motion',
      'gsap',
      '@gsap/react',
      'lucide-react',
      '@supabase/supabase-js'
    ],
    exclude: [],
    esbuildOptions: {
      define: {
        global: 'globalThis'
      }
    }
  },

  // Performance hints
  esbuild: {
    legalComments: 'none',
    target: 'es2020'
  }
})
