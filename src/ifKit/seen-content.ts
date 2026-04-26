import { storage, KEYS } from '@ifkit-storage'

type SeenMap = Record<string, string[]>

let _seen: SeenMap = {}

export function initSeenContent(): void {
  const raw = storage.get<SeenMap>(KEYS.seen)
  _seen = raw ?? {}
}

function hashString(s: string): string {
  let h = 0
  for (let i = 0; i < s.length; i++) {
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0
  }
  return h.toString(36)
}

export function markAndHighlight(
  element: HTMLElement,
  sceneKey: string,
  enabled: boolean,
): void {
  if (!enabled) return

  const seenSet = new Set(_seen[sceneKey] ?? [])
  let changed = false

  for (const child of Array.from(element.children) as HTMLElement[]) {
    const hash = hashString(child.innerHTML)
    if (!seenSet.has(hash)) {
      child.classList.add('paragraph--unseen')
      seenSet.add(hash)
      changed = true
    }
  }

  if (changed) {
    _seen[sceneKey] = Array.from(seenSet)
    storage.set(KEYS.seen, _seen)
  }
}

export function resetSeenContent(): void {
  _seen = {}
  storage.remove(KEYS.seen)
}
