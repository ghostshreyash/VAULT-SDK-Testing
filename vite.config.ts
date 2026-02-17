import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "events": "events",
      "crypto": "crypto-browserify",
      "stream": "stream-browserify",
      "ws": path.resolve(__dirname, "./src/shims/ws.ts"),
      "buffer": "buffer",
    },
  },
  define: {
    'process.env': {},
    'global': 'window',
  },
  optimizeDeps: {
    include: ['events', 'crypto-browserify', 'stream-browserify', 'buffer'],
  }
})