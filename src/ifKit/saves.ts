// Save slots and history — Этап 5

import { storage, KEYS } from '@ifkit-storage'
import { jsonClone } from './state'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Snapshot {
  sceneKey:    string
  state:       unknown
  sceneLocals: Record<string, Record<string, unknown>> | null
}

export interface SaveSlot extends Snapshot {
  id:      string   // 'auto' | 'slot-0' | 'slot-1' | ...
  savedAt: string   // ISO timestamp
  label:   string   // textContent[:80] from #scene-content (empty for 'auto')
}

export interface SavesStore {
  auto:  SaveSlot | null
  slots: Array<SaveSlot | null>
}

export interface SavesConfig {
  slots?:       number  // default 5
  historySize?: number  // default 20
}

const DEFAULT_SLOTS        = 5
const DEFAULT_HISTORY_SIZE = 20

// ─── History Ring Buffer ──────────────────────────────────────────────────────
//
// Uses absolute positions (latestPos / currentPos) mapped via modulo into
// a fixed-size circular array, so no element shifting is ever needed.
//
// Invariants:
//   oldestPos = max(0, latestPos - maxSize + 1)
//   canUndo   = currentPos >= 0 && currentPos >= oldestPos
//   canRedo   = currentPos < latestPos

class HistoryBuffer {
  private buf:        Array<Snapshot | null>
  private latestPos:  number = -1  // absolute idx of most recent entry
  private currentPos: number = -1  // absolute idx of undo/redo cursor
  readonly maxSize:   number

  constructor(maxSize: number) {
    this.maxSize = maxSize
    this.buf     = new Array<Snapshot | null>(maxSize).fill(null)
  }

  private get oldestPos(): number {
    return Math.max(0, this.latestPos - this.maxSize + 1)
  }

  /** Add snapshot; truncates any redo entries above currentPos. */
  push(snapshot: Snapshot): void {
    this.latestPos                        = this.currentPos + 1
    this.buf[this.latestPos % this.maxSize] = snapshot
    this.currentPos                       = this.latestPos
  }

  /** Return snapshot to restore and retreat the cursor. */
  undo(): Snapshot | null {
    if (!this.canUndo()) return null
    const snap = this.buf[this.currentPos % this.maxSize]!
    this.currentPos--
    return snap
  }

  /** Advance the cursor and return the snapshot to restore. */
  redo(): Snapshot | null {
    if (!this.canRedo()) return null
    this.currentPos++
    return this.buf[this.currentPos % this.maxSize]!
  }

  canUndo(): boolean {
    return this.currentPos >= 0 && this.currentPos >= this.oldestPos
  }

  canRedo(): boolean {
    return this.currentPos < this.latestPos
  }
}

let _history: HistoryBuffer = new HistoryBuffer(DEFAULT_HISTORY_SIZE)

export function initHistory(historySize: number = DEFAULT_HISTORY_SIZE): void {
  _history = new HistoryBuffer(historySize)
}

export function historyPush(snapshot: Snapshot): void {
  _history.push(snapshot)
}

export function historyUndo(): Snapshot | null {
  return _history.undo()
}

export function historyRedo(): Snapshot | null {
  return _history.redo()
}

export function canUndo(): boolean {
  return _history.canUndo()
}

export function canRedo(): boolean {
  return _history.canRedo()
}

// ─── Saves Store ──────────────────────────────────────────────────────────────

let _store: SavesStore | null = null

export function loadSavesStore(slots: number = DEFAULT_SLOTS): SavesStore {
  if (_store) return _store

  const raw = storage.get<SavesStore>(KEYS.saves)
  if (raw && Array.isArray(raw.slots)) {
    const normalized = raw.slots.slice(0, slots)
    while (normalized.length < slots) normalized.push(null)
    _store = { auto: raw.auto ?? null, slots: normalized }
  } else {
    _store = { auto: null, slots: new Array<SaveSlot | null>(slots).fill(null) }
  }

  return _store
}

function persistSavesStore(store: SavesStore): void {
  storage.set(KEYS.saves, store)
}

export function getSavesStore(): SavesStore {
  return _store ?? loadSavesStore()
}

export function autoSave(sceneKey: string, state: unknown): void {
  const store = getSavesStore()
  store.auto  = {
    id:          'auto',
    savedAt:     new Date().toISOString(),
    label:       '',
    sceneKey,
    state:       jsonClone(state),
    sceneLocals: null,
  }
  persistSavesStore(store)
}

export function saveToSlot(
  index:       number,
  sceneKey:    string,
  state:       unknown,
  sceneLocals: Record<string, Record<string, unknown>> | null,
): void {
  const store = getSavesStore()
  if (index < 0 || index >= store.slots.length) return

  const raw   = document.getElementById('scene-content')?.textContent ?? ''
  const label = raw.trim().slice(0, 80)

  store.slots[index] = {
    id:      `slot-${index}`,
    savedAt: new Date().toISOString(),
    label,
    sceneKey,
    state:       jsonClone(state),
    sceneLocals: sceneLocals ? jsonClone(sceneLocals) : null,
  }
  persistSavesStore(store)
}

export function deleteSlot(index: number): void {
  const store = getSavesStore()
  if (index < 0 || index >= store.slots.length) return
  store.slots[index] = null
  persistSavesStore(store)
}
