import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
  ],

  build: {
    target: "es2020",
    outDir: "dist",
    assetsDir: "assets",

    // Use default esbuild minifier (REMOVE terser)
    minify: "esbuild",

    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom", "react-router-dom"],
          animations: ["framer-motion"],
          ui: ["lucide-react"],
          supabase: ["@supabase/supabase-js"],
        },

        assetFileNames: (assetInfo) => {
          const ext = assetInfo.name.split(".").pop();

          if (/png|jpe?g|gif|svg|webp/.test(ext)) {
            return "images/[name]-[hash][extname]";
          }
          if (/woff|woff2|eot|ttf|otf/.test(ext)) {
            return "fonts/[name]-[hash][extname]";
          }
          if (ext === "css") {
            return "css/[name]-[hash][extname]";
          }

          return "assets/[name]-[hash][extname]";
        },

        chunkFileNames: "js/[name]-[hash].js",
        entryFileNames: "js/[name]-[hash].js",
      },
    },

    chunkSizeWarningLimit: 400, // Reduced from 600
    cssCodeSplit: true,
    sourcemap: false,
    reportCompressedSize: true,
    assetsInlineLimit: 2048, // Reduced from 4096
  },

  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react-router-dom",
      "framer-motion",
      "gsap",
      "lucide-react",
      "@supabase/supabase-js",
    ],
    esbuildOptions: {
      define: {
        global: "globalThis",
      },
    },
  },

  esbuild: {
    legalComments: "none",
    drop: ["console", "debugger"], // replaces drop_console from terser
    target: "es2020",
  },
});