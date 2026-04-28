import { existsSync, readFileSync, renameSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { Plugin } from 'vite'
import { defineConfig } from 'vite'
import { viteSingleFile } from 'vite-plugin-singlefile'

const dir = dirname(fileURLToPath(import.meta.url))
const pkg = JSON.parse(readFileSync(resolve(dir, 'package.json'), 'utf-8')) as {
  name: string
  version: string
}
const webHtmlBase = `${pkg.name}_${pkg.version}`

function renameWebHtml(): Plugin {
  return {
    name: 'ifkit-rename-web-html',
    closeBundle() {
      const outDir = join(dir, 'dist')
      const from = join(outDir, 'index.html')
      const to = join(outDir, `${webHtmlBase}.html`)
      if (existsSync(from)) {
        renameSync(from, to)
      }
    },
  }
}

export default defineConfig({
  root: 'src',
  plugins: [viteSingleFile(), renameWebHtml()],
  build: {
    minify: false,
    target: 'esnext',
    outDir: '../dist',
    assetsInlineLimit: 100_000_000,
    cssCodeSplit: false,
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      '@ifkit-storage': resolve(dir, 'src/ifKit/storage/local.ts'),
    },
  },
})
