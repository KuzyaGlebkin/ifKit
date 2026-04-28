import { registerScenes, initDOMRefs } from './scenes'
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
import {
  initI18n,
  normalizeLocalesInput,
  mergeAuthorLocalesWithTemplate,
  setLocaleChangeHandler,
  type LocalesInput,
} from './i18n'
import { LOCALE_TEMPLATE_GAME, LOCALE_TEMPLATE_UI } from './locale-templates'
import { initSeenContent } from './seen-content'
import { setShowUnseenHighlight } from './scenes'
import { initStorage } from '@ifkit-storage'
import { initToolbarLucideIcons } from './lucide-icons'
import { refreshToolbarI18n } from './chrome-i18n'
import { refreshSettingsModalI18n } from './settings-modal'
import { refreshSavesModalChrome } from './saves-modal'
import { initSessionMainMenu, refreshSessionMainMenuChrome } from './session-main-menu'

export type { SceneFn, Scenes, SceneContext, StaticContext, WatchConfig }
export type { Settings, AccentPreset }
export type { SavesConfig }
export type { Locales, LocalesInput, LocaleBundle } from './i18n'

/** Optional title and tagline shown on the session start menu. */
export interface GameMeta {
  title:        string
  description?: string
}

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
  /**
   * Per-language game strings (`t`) and optional `ui` for engine chrome, or
   * legacy flat map of game strings only.
   */
  locales?: LocalesInput
  /**
   * BCP 47 short code of the language the scene strings are written in
   * (e.g. `'ru'`, `'en'`). When provided, the engine adds this language as
   * the first option in the language switcher and ensures auto-detection from
   * `navigator.language` works correctly for that language.
   */
  sourceLanguage?: string
  /** Title and optional tagline on the session start menu. */
  meta?: GameMeta
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
    setLocaleChangeHandler(() => {
      refreshToolbarI18n()
      refreshSettingsModalI18n()
      refreshSavesModalChrome()
      refreshSessionMainMenuChrome()
    })
    const fullRaw: LocalesInput = config.sourceLanguage
      ? { [config.sourceLanguage]: {}, ...((config.locales ?? {}) as LocalesInput) }
      : ((config.locales ?? {}) as LocalesInput)
    const mergedRaw = mergeAuthorLocalesWithTemplate(
      fullRaw,
      LOCALE_TEMPLATE_GAME,
      LOCALE_TEMPLATE_UI,
    )
    const { game: gameLocales, ui: uiByLang } = normalizeLocalesInput(
      mergedRaw,
      config.sourceLanguage,
    )
    const languages = Object.keys(gameLocales)
    initI18n(gameLocales, uiByLang, currentSettings.language, config.sourceLanguage)
    applySettings(currentSettings)
    initAudioVolumes(
      currentSettings.musicVolume,
      currentSettings.soundVolume,
      currentSettings.musicMuted,
      currentSettings.soundMuted,
      currentSettings.quietMusicForScreenReader,
    )
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
    const docTitle = typeof document !== 'undefined' ? document.title.trim() : ''
    const meta     = config.meta
    initSessionMainMenu({
      title:        (meta?.title?.trim()) || docTitle || 'ifKit',
      description:  meta?.description?.trim() ?? '',
      firstKey:     String(firstKey),
      initialState: config.state,
      historySize,
    })
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => { void init() })
  } else {
    void init()
  }
}
