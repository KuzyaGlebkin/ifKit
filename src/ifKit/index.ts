export type { GameConfig, SceneFn, Scenes, SceneContext, StaticContext, WatchConfig, Locales } from './engine'
export { defineGame } from './engine'

export type { Settings, AccentPreset } from './settings'
export { loadSettings } from './settings'

export { t, setLanguage, setLanguageOrAuto, getAvailableLanguages } from './i18n'
export { resetSeenContent } from './seen-content'

export {
  // Functional (return string)
  p, h1, h2, h3, em, strong, span, a, li, ul, img, hr, br,
  // Imperative (write to buffer)
  P, H1, H2, H3, Em, Strong, Span, A, Ul, Img, Hr,
  // Scene slot
  Slot,
  // Audio
  PlayMusic, Sound,
} from './tag-functions'
