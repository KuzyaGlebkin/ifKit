export type ActionDef = { label: string; handler: () => void }

let htmlBuffer = ''
const actBuffer: ActionDef[] = []
const gotoBuffer: ActionDef[] = []

export function clearBuffers(): void {
  htmlBuffer = ''
  actBuffer.length = 0
  gotoBuffer.length = 0
}

export function getHtmlBuffer(): string {
  return htmlBuffer
}

export function appendHtml(html: string): void {
  htmlBuffer += html
}

export function addAct(label: string, handler: () => void): void {
  actBuffer.push({ label, handler })
}

export function addGoto(label: string, handler: () => void): void {
  gotoBuffer.push({ label, handler })
}

export function flushHtmlToDOM(element: HTMLElement): void {
  element.innerHTML = htmlBuffer
  htmlBuffer = ''
}

export function flushActsToDOM(element: HTMLElement): void {
  element.innerHTML = ''
  for (const { label, handler } of actBuffer) {
    const btn = document.createElement('button')
    btn.type = 'button'
    btn.className = 'btn-act'
    btn.setAttribute('aria-label', `Act: ${label}`)
    btn.textContent = label
    btn.addEventListener('click', handler)
    element.appendChild(btn)
  }
  actBuffer.length = 0
}

export function flushGotosToDOM(element: HTMLElement): void {
  element.innerHTML = ''
  for (const { label, handler } of gotoBuffer) {
    const btn = document.createElement('button')
    btn.type = 'button'
    btn.className = 'btn-goto'
    btn.setAttribute('aria-label', `Go to: ${label}`)
    btn.textContent = label
    btn.addEventListener('click', handler)
    element.appendChild(btn)
  }
  gotoBuffer.length = 0
}
