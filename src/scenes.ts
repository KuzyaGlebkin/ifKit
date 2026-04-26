import { H1, P, em, strong, t /*, PlayMusic, Sound */ } from './ifKit'
import type { GameState } from './state'
import type { SceneContext } from './ifKit'

// ── Аудио-пример ─────────────────────────────────────────────────────────────
// Чтобы использовать фоновую музыку, импортируй аудиофайл через Vite и вызови
// PlayMusic() в теле сцены. В dev-режиме Vite отдаёт URL файла, при сборке
// single-file HTML — инлайнит его как base64 data URL.
//
//   import forestMusic from './music/forest.mp3'
//
//   start: (state, { act, goto }) => {
//     PlayMusic(forestMusic)   // декларативно: движок сам решит, менять ли трек
//     H1('Лес')
//     ...
//   }
//
// Для одиночных звуков используй Sound() внутри колбэка act/goto:
//
//   act('Открыть дверь', s => {
//     Sound(doorSound)
//     s.doorOpen = true
//   })
// ─────────────────────────────────────────────────────────────────────────────

type K = 'start' | 'clearing'

export const scenes = {
  start: (state: GameState, { act, goto }: SceneContext<GameState, K>) => {
    H1(t`Лес`)
    P(t`Ты стоишь на опушке. Вокруг ${em(t`мёртвая`)} тишина.`)

    if (!state.hasBranch) {
      act(t`Поднять ветку`, s => { s.hasBranch = true })
    }

    goto('clearing', t`Пойти на поляну`)
  },

  clearing: (state: GameState, { goto }: SceneContext<GameState, K>) => {
    H1(t`Поляна`)
    const branchNote = state.hasBranch ? ` ${t`В руке у тебя ${strong(t`ветка`)}.`}` : ''
    P(t`На поляне тихо.` + branchNote)

    goto('start', t`Вернуться в лес`)
  },
}
