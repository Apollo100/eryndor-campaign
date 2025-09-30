import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        lore: resolve(__dirname, 'src/pages/lore/lore.html'),
        npcs: resolve(__dirname, 'src/pages/npcs/npcs.html'),
        pcs: resolve(__dirname, 'src/pages/pcs/pcs.html'),
        races: resolve(__dirname, 'src/pages/races/races.html'),
      }
    }
  },
  server: {
    port: 3000
  }
})