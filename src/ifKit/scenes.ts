import {
  clearBuffers,
  flushComposedToDOM,
  flushActsToDOM,
  flushGotosToDOM,
  addAct,
  addGoto,
  setActiveBuffer,
  restoreActiveBuffer,
} from './renderer'
import {
  getSceneLocal,
  clearSceneLocal,
  clearAllSceneLocals,
  jsonClone,
  getSceneLocalSnapshot,
  restoreSceneLocal,
} from './state'
import { snapshotWatched, diffAndNotify, showSnackbar } from './snackbar'
import {
  historyPush,
  historyUndo,
  historyRedo,
  canUndo,
  canRedo,
  autoSave,
  initHistory,
} from './saves'
import type { Snapshot } from './saves'
import { clearAudioIntent, resolveAudioIntent } from './audio'
import { markAndHighlight } from './seen-content'
import { t } from './i18n'

export type SceneContext<S, K extends string> = {
  act: (strings: TemplateStringsArray, ...values: unknown[]) => (cb: (s: S) => void) => void
  goto: (key: K) => (strings: TemplateStringsArray, ...values: unknown[]) => void
  local: <T extends object>(defaults: T) => T
}

export type StaticContext<S, K extends string> = SceneContext<S, K> & {
  before: (cb: () => void) => void
  after: (cb: () => void) => void
  slot: (id: string, cb: () => void) => void
}

export type SceneFn<S, K extends string = string> = (state: S, ctx: SceneContext<S, K>) => void

export type Scenes<S> = Record<string, SceneFn<S, any>>

let registeredScenes: Record<string, SceneFn<any, any>> = {}
let currentState: unknown = null
let currentSceneKey = ''
let _showUnseenHighlight = true

export function setShowUnseenHighlight(enabled: boolean): void {
  _showUnseenHighlight = enabled
}

let _exitSessionMenu: () => void = () => {}

export function setSessionMenuExit(fn: () => void): void {
  _exitSessionMenu = fn
}

let _sceneEl: HTMLElement | null = null
let _actsEl: HTMLElement | null = null
let _gotosEl: HTMLElement | null = null
let _staticFn: ((state: any, ctx: StaticContext<any, any>) => void) | undefined

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
  staticFn?: (state: any, ctx: StaticContext<any, any>) => void,
): void {
  _sceneEl = sceneEl
  _actsEl = actsEl
  _gotosEl = gotosEl
  _staticFn = staticFn

  document.getElementById('btn-undo')?.addEventListener('click', () => {
    if (!canUndo()) return
    const snap = historyUndo()
    if (snap) restoreGameState(snap)
  })

  document.getElementById('btn-redo')?.addEventListener('click', () => {
    if (!canRedo()) return
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

/** Reset to author's initial state, clear locals and history (session menu «Новая игра»). */
export function resetGameToInitial(initialState: unknown, historySize: number): void {
  currentState       = jsonClone(initialState)
  currentSceneKey    = ''
  clearAllSceneLocals()
  initHistory(historySize)
}

/** Restores game state from a snapshot and re-renders the scene. */
export function restoreGameState(snapshot: Snapshot): void {
  _exitSessionMenu()
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
    act(strings, ...values) {
      const label = t(strings, ...values)
      return cb => {
        addAct(label, () => {
          historyPush(getCurrentSnapshot())
          const before = snapshotWatched(state)
          cb(state)
          const msgs = diffAndNotify(state, before)
          rerender()
          showSnackbar(msgs)
        })
      }
    },
    goto(key) {
      return (strings, ...values) => {
        const label = t(strings, ...values)
        addGoto(label, () => {
          historyPush(getCurrentSnapshot())
          const before = snapshotWatched(state)
          const msgs = diffAndNotify(state, before)
          autoSave(String(key), currentState)
          runGameLoop(String(key))
          showSnackbar(msgs)
        })
      }
    },
    local<T extends object>(defaults: T): T {
      return getSceneLocal(currentSceneKey, defaults)
    },
  }
}

function createStaticContext<S extends object, K extends string>(state: S): StaticContext<S, K> {
  const base = createContext<S, K>(state)
  return {
    ...base,
    before(cb) {
      setActiveBuffer('before')
      cb()
      restoreActiveBuffer()
    },
    after(cb) {
      setActiveBuffer('after')
      cb()
      restoreActiveBuffer()
    },
    slot(id, cb) {
      setActiveBuffer(id)
      cb()
      restoreActiveBuffer()
    },
  }
}

export function rerender(): void {
  void runGameLoop(currentSceneKey)
}

/**
 * Re-run the current scene so game text and seen marks match settings / locale.
 * While the session main menu is visible (`ifk-session-menu-active`), background
 * music SHALL NOT start (see {@link runGameLoop}).
 */
export function rerenderForSettingsOrI18n(): void {
  rerender()
}

function updateUndoRedoButtons(): void {
  const undoBtn = document.getElementById('btn-undo') as HTMLButtonElement | null
  const redoBtn = document.getElementById('btn-redo') as HTMLButtonElement | null
  const canU = canUndo()
  const canR = canRedo()
  if (undoBtn) {
    undoBtn.setAttribute('aria-disabled', canU ? 'false' : 'true')
    undoBtn.classList.toggle('ifk-history-disabled', !canU)
  }
  if (redoBtn) {
    redoBtn.setAttribute('aria-disabled', canR ? 'false' : 'true')
    redoBtn.classList.toggle('ifk-history-disabled', !canR)
  }
}

export async function runGameLoop(sceneKey: string): Promise<void> {
  if (!registeredScenes[sceneKey]) {
    throw new Error(`[ifKit] Сцена не найдена: "${sceneKey}". Доступные: ${Object.keys(registeredScenes).join(', ')}`)
  }
  if (!_sceneEl || !_actsEl || !_gotosEl) {
    throw new Error('[ifKit] DOM-элементы не инициализированы. Вызови defineGame() первым.')
  }

  const prevSceneKey = currentSceneKey

  if (currentSceneKey && currentSceneKey !== sceneKey) {
    clearSceneLocal(currentSceneKey)
  }

  currentSceneKey = sceneKey
  const state = currentState as object
  const ctx = createContext(state)

  clearBuffers()
  clearAudioIntent()

  try {
    registeredScenes[sceneKey](state, ctx)
  } catch (err) {
    clearBuffers()
    throw err
  }

  if (_staticFn) {
    const staticCtx = createStaticContext(state)
    _staticFn(state, staticCtx)
  }

  flushComposedToDOM(_sceneEl)
  markAndHighlight(_sceneEl, currentSceneKey, _showUnseenHighlight)
  flushActsToDOM(_actsEl)
  flushGotosToDOM(_gotosEl)
  updateUndoRedoButtons()
  // Session menu cleared music via stopMusicPlaybackForMenu; re-running the scene
  // for locale/seen would otherwise set PlayMusic intent again.
  if (document.documentElement.classList.contains('ifk-session-menu-active')) {
    clearAudioIntent()
  }
  await resolveAudioIntent()

  if (prevSceneKey !== sceneKey) {
    document.getElementById('ifk-scene-focus-anchor')?.focus({ preventScroll: true })
  }
}
