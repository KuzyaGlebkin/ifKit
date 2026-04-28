import { defineGame, H2, P, t } from './ifKit'
import { scenes } from './scenes'
import { initialState } from './state'
import type { GameState } from './state'
import enUi from './locales/en.ui.json'
import byUi from './locales/by.ui.json'
import enGame from './locales/en.game.json'
import byGame from './locales/by.game.json'

defineGame({
  sourceLanguage: 'ru',
  meta: {
    title:       'Образцовая игра ifKit',
    description: 'Короткое описание для главного меню сессии — настройки и загрузка доступны до начала сцены.',
  },
  state: initialState,
  // Snackbar: уведомления при изменении полей после act/goto (см. `snackbar.ts`, `scenes.ts`).
  watch: {
    hp: (prev, next) => (prev !== next ? t`ОЗ: ${prev} → ${next}` : null),
    gold: (prev, next) => (prev !== next ? t`Золото: ${prev} → ${next}` : null),
    hasBranch: (prev, next) => (!prev && next ? t`Стало: есть ветка` : null),
  },
  static: (state: GameState, { before }) => {
    before(() => {
      H2`Персонаж`
      P`HP: ${state.hp} | Золото: ${state.gold}`
    })
  },
  scenes,
  locales: {
    en: { game: enGame, ui: enUi },
    by: { game: byGame, ui: byUi },
  },
})
