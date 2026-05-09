import { storage, KEYS } from '@ifkit-storage'

type SeenContentStore = {
  scenes: Record<string, string[]>
  staticSeen: string[]
}

let _store: SeenContentStore = { scenes: {}, staticSeen: [] }

function isSeenStoreCandidate(o: Record<string, unknown>): o is SeenContentStore & { scenes: Record<string, unknown> } {
  const scenesVal = o.scenes
  if (!scenesVal || typeof scenesVal !== 'object' || Array.isArray(scenesVal)) return false
  const scenesRecord = scenesVal as Record<string, unknown>
  for (const v of Object.values(scenesRecord)) {
    if (!Array.isArray(v)) return false
    for (const x of v) {
      if (typeof x !== 'string') return false
    }
  }
  const ss = o.staticSeen
  if (ss === undefined) return true
  return Array.isArray(ss) && ss.every(x => typeof x === 'string')
}

export function initSeenContent(): void {
  const raw = storage.get<unknown>(KEYS.seen)
  try {
    if (!raw || typeof raw !== 'object') {
      _store = { scenes: {}, staticSeen: [] }
      return
    }
    const root = raw as Record<string, unknown>
    if (!isSeenStoreCandidate(root)) {
      _store = { scenes: {}, staticSeen: [] }
      return
    }
    const scenesEntry: Record<string, string[]> = {}
    for (const [k, v] of Object.entries(root.scenes as Record<string, unknown>)) {
      scenesEntry[k] = [...(v as string[])]
    }
    _store = {
      scenes: scenesEntry,
      staticSeen: root.staticSeen === undefined ? [] : [...(root.staticSeen as string[])],
    }
  } catch {
    _store = { scenes: {}, staticSeen: [] }
  }
}

function hashString(s: string): string {
  let h = 0
  for (let i = 0; i < s.length; i++) {
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0
  }
  return h.toString(36)
}

function isSeenScopeMarker(el: HTMLElement): boolean {
  const v = el.getAttribute('data-ifk-seen-scope')
  return v === 'static' || v === 'scene'
}

function processLeafBlocks(region: HTMLElement, seenSet: Set<string>): boolean {
  let changed = false
  for (const el of Array.from(region.children) as HTMLElement[]) {
    const hash = hashString(el.innerHTML)
    if (!seenSet.has(hash)) {
      el.classList.add('paragraph--unseen')
      seenSet.add(hash)
      changed = true
    }
  }
  return changed
}

export function markAndHighlight(
  element: HTMLElement,
  sceneKey: string,
  enabled: boolean,
): void {
  if (!enabled) return

  let dirty = false
  const sceneSet = new Set(_store.scenes[sceneKey] ?? [])
  const staticSet = new Set(_store.staticSeen)

  const tops = Array.from(element.children) as HTMLElement[]
  const fragmented = tops.some(isSeenScopeMarker)

  if (!fragmented) {
    dirty = processLeafBlocks(element, sceneSet)
    if (dirty) {
      _store.scenes[sceneKey] = Array.from(sceneSet)
      storage.set(KEYS.seen, _store)
    }
    return
  }

  let touchedStatic = false
  let processedSceneWrap = false
  for (const child of tops) {
    const scope = child.getAttribute('data-ifk-seen-scope')
    if (scope === 'static') {
      dirty = processLeafBlocks(child, staticSet) || dirty
      touchedStatic = true
    } else if (scope === 'scene') {
      dirty = processLeafBlocks(child, sceneSet) || dirty
      processedSceneWrap = true
    }
  }
  if (touchedStatic) _store.staticSeen = Array.from(staticSet)
  if (processedSceneWrap) _store.scenes[sceneKey] = Array.from(sceneSet)
  if (dirty) storage.set(KEYS.seen, _store)
}

export function resetSeenContent(): void {
  _store = { scenes: {}, staticSeen: [] }
  storage.remove(KEYS.seen)
}
