const FOCUSABLE = 'button:not([disabled]), a[href], input:not([disabled]), [tabindex]'

export function firstFocusable(el: HTMLElement): HTMLElement | null {
  return el.querySelector<HTMLElement>(FOCUSABLE)
}

export function initLayout(sceneEl: HTMLElement): void {
  sceneEl.tabIndex = -1
}

export function focusAfterRender(
  staticEl: HTMLElement | null,
  sceneEl: HTMLElement,
  actsEl: HTMLElement,
  gotosEl: HTMLElement,
): void {
  if (staticEl) {
    const target = firstFocusable(staticEl) ?? staticEl
    target.focus()
    return
  }

  if (sceneEl.innerHTML.trim() !== '') {
    sceneEl.focus()
    return
  }

  const firstBtn =
    actsEl.querySelector<HTMLElement>('button') ??
    gotosEl.querySelector<HTMLElement>('button')

  firstBtn?.focus()
}
