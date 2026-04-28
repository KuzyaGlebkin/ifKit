import { BUILTIN_UI } from './builtin-ui'
import type { UiKey } from './ui-keys'

/** In-scene / game string maps per language (unchanged from legacy flat `locales`). */
export type Locales = Record<string, Record<string, string>>

/** Optional split: `game` for `t`, `ui` for chrome / `u()`. */
export interface LocaleBundle {
  game: Record<string, string>
  /** Optional; missing entries use built-in UI for `sourceLanguage`, then other fallbacks. */
  ui?: Record<string, string>
}

/** Per-language entry: either legacy flat `game` map, or a `LocaleBundle`. */
export type LocalesInput = Record<string, LocaleBundle | Record<string, string>>

let _game: Locales = {}
let _ui: Record<string, Record<string, string>> = {}
let _resolvedLang = ''
let _sourceLanguage = ''
let _localeChangeHandler: (() => void) | null = null

function isLocaleBundle(
  v: LocaleBundle | Record<string, string>,
): v is LocaleBundle {
  return 'game' in v && v.game !== null && typeof v.game === 'object' && !Array.isArray(v.game)
}

/**
 * Merges author `locales` with built-in `ui` strings. Legacy flat per-language
 * maps are treated as `game` only; `sourceLanguage: {}` is supported.
 */
export function normalizeLocalesInput(
  raw: LocalesInput | undefined,
  sourceLanguage?: string,
): { game: Locales; ui: Record<string, Record<string, string>> } {
  const base: LocalesInput = raw ? { ...raw } : {}
  if (sourceLanguage && base[sourceLanguage] === undefined) {
    (base as Record<string, unknown>)[sourceLanguage] = {}
  }
  const langs = Object.keys(base) as string[]
  const game: Locales = {}
  const authorUi: Record<string, Record<string, string>> = {}

  for (const lang of langs) {
    const v = base[lang]!
    if (isLocaleBundle(v)) {
      game[lang] = { ...v.game }
      authorUi[lang] = { ...v.ui }
    } else {
      game[lang] = { ...v }
    }
  }

  const allLangs = new Set(langs)
  if (allLangs.size === 0) {
    allLangs.add('en')
    allLangs.add('ru')
  }
  const ui: Record<string, Record<string, string>> = {}
  for (const lang of allLangs) {
    const merged: Record<string, string> = {}
    const builtIn = BUILTIN_UI[lang]
    if (builtIn) {
      const table = builtIn as Record<string, string | undefined>
      for (const k of Object.keys(builtIn) as UiKey[]) {
        const t = table[k]
        if (t !== undefined) merged[k] = t
      }
    }
    const a = authorUi[lang] ?? {}
    for (const [k, t] of Object.entries(a)) {
      if (t === '') continue
      merged[k] = t
    }
    ui[lang] = merged
  }
  return { game, ui }
}

/**
 * Подмешивает ключи из `template.*.json` (импорт ifKit) к каждому авторскому языку;
 * автор перекрывает шаблон. Код языка `template` в `locales` не добавляется.
 */
export function mergeAuthorLocalesWithTemplate(
  raw: LocalesInput,
  templateGame: Record<string, string>,
  templateUi: Record<string, string>,
): LocalesInput {
  const out: LocalesInput = {}
  for (const lang of Object.keys(raw)) {
    const v = raw[lang]!
    if (isLocaleBundle(v)) {
      const authorUi = v.ui ?? {}
      out[lang] = {
        game: { ...templateGame, ...v.game },
        ui: { ...templateUi, ...authorUi },
      }
    } else {
      out[lang] = { ...templateGame, ...v }
    }
  }
  return out
}

function navPrimary(): string {
  return (typeof navigator !== 'undefined' ? navigator.language : '').split('-')[0] || ''
}

function applyResolvedGameLanguage(): void {
  const keys = Object.keys(_game)
  if (keys.length === 0) {
    return
  }
  const nav = navPrimary()
  _resolvedLang = keys.includes(nav) ? nav : keys[0]!
}

/** Resolve which language to use for `t` and `u` when `preference` is `''` (auto). */
function applyResolvedAuto(): void {
  if (Object.keys(_game).length > 0) {
    applyResolvedGameLanguage()
    return
  }
  const nav = navPrimary()
  if (nav && _ui[nav]) {
    _resolvedLang = nav
    return
  }
  if (_ui.en) {
    _resolvedLang = 'en'
    return
  }
  const first = Object.keys(_ui)[0]
  _resolvedLang = first ?? ''
}

function syncRootLang(): void {
  if (typeof document === 'undefined') return
  const tag = _resolvedLang || navPrimary() || 'en'
  document.documentElement.lang = tag
}

function notifyLocaleChange(): void {
  _localeChangeHandler?.()
  syncRootLang()
}

/**
 * When i18n is ready, call `initI18n` first, then `applySettings`, so
 * `document.documentElement.lang` matches resolved language.
 */
export function setLocaleChangeHandler(fn: (() => void) | null): void {
  _localeChangeHandler = fn
}

export function initI18n(
  game: Locales,
  uiByLang: Record<string, Record<string, string>>,
  language: string,
  sourceLanguage?: string,
): void {
  _game = game
  _ui = uiByLang
  _sourceLanguage = sourceLanguage ?? ''
  if (Object.keys(_game).length === 0) {
    if (language) {
      _resolvedLang = _ui[language] ? language : (Object.keys(_ui)[0] ?? 'en')
    } else {
      _resolvedLang = ''
      applyResolvedAuto()
    }
  } else if (language) {
    _resolvedLang = language
  } else {
    _resolvedLang = ''
    applyResolvedAuto()
  }
  notifyLocaleChange()
}

export function t(strings: TemplateStringsArray, ...values: unknown[]): string {
  const key = strings.reduce(
    (acc, part, i) => acc + part + (i < values.length ? `{${i}}` : ''),
    '',
  )
  const tr = _game[_resolvedLang]?.[key]
  const template = tr !== undefined && tr !== '' ? tr : key
  return template.replace(/\{(\d+)\}/g, (_, i) => String(values[Number(i)] ?? ''))
}

/**
 * Resolve a game locale string without template interpolation (same lookup/fallback as `t` for a plain key).
 */
export function translateGameString(sourceKey: string): string {
  const tr = _game[_resolvedLang]?.[sourceKey]
  const template = tr !== undefined && tr !== '' ? tr : sourceKey
  return template.replace(/\{(\d+)\}/g, () => '')
}

/** Engine / chrome UI string by stable key. */
export function u(key: UiKey | string): string {
  const k = key as UiKey
  const fromSourceBuiltin =
    _sourceLanguage ? BUILTIN_UI[_sourceLanguage]?.[k] : undefined
  return (
    _ui[_resolvedLang]?.[k]
    ?? BUILTIN_UI[_resolvedLang]?.[k]
    ?? _ui.en?.[k]
    ?? fromSourceBuiltin
    ?? k
  )
}

export function getResolvedLanguage(): string {
  return _resolvedLang
}

/** BCP 47–friendly tag for `Intl` / `toLocaleString` (primary subtag). */
export function getLocaleForFormatting(): string {
  if (_resolvedLang) return _resolvedLang
  const n = navPrimary()
  if (n) return n
  return 'en'
}

export function setLanguage(lang: string): void {
  if (Object.keys(_game).length > 0) {
    if (lang) {
      _resolvedLang = lang
    } else {
      applyResolvedGameLanguage()
    }
  } else {
    _resolvedLang = lang && _ui[lang] ? lang : (Object.keys(_ui)[0] ?? 'en')
  }
  notifyLocaleChange()
}

export function setLanguageOrAuto(preference: string): void {
  if (Object.keys(_game).length > 0) {
    if (preference) {
      setLanguage(preference)
      return
    }
    applyResolvedGameLanguage()
    notifyLocaleChange()
    return
  }
  if (preference) {
    _resolvedLang = _ui[preference] ? preference : (Object.keys(_ui)[0] ?? 'en')
  } else {
    applyResolvedAuto()
  }
  notifyLocaleChange()
}

export function getAvailableLanguages(): string[] {
  return Object.keys(_game)
}

export function syncRootLangFromI18n(): void {
  syncRootLang()
}
