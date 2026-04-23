import {
  clearBuffers,
  flushHtmlToDOM,
  flushActsToDOM,
  flushGotosToDOM,
  addAct,
  addGoto,
} from './renderer'
import {
  getSceneLocal,
  clearSceneLocal,
  jsonClone,
  getSceneLocalSnapshot,
  restoreSceneLocal,
} from './state'
import { snapshotWatched, diffAndNotify, showSnackbar } from './snackbar'
import { focusAfterRender } from './layout'
import {
  historyPush,
  historyUndo,
  historyRedo,
  canUndo,
  canRedo,
  autoSave,
} from './saves'
import type { Snapshot } from './saves'

export type SceneContext<S, K extends string> = {
  act: (label: string, cb: (s: S) => void) => void
  goto: (key: K, label: string, cb?: (s: S) => void) => void
  local: <T extends object>(defaults: T) => T
}

export type SceneFn<S, K extends string = string> = (state: S, ctx: SceneContext<S, K>) => void

export type Scenes<S> = Record<string, SceneFn<S, any>>

let registeredScenes: Record<string, SceneFn<any, any>> = {}
let currentState: unknown = null
let currentSceneKey = ''

let _sceneEl: HTMLElement | null = null
let _actsEl: HTMLElement | null = null
let _gotosEl: HTMLElement | null = null
let _staticEl: HTMLElement | null = null
let _staticFn: SceneFn<any, any> | undefined

export function registerScenes<S, K extends string>(
  scenes: Record<K, SceneFn<S, K>>,
  state: S,
): void {
  registeredScenes = scenes as Record<string, SceneFn<any, any>>
  currentState = state
}

export function initDOMRefs(
  sceneEl: HTMLElement,
  actsEl: HTMLElement,
  gotosEl: HTMLElement,
  staticEl: HTMLElement | null,
  staticFn?: SceneFn<any, any>,
): void {
  _sceneEl = sceneEl
  _actsEl = actsEl
  _gotosEl = gotosEl
  _staticEl = staticEl
  _staticFn = staticFn

  document.getElementById('btn-undo')?.addEventListener('click', () => {
    const snap = historyUndo()
    if (snap) restoreGameState(snap)
  })

  document.getElementById('btn-redo')?.addEventListener('click', () => {
    const snap = historyRedo()
    if (snap) restoreGameState(snap)
  })
}

/** Returns a deep-cloned snapshot of the current game state. */
export function getCurrentSnapshot(): Snapshot {
  const locals = getSceneLocalSnapshot(currentSceneKey)
  return {
    sceneKey:    currentSceneKey,
    state:       jsonClone(currentState),
    sceneLocals: locals !== null ? { [currentSceneKey]: locals } : null,
  }
}

/** Restores game state from a snapshot and re-renders the scene. */
export function restoreGameState(snapshot: Snapshot): void {
  currentState = jsonClone(snapshot.state)
  if (snapshot.sceneLocals) {
    for (const [key, locals] of Object.entries(snapshot.sceneLocals)) {
      restoreSceneLocal(key, locals)
    }
  }
  runGameLoop(snapshot.sceneKey)
}

function createContext<S extends object, K extends string>(state: S): SceneContext<S, K> {
  return {
    act(label, cb) {
      addAct(label, () => {
        historyPush(getCurrentSnapshot())
        const before = snapshotWatched(state)
        cb(state)
        const msgs = diffAndNotify(state, before)
        rerender()
        showSnackbar(msgs)
      })
    },
    goto(key, label, cb) {
      addGoto(label, () => {
        historyPush(getCurrentSnapshot())
        const before = snapshotWatched(state)
        if (cb) cb(state)
        const msgs = diffAndNotify(state, before)
        autoSave(String(key), currentState)
        runGameLoop(String(key))
        showSnackbar(msgs)
      })
    },
    local<T extends object>(defaults: T): T {
      return getSceneLocal(currentSceneKey, defaults)
    },
  }
}

function rerender(): void {
  runGameLoop(currentSceneKey)
}

function updateUndoRedoButtons(): void {
  const undoBtn = document.getElementById('btn-undo') as HTMLButtonElement | null
  const redoBtn = document.getElementById('btn-redo') as HTMLButtonElement | null
  if (undoBtn) undoBtn.disabled = !canUndo()
  if (redoBtn) redoBtn.disabled = !canRedo()
}

export function runGameLoop(sceneKey: string): void {
  if (!registeredScenes[sceneKey]) {
    throw new Error(`[ifKit] Сцена не найдена: "${sceneKey}". Доступные: ${Object.keys(registeredScenes).join(', ')}`)
  }
  if (!_sceneEl || !_actsEl || !_gotosEl) {
    throw new Error('[ifKit] DOM-элементы не инициализированы. Вызови defineGame() первым.')
  }

  if (currentSceneKey && currentSceneKey !== sceneKey) {
    clearSceneLocal(currentSceneKey)
  }

  currentSceneKey = sceneKey
  const state = currentState as object
  const ctx = createContext(state)

  clearBuffers()

  if (_staticFn && _staticEl) {
    _staticFn(state, ctx)
    flushHtmlToDOM(_staticEl)
  }

  try {
    registeredScenes[sceneKey](state, ctx)
  } catch (err) {
    clearBuffers()
    throw err
  }

  flushHtmlToDOM(_sceneEl)
  flushActsToDOM(_actsEl)
  flushGotosToDOM(_gotosEl)
  focusAfterRender(_staticEl, _sceneEl, _actsEl, _gotosEl)
  updateUndoRedoButtons()
}
