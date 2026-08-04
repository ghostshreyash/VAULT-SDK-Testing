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
      "events": path.resolve(__dirname, "./node_modules/events/events.js"),
      "crypto": path.resolve(__dirname, "./node_modules/crypto-browserify/index.js"),
      "stream": path.resolve(__dirname, "./node_modules/stream-browserify/index.js"),
      "ws": path.resolve(__dirname, "./src/shims/ws.ts"),
      "fs": path.resolve(__dirname, "./src/shims/fs.ts"),
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
