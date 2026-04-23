import { registerScenes, initDOMRefs, runGameLoop } from './scenes'
import type { SceneFn, Scenes, SceneContext } from './scenes'
import { initSnackbar } from './snackbar'
import type { WatchConfig } from './snackbar'
import { initLayout } from './layout'
import { mergeDefaults, loadSettings, applySettings } from './settings'
import type { Settings } from './settings'
import { initSettingsModal } from './settings-modal'
import { initHistory, loadSavesStore } from './saves'
import type { SavesConfig } from './saves'
import { initSavesModal } from './saves-modal'

export type { SceneFn, Scenes, SceneContext, WatchConfig }
export type { Settings }
export type { SavesConfig }

export interface GameConfig<S, K extends string> {
  /**
   * Initial game state object. Must be a JSON-compatible data tree:
   * primitives, plain objects, arrays.
   *
   * ⚠️ Do not use `Date`, `Map`, `Set`, functions, or class instances —
   * they will be silently corrupted when the state is cloned for history
   * or saved to a slot.
   */
  state: S
  scenes: Record<K, SceneFn<S, K>>
  static?: SceneFn<S, K>
  /**
   * Declare which state keys to track and how to format change notifications.
   * A snackbar appears whenever a watched key changes after an `act` or `goto`.
   * Return `null` from a formatter to suppress the notification for that change.
   */
  watch?: WatchConfig<S>
  /**
   * Override default settings for this game. Used as the initial values on
   * first launch and as the target state when the player resets settings.
   */
  settings?: Partial<Settings>
  /**
   * Configure the save system.
   * - `slots`: number of named save slots (default: 5)
   * - `historySize`: undo/redo history depth (default: 20)
   */
  saves?: SavesConfig
}

function getOrCreate(parent: HTMLElement, id: string): HTMLElement {
  let el = document.getElementById(id)
  if (!el) {
    el = document.createElement('div')
    el.id = id
    parent.appendChild(el)
  }
  return el
}

export function defineGame<S extends object, K extends string>(
  config: GameConfig<S, K>,
): void {
  const init = () => {
    const content = document.getElementById('content')
    if (!content) {
      throw new Error('[ifKit] Элемент #content не найден в index.html')
    }

    let staticEl: HTMLElement | null = null
    if (config.static) {
      staticEl = getOrCreate(content, 'static')
      staticEl.setAttribute('role', 'complementary')
      staticEl.setAttribute('aria-label', 'Статус')
    }

    const sceneEl = getOrCreate(content, 'scene-content')
    sceneEl.setAttribute('role', 'region')
    sceneEl.setAttribute('aria-label', 'Описание сцены')

    const actsEl = getOrCreate(content, 'scene-acts')
    actsEl.setAttribute('role', 'group')
    actsEl.setAttribute('aria-label', 'Действия')

    const gotosEl = getOrCreate(content, 'scene-gotos')
    gotosEl.setAttribute('role', 'navigation')
    gotosEl.setAttribute('aria-label', 'Переходы')

    const authorDefaults = mergeDefaults(config.settings)
    const currentSettings = loadSettings(authorDefaults)
    applySettings(currentSettings)

    const slots      = config.saves?.slots       ?? 5
    const historySize = config.saves?.historySize ?? 20

    initHistory(historySize)
    loadSavesStore(slots)

    initLayout(sceneEl)
    initSnackbar(config.watch ?? {})
    initSettingsModal(authorDefaults, currentSettings)
    initSavesModal(slots)
    registerScenes(config.scenes, config.state)
    initDOMRefs(sceneEl, actsEl, gotosEl, staticEl, config.static)

    const firstKey = Object.keys(config.scenes)[0] as K
    runGameLoop(firstKey)
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init)
  } else {
    init()
  }
}
