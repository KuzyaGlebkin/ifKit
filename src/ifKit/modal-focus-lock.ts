/**
 * Focus containment for modal backdrops: optional `inert` on #controls + #content,
 * Tab wrap inside the dialog, and focus restore on release.
 */

const TABBABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'textarea:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ')

export function supportsInert(): boolean {
  return 'inert' in HTMLElement.prototype
}

function isDisplayed(el: HTMLElement): boolean {
  return el.offsetParent !== null || (el.getClientRects?.().length ?? 0) > 0
}

/** Focusables that participate in Tab inside `shell` (shadow DOM not used). */
export function getTabbableIn(shell: HTMLElement): HTMLElement[] {
  const nodes = shell.querySelectorAll<HTMLElement>(TABBABLE_SELECTOR)
  const out: HTMLElement[] = []
  nodes.forEach((el) => {
    if (!isDisplayed(el)) return
    if (el.tabIndex < 0) return
    if (el.closest('[hidden]')) return
    let p: HTMLElement | null = el
    while (p) {
      if (p.getAttribute('aria-hidden') === 'true') return
      if (p.hasAttribute('inert')) return
      if (p === shell) break
      p = p.parentElement
    }
    out.push(el)
  })
  return out
}

export type ModalFocusLock = {
  release: () => void
}

/**
 * @param shell The modal root shown to the user (typically the backdrop containing the dialog).
 * @param restoreEl Element to restore focus to on release (e.g. trigger button).
 */
export function lockModalFocus(shell: HTMLElement, restoreEl: HTMLElement | null): ModalFocusLock {
  const previous = document.activeElement as HTMLElement | null

  const controls = document.getElementById('controls') as HTMLElement | null
  const content = document.getElementById('content') as HTMLElement | null
  const appRoots: HTMLElement[] = [controls, content].filter(Boolean) as HTMLElement[]

  const releaseFns: Array<() => void> = []

  if (supportsInert()) {
    for (const root of appRoots) {
      const was = root.inert
      root.inert = true
      releaseFns.push(() => {
        root.inert = was
      })
    }
  }

  const onKeyDown = (e: KeyboardEvent): void => {
    if (e.key !== 'Tab' || shell.hasAttribute('hidden')) return
    const list = getTabbableIn(shell)
    if (list.length === 0) return
    const first = list[0]
    const last = list[list.length - 1]
    const ae = document.activeElement as HTMLElement | null
    if (!shell.contains(ae)) {
      e.preventDefault()
      first.focus()
      return
    }
    if (e.shiftKey) {
      if (ae === first) {
        e.preventDefault()
        last.focus()
      }
    } else if (ae === last) {
      e.preventDefault()
      first.focus()
    }
  }

  document.addEventListener('keydown', onKeyDown, true)
  releaseFns.push(() => document.removeEventListener('keydown', onKeyDown, true))

  let onFocusIn: ((e: FocusEvent) => void) | null = null
  if (!supportsInert()) {
    onFocusIn = (e: FocusEvent): void => {
      if (shell.hasAttribute('hidden')) return
      const t = e.target as Node | null
      if (t && shell.contains(t)) return
      const list = getTabbableIn(shell)
      if (list.length === 0) return
      e.stopImmediatePropagation()
      queueMicrotask(() => list[0]?.focus())
    }
    document.addEventListener('focusin', onFocusIn, true)
    releaseFns.push(() => {
      if (onFocusIn) document.removeEventListener('focusin', onFocusIn, true)
    })
  }

  const release = (): void => {
    for (let i = releaseFns.length - 1; i >= 0; i--) releaseFns[i]!()
    releaseFns.length = 0
    const back =
      restoreEl && document.body.contains(restoreEl)
        ? restoreEl
        : previous && document.body.contains(previous)
          ? previous
          : null
    back?.focus({ preventScroll: true })
  }

  return { release }
}
