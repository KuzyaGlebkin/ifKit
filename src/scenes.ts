import { H1, P, em, strong } from './ifKit'
import type { GameState } from './state'
import type { SceneContext } from './ifKit'

type K = 'start' | 'clearing'

export const scenes = {
  start: (state: GameState, { act, goto }: SceneContext<GameState, K>) => {
    H1('Лес')
    P(`Ты стоишь на опушке. Вокруг ${em('мёртвая')} тишина.`)

    if (!state.hasBranch) {
      act('Поднять ветку', s => { s.hasBranch = true })
    }

    goto('clearing', 'Пойти на поляну')
  },

  clearing: (state: GameState, { goto }: SceneContext<GameState, K>) => {
    H1('Поляна')
    P(`На поляне тихо. ${state.hasBranch ? `В руке у тебя ${strong('ветка')}.` : ''}`)

    goto('start', 'Вернуться в лес')
  },
}
