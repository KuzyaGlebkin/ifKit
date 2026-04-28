/**
 * Собирает ключи i18n из кода игры (как в runtime в `t()`): tagged templates
 * `t`, `P`, `H1`–`H3`, `em`, `strong`, `act`…`(cb)`, `goto(k)`…``.
 * Пишет `src/locales/template.game.json`: сливает с существующим файлом (сохраняет значения).
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import ts from 'typescript'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const srcRoot = path.join(root, 'src')
const outFile = path.join(srcRoot, 'locales', 'template.game.json')

const TAGGED_LIKE_T = new Set(['t', 'P', 'H1', 'H2', 'H3', 'em', 'strong'])

/**
 * @param {ts.TemplateLiteral | ts.NoSubstitutionTemplateLiteral} tpl
 * @param {ts.SourceFile} sf
 */
function templateToKey(tpl, sf) {
  if (ts.isNoSubstitutionTemplateLiteral(tpl)) {
    const raw = tpl.text
    return raw
  }
  if (ts.isTemplateLiteral(tpl)) {
    let key = tpl.head.text
    for (let i = 0; i < tpl.templateSpans.length; i++) {
      key += `{${i}}`
      key += tpl.templateSpans[i].literal.text
    }
    return key
  }
  console.warn('[i18n:extract] неподдерживаемый шаблон:', tpl.getText(sf))
  return null
}

/**
 * @param {string} dir
 * @param {string[]} acc
 */
function listTsExcludingIfKit(dir, acc) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name)
    if (ent.isDirectory()) {
      if (ent.name === 'ifKit') continue
      listTsExcludingIfKit(p, acc)
    } else if (ent.name.endsWith('.ts')) {
      acc.push(p)
    }
  }
}

/**
 * @param {ts.Node} node
 * @param {ts.SourceFile} sf
 * @param {Set<string>} keys
 */
function visit(node, sf, keys) {
  if (node === undefined || node === null) return

  // `act`шаблон`(cb)` — в AST TypeScript у CallExpression поле `expression`, не `callee`.
  if (
    ts.isCallExpression(node) &&
    node.expression &&
    ts.isTaggedTemplateExpression(node.expression) &&
    ts.isIdentifier(node.expression.tag) &&
    node.expression.tag.text === 'act'
  ) {
    const k = templateToKey(node.expression.template, sf)
    if (k !== null && k !== '') keys.add(k)
  }

  if (ts.isTaggedTemplateExpression(node)) {
    const { tag } = node
    if (ts.isIdentifier(tag) && TAGGED_LIKE_T.has(tag.text)) {
      const k = templateToKey(node.template, sf)
      if (k !== null && k !== '') keys.add(k)
    } else if (
      ts.isCallExpression(tag) &&
      tag.expression &&
      ts.isIdentifier(tag.expression) &&
      tag.expression.text === 'goto'
    ) {
      const k = templateToKey(node.template, sf)
      if (k !== null && k !== '') keys.add(k)
    }
  }

  ts.forEachChild(node, (ch) => visit(ch, sf, keys))
}

function stableSortedKeys(/** @type {Set<string>} */ set) {
  return [...set].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0))
}

function main() {
  const files = []
  listTsExcludingIfKit(srcRoot, files)

  const keys = new Set()
  for (const file of files) {
    const text = fs.readFileSync(file, 'utf8')
    const sf = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS)
    visit(sf, sf, keys)
  }

  /** @type {Record<string, string>} */
  let prev = {}
  if (fs.existsSync(outFile)) {
    try {
      prev = JSON.parse(fs.readFileSync(outFile, 'utf8'))
    } catch (e) {
      console.error('[i18n:extract] не удалось прочитать', outFile, e)
      process.exit(1)
    }
  }

  const sorted = stableSortedKeys(keys)
  /** @type {Record<string, string>} */
  const next = {}
  for (const k of sorted) {
    next[k] = Object.prototype.hasOwnProperty.call(prev, k) ? prev[k] : ''
  }

  const orphan = Object.keys(prev).filter((k) => !keys.has(k))
  if (orphan.length) {
    console.warn(
      '[i18n:extract] в JSON есть ключи, которых нет в коде (оставлены в файле):',
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

  fs.mkdirSync(path.dirname(outFile), { recursive: true })
  fs.writeFileSync(outFile, JSON.stringify(ordered, null, 2) + '\n', 'utf8')
  console.log(
    `[i18n:extract] ${sorted.length} ключей из кода → ${path.relative(root, outFile)}` +
      (orphan.length ? ` (+ ${orphan.length} осиротевших)` : ''),
  )
}

main()
