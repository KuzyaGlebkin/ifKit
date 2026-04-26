import { defineGame, H2, P, t } from './ifKit'
import { scenes } from './scenes'
import { initialState } from './state'
import type { GameState } from './state'

defineGame({
  sourceLanguage: 'ru',
  state: initialState,
  static: (state: GameState, { before }) => {
    before(() => {
      H2(t`Персонаж`)
      P(t`HP: ${state.hp} | Золото: ${state.gold}`)
    })
  },
  scenes,
  locales: {
    en: {
      'Персонаж':                                   'Character',
      'HP: {0} | Золото: {1}':                      'HP: {0} | Gold: {1}',
      'Лес':                                        'Forest',
      'Ты стоишь на опушке. Вокруг {0} тишина.':   'You stand at the forest edge. {0} silence all around.',
      'мёртвая':                                    'Dead',
      'Поднять ветку':                              'Pick up a branch',
      'Пойти на поляну':                            'Go to the clearing',
      'Поляна':                                     'Clearing',
      'На поляне тихо.':                            'The clearing is quiet.',
      'В руке у тебя {0}.':                        'You hold {0} in your hand.',
      'ветка':                                      'a branch',
      'Вернуться в лес':                            'Return to the forest',
    },
  },
})
