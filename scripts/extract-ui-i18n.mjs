/**
 * Синхронизирует `src/locales/<code>.ui.json` с каноном ключей `UiKey` из `src/ifKit/ui-keys.ts`
 * (как `u()`). Для каждого `<code>.game.json` создаётся/обновляется `<code>.ui.json`;
 * существующие значения сохраняются, новым ключам задаётся `""` (в merge i18n пустая строка
 * не перекрывает встроенные строки `BUILTIN_UI`).
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const srcRoot = path.join(root, 'src')
const localesDir = path.join(srcRoot, 'locales')
const uiKeysFile = path.join(srcRoot, 'ifKit', 'ui-keys.ts')

/**
 * @returns {string[]}
 */
function getCanonicalUiKeys() {
  const text = fs.readFileSync(uiKeysFile, 'utf8')
  const m = text.match(/export const UI = \{([^]*)\}\s*as const/)
  if (!m) {
    throw new Error(`[i18n:extract-ui] не найден export const UI в ${path.relative(root, uiKeysFile)}`)
  }
  const block = m[1]
  const keys = new Set()
  for (const x of block.matchAll(/:\s*'(ui\.[^']+)'/g)) {
    keys.add(x[1])
  }
  return [...keys].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0))
}

function stableSortedKeys(/** @type {Set<string>} */ set) {
  return [...set].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0))
}

function main() {
  const canonical = getCanonicalUiKeys()
  if (!fs.existsSync(localesDir)) {
    console.log('[i18n:extract-ui] каталог locales отсутствует, пропуск')
    return
  }

  let gameFiles = fs.readdirSync(localesDir).filter((f) => f.endsWith('.game.json'))
  if (gameFiles.length === 0) {
    const seed = path.join(localesDir, 'template.game.json')
    fs.writeFileSync(seed, '{}\n', 'utf8')
    gameFiles = ['template.game.json']
    console.log('[i18n:extract-ui] не было *.game.json — создан пустой template.game.json')
  }

  for (const gf of gameFiles) {
    const code = gf.replace(/\.game\.json$/, '')
    const outPath = path.join(localesDir, `${code}.ui.json`)

    /** @type {Record<string, string>} */
    let prev = {}
    if (fs.existsSync(outPath)) {
      try {
        prev = JSON.parse(fs.readFileSync(outPath, 'utf8'))
      } catch (e) {
        console.error('[i18n:extract-ui] не удалось прочитать', outPath, e)
        process.exit(1)
      }
    }

    const canonSet = new Set(canonical)
    /** @type {Record<string, string>} */
    const next = {}
    for (const k of canonical) {
      next[k] = Object.prototype.hasOwnProperty.call(prev, k) ? prev[k] : ''
    }

    const orphan = Object.keys(prev).filter((k) => !canonSet.has(k))
    if (orphan.length) {
      console.warn(
        `[i18n:extract-ui] в ${code}.ui.json есть ключи вне ui-keys (оставлены):`,
        orphan.join(', '),
      )
      for (const k of stableSortedKeys(new Set(orphan))) {
        if (!Object.prototype.hasOwnProperty.call(next, k)) next[k] = prev[k]
      }
    }

    const finalKeys = stableSortedKeys(new Set(Object.keys(next)))
    /** @type {Record<string, string>} */
    const ordered = {}
    for (const k of finalKeys) ordered[k] = next[k]

    fs.writeFileSync(outPath, JSON.stringify(ordered, null, 2) + '\n', 'utf8')
    console.log(
      `[i18n:extract-ui] ${canonical.length} ключей → ${path.relative(root, outPath)}` +
        (orphan.length ? ` (+ ${orphan.length} вне канона)` : ''),
    )
  }
}

main()
