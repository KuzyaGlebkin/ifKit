export type Locales = Record<string, Record<string, string>>

let _locales: Locales = {}
let _lang = ''

function applyResolvedAuto(): void {
  const keys = Object.keys(_locales)
  if (keys.length === 0) {
    _lang = ''
    return
  }
  const nav = (typeof navigator !== 'undefined' ? navigator.language : '').split('-')[0]
  _lang = keys.includes(nav) ? nav : keys[0]
}

export function initI18n(locales: Locales, language: string): void {
  _locales = locales
  const keys = Object.keys(locales)
  if (keys.length === 0) {
    _lang = ''
    return
  }
  if (language) {
    _lang = language
    return
  }
  applyResolvedAuto()
}

export function t(strings: TemplateStringsArray, ...values: unknown[]): string {
  const key = strings.reduce(
    (acc, part, i) => acc + part + (i < values.length ? `{${i}}` : ''),
    '',
  )
  const template = _locales[_lang]?.[key] ?? key
  return template.replace(/\{(\d+)\}/g, (_, i) => String(values[Number(i)] ?? ''))
}

export function setLanguage(lang: string): void {
  _lang = lang
}

export function setLanguageOrAuto(preference: string): void {
  if (preference) {
    setLanguage(preference)
    return
  }
  applyResolvedAuto()
}

export function getAvailableLanguages(): string[] {
  return Object.keys(_locales)
}
