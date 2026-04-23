export type { GameConfig, SceneFn, Scenes, SceneContext, WatchConfig } from './engine'
export { defineGame } from './engine'

export type { Settings } from './settings'
export { loadSettings } from './settings'

export {
  // Functional (return string)
  p, h1, h2, h3, em, strong, span, a, li, ul, img, hr, br,
  // Imperative (write to buffer)
  P, H1, H2, H3, Em, Strong, Span, A, Ul, Img, Hr,
} from './tag-functions'
