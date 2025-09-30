import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        lore: resolve(__dirname, 'pages/worldlore.html'),
        npcs: resolve(__dirname, 'pages/npcs.html'),
        pcs: resolve(__dirname, 'pages/pc.html'),
        lore: resolve(__dirname, 'pages/worldlore.html'),
      }
    }
  },
  server: {
    port: 3000
  }
})