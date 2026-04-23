import { defineConfig } from 'vite'
import { viteSingleFile } from 'vite-plugin-singlefile'

export default defineConfig({
  root: 'src',
  plugins: [viteSingleFile()],
  build: {
    target: 'esnext',
    outDir: '../dist',
    assetsInlineLimit: 100_000_000,
    cssCodeSplit: false,
  },
})
