import { defineConfig } from 'vite'
import { viteSingleFile } from 'vite-plugin-singlefile'
import { resolve } from 'path'

export default defineConfig({
  root: 'src',
  plugins: [viteSingleFile()],
  build: {
    target: 'esnext',
    outDir: '../dist',
    assetsInlineLimit: 100_000_000,
    cssCodeSplit: false,
  },
  resolve: {
    alias: {
      '@ifkit-storage': resolve(__dirname, 'src/ifKit/storage/local.ts'),
    },
  },
})
