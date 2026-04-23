import { appendHtml } from './renderer'

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

// ── Functional (return string) ────────────────────────────────────────────────

export const p      = (content: string, attrs?: Record<string, string>) => buildTag('p', content, attrs)
export const h1     = (content: string, attrs?: Record<string, string>) => buildTag('h1', content, attrs)
export const h2     = (content: string, attrs?: Record<string, string>) => buildTag('h2', content, attrs)
export const h3     = (content: string, attrs?: Record<string, string>) => buildTag('h3', content, attrs)
export const em     = (content: string, attrs?: Record<string, string>) => buildTag('em', content, attrs)
export const strong = (content: string, attrs?: Record<string, string>) => buildTag('strong', content, attrs)
export const span   = (content: string, attrs?: Record<string, string>) => buildTag('span', content, attrs)
export const a      = (content: string, attrs?: Record<string, string>) => buildTag('a', content, attrs)
export const li     = (content: string) => buildTag('li', content)
export const ul     = (...items: string[]) => buildTag('ul', items.join(''))

export const img = (attrs: { src: string; alt?: string }): string =>
  buildTag('img', undefined, { src: attrs.src, ...(attrs.alt !== undefined ? { alt: attrs.alt } : {}) })
export const hr  = (): string => buildTag('hr')
export const br  = (): string => buildTag('br')

// ── Imperative (write to htmlBuffer) ─────────────────────────────────────────

export const P      = (content: string, attrs?: Record<string, string>) => appendHtml(p(content, attrs))
export const H1     = (content: string, attrs?: Record<string, string>) => appendHtml(h1(content, attrs))
export const H2     = (content: string, attrs?: Record<string, string>) => appendHtml(h2(content, attrs))
export const H3     = (content: string, attrs?: Record<string, string>) => appendHtml(h3(content, attrs))
export const Em     = (content: string, attrs?: Record<string, string>) => appendHtml(em(content, attrs))
export const Strong = (content: string, attrs?: Record<string, string>) => appendHtml(strong(content, attrs))
export const Span   = (content: string, attrs?: Record<string, string>) => appendHtml(span(content, attrs))
export const A      = (content: string, attrs?: Record<string, string>) => appendHtml(a(content, attrs))
export const Ul     = (...items: string[]) => appendHtml(ul(...items))
export const Img    = (attrs: { src: string; alt?: string }) => appendHtml(img(attrs))
export const Hr     = () => appendHtml(hr())
