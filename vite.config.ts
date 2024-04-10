import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from "path"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  build: {
    rollupOptions: {
      input: {
        'content-script': "src/scripts/contentScript.ts",
        'index': "index.html",
      },
      output: {
        entryFileNames: chunkInfo => {
          return `assets/${chunkInfo.name}.js`
        }
      },
      // No tree-shaking otherwise it removes functions from Content Scripts.
      // treeshake: false
    }
  }
})
