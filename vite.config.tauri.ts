import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  root: 'src',
  // Tauri serves embedded assets from a non-root URL; absolute "/assets/..." breaks favicon and chunks.
  base: './',
  build: {
    target: 'esnext',
    outDir: '../dist-tauri',
  },
  resolve: {
    alias: {
      '@ifkit-storage': resolve(__dirname, 'src/ifKit/storage/tauri.ts'),
    },
  },
})
