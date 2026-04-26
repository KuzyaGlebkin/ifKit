import { registerScenes, initDOMRefs, runGameLoop } from './scenes'
import type { SceneFn, Scenes, SceneContext, StaticContext } from './scenes'
import { initSnackbar } from './snackbar'
import type { WatchConfig } from './snackbar'
import { mergeDefaults, loadSettings, applySettings } from './settings'
import type { Settings, AccentPreset } from './settings'
import { initSettingsModal } from './settings-modal'
import { initHistory, loadSavesStore } from './saves'
import type { SavesConfig } from './saves'
import { initSavesModal } from './saves-modal'
import { initAudioVolumes } from './audio'
import { initI18n } from './i18n'
import type { Locales } from './i18n'
import { initSeenContent } from './seen-content'
import { setShowUnseenHighlight } from './scenes'
import { initStorage } from '@ifkit-storage'
import { initToolbarLucideIcons } from './lucide-icons'

export type { SceneFn, Scenes, SceneContext, StaticContext, WatchConfig }
export type { Settings, AccentPreset }
export type { SavesConfig }
export type { Locales }

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
  static?: (state: S, ctx: StaticContext<S, K>) => void
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
  /**
   * Localization dictionary. Keys are language codes (e.g. `'en'`, `'ru'`),
   * values are maps from original string (with `{0}`, `{1}` placeholders) to
   * translated string. Use the `t` tagged template literal in scenes to look
   * up translations. If omitted, `t` returns the original string unchanged.
   */
  locales?: Locales
  /**
   * BCP 47 short code of the language the scene strings are written in
   * (e.g. `'ru'`, `'en'`). When provided, the engine adds this language as
   * the first option in the language switcher and ensures auto-detection from
   * `navigator.language` works correctly for that language.
   */
  sourceLanguage?: string
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
  const init = async () => {
    await initStorage()

    initToolbarLucideIcons()

    const content = document.getElementById('content')
    if (!content) {
      throw new Error('[ifKit] Элемент #content не найден в index.html')
    }

    const sceneEl = getOrCreate(content, 'scene-content')
    const actsEl = getOrCreate(content, 'scene-acts')
    const gotosEl = getOrCreate(content, 'scene-gotos')

    if (!document.getElementById('ifk-scene-focus-anchor')) {
      const anchor = document.createElement('div')
      anchor.id = 'ifk-scene-focus-anchor'
      anchor.className = 'ifk-scene-focus-anchor'
      anchor.tabIndex = -1
      content.insertBefore(anchor, sceneEl)
    }

    const authorDefaults = mergeDefaults(config.settings)
    const currentSettings = loadSettings(authorDefaults)
    applySettings(currentSettings)
    initAudioVolumes(currentSettings.musicVolume, currentSettings.soundVolume)
    const fullLocales = config.sourceLanguage
      ? { [config.sourceLanguage]: {}, ...config.locales }
      : config.locales ?? {}
    const languages = Object.keys(fullLocales)
    initI18n(fullLocales, currentSettings.language)
    initSeenContent()
    setShowUnseenHighlight(currentSettings.showUnseenHighlight)

    const slots      = config.saves?.slots       ?? 5
    const historySize = config.saves?.historySize ?? 20

    initHistory(historySize)
    loadSavesStore(slots)

    initSnackbar(config.watch ?? {})
    initSettingsModal(authorDefaults, currentSettings, languages)
    initSavesModal(slots)
    registerScenes(config.scenes, config.state)
    initDOMRefs(sceneEl, actsEl, gotosEl, config.static)

    const firstKey = Object.keys(config.scenes)[0] as K
    runGameLoop(firstKey)
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => { void init() })
  } else {
    void init()
  }
}
