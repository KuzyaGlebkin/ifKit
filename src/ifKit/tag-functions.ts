import { appendHtml } from './renderer'
import { setAudioIntent, playSound } from './audio'
import { t } from './i18n'


function buildTag(tag: string, content?: string, attrs?: Record<string, string>): string {
  const attrStr = attrs
    ? Object.entries(attrs)
        .map(([k, v]) => ` ${k}="${v}"`)
        .join('')
    : ''
  return content !== undefined
    ? `<${tag}${attrStr}>${content}</${tag}>`
    : `<${tag}${attrStr}>`
}

// ── Functional (return string) — внутр. + экспорт вспомогательных (без p–h3/em/strong) ─

const _p = (content: string, attrs?: Record<string, string>) => buildTag('p', content, attrs)
const _h1 = (content: string, attrs?: Record<string, string>) => buildTag('h1', content, attrs)
const _h2 = (content: string, attrs?: Record<string, string>) => buildTag('h2', content, attrs)
const _h3 = (content: string, attrs?: Record<string, string>) => buildTag('h3', content, attrs)
const _em = (content: string, attrs?: Record<string, string>) => buildTag('em', content, attrs)
const _strong = (content: string, attrs?: Record<string, string>) => buildTag('strong', content, attrs)
export const _span   = (content: string, attrs?: Record<string, string>) => buildTag('span', content, attrs)
export const _a      = (content: string, attrs?: Record<string, string>) => buildTag('a', content, attrs)
export const _li     = (content: string) => buildTag('li', content)
export const _ul     = (...items: string[]) => buildTag('ul', items.join(''))

export const img = (attrs: { src: string; alt?: string }): string =>
  buildTag('img', undefined, { src: attrs.src, ...(attrs.alt !== undefined ? { alt: attrs.alt } : {}) })
export const hr  = (): string => buildTag('hr')
export const br  = (): string => buildTag('br')

// ── Сцена: tagged + t, затем в буфер ─────────────────────────────────────────

export const P = (strings: TemplateStringsArray, ...values: unknown[]) =>
  appendHtml(_p(t(strings, ...values)))
export const H1 = (strings: TemplateStringsArray, ...values: unknown[]) =>
  appendHtml(_h1(t(strings, ...values)))
export const H2 = (strings: TemplateStringsArray, ...values: unknown[]) =>
  appendHtml(_h2(t(strings, ...values)))
export const H3 = (strings: TemplateStringsArray, ...values: unknown[]) =>
  appendHtml(_h3(t(strings, ...values)))

/** Один &lt;p&gt; из уже собранного innerHTML (напр. несколько `t` и склейка). */
export const Phtml = (innerHtml: string, attrs?: Record<string, string>) => appendHtml(_p(innerHtml, attrs))

// ── Inline: tagged + t, строка (для ${} в крупном шаблоне) ───────────────────

export const em = (strings: TemplateStringsArray, ...values: unknown[]) => _em(t(strings, ...values))
export const strong = (strings: TemplateStringsArray, ...values: unknown[]) =>
  _strong(t(strings, ...values))

// ── Imperative (write to htmlBuffer) — без t ────────────────────────────────

export const Span   = (content: string, attrs?: Record<string, string>) => appendHtml(_span(content, attrs))
export const A      = (content: string, attrs?: Record<string, string>) => appendHtml(_a(content, attrs))
export const Ul     = (...items: string[]) => appendHtml(_ul(...items))
export const Img    = (attrs: { src: string; alt: string }) => appendHtml(img(attrs))
export const Hr     = () => appendHtml(hr())

// ── Scene slot ───────────────────────────────────────────────────────────────

export const Slot = (id: string): void => appendHtml(`<div data-slot="${id}"></div>`)

// ── Audio tag functions ───────────────────────────────────────────────────────

export const PlayMusic = (src: string): void => setAudioIntent(src)
export const Sound     = (src: string): void => playSound(src)

export { _span as span, _a as a, _li as li, _ul as ul }
