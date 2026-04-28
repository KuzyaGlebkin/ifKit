export type {
  GameConfig,
  GameMeta,
  SceneFn,
  Scenes,
  SceneContext,
  StaticContext,
  WatchConfig,
  Locales,
  LocalesInput,
  LocaleBundle,
} from './engine'
export { defineGame } from './engine'

export type { Settings, AccentPreset } from './settings'
export { loadSettings } from './settings'

export { t, u, setLanguage, setLanguageOrAuto, getAvailableLanguages, getLocaleForFormatting, getResolvedLanguage } from './i18n'
export type { UiKey } from './ui-keys'
export { UI } from './ui-keys'
export { resetSeenContent } from './seen-content'

export {
  P, H1, H2, H3, Phtml, em, strong,
  span, a, li, ul, img, hr, br,
  Span, A, Ul, Img, Hr,
  Slot,
  PlayMusic, Sound,
} from './tag-functions'
