export type ActionDef = { label: string; handler: () => void }

let htmlBuffer = ''
let beforeBuffer = ''
let afterBuffer = ''
let slotBuffers: Record<string, string> = {}
const actBuffer: ActionDef[] = []
const gotoBuffer: ActionDef[] = []

type Target = 'scene' | 'before' | 'after' | string
const targetStack: Target[] = []
let activeTarget: Target = 'scene'

export function clearBuffers(): void {
  htmlBuffer = ''
  beforeBuffer = ''
  afterBuffer = ''
  slotBuffers = {}
  actBuffer.length = 0
  gotoBuffer.length = 0
  activeTarget = 'scene'
  targetStack.length = 0
}

export function getHtmlBuffer(): string {
  return htmlBuffer
}

export function appendHtml(html: string): void {
  if (activeTarget === 'scene') {
    htmlBuffer += html
  } else if (activeTarget === 'before') {
    beforeBuffer += html
  } else if (activeTarget === 'after') {
    afterBuffer += html
  } else {
    slotBuffers[activeTarget] = (slotBuffers[activeTarget] ?? '') + html
  }
}

export function setActiveBuffer(target: Target): void {
  targetStack.push(activeTarget)
  activeTarget = target
}

export function restoreActiveBuffer(): void {
  activeTarget = targetStack.pop() ?? 'scene'
}

export function composeScene(): string {
  const scene = htmlBuffer.replace(
    /<div data-slot="([^"]+)"><\/div>/g,
    (_, id: string) => slotBuffers[id] ?? '',
  )
  return beforeBuffer + scene + afterBuffer
}

export function addAct(label: string, handler: () => void): void {
  actBuffer.push({ label, handler })
}

export function addGoto(label: string, handler: () => void): void {
  gotoBuffer.push({ label, handler })
}

export function flushComposedToDOM(element: HTMLElement): void {
  element.innerHTML = composeScene()
}

export function flushActsToDOM(element: HTMLElement): void {
  element.innerHTML = ''
  for (const { label, handler } of actBuffer) {
    const btn = document.createElement('button')
    btn.type = 'button'
    btn.className = 'btn-act'
    btn.textContent = label
    btn.addEventListener('click', handler)
    element.appendChild(btn)
  }
  actBuffer.length = 0
}

export function flushGotosToDOM(element: HTMLElement): void {
  element.innerHTML = ''
  for (const { label, handler } of gotoBuffer) {
    const a = document.createElement('a')
    a.href = '#'
    a.className = 'btn-goto'
    a.textContent = label
    a.addEventListener('click', (e) => {
      e.preventDefault()
      handler()
    })
    a.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key !== ' ' && e.key !== 'Spacebar') return
      if (e.repeat) return
      e.preventDefault()
      handler()
    })
    element.appendChild(a)
  }
  gotoBuffer.length = 0
}
