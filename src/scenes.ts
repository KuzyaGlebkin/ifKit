import adventureMusic from './assets/Adventure.m4a'
import coinPickupSound from './assets/impactGeneric_light_001.ogg'
import branchPickupSound from './assets/impactWood_heavy_001.ogg'
import { H1, P, Phtml, em, strong, t, PlayMusic, Sound } from './ifKit'
import type { GameState } from './state'
import type { SceneContext } from './ifKit'

// ── Аудио-пример ─────────────────────────────────────────────────────────────
// Фон: PlayMusic() в теле сцены (тот же src в каждой сцене с музыкой — трек
// не перезапускается при переходе). Эффекты: Sound() в колбэке act.
// В dev Vite отдаёт URL; в single-file build — data URL.
// ─────────────────────────────────────────────────────────────────────────────

type K = 'start' | 'clearing'

export const scenes = {
  start: (state: GameState, { act, goto }: SceneContext<GameState, K>) => {
    PlayMusic(adventureMusic)
    H1`Лес`
    P`Ты стоишь на опушке. Вокруг ${em`мёртвая`} тишина.`

    if (!state.hasBranch) {
      act`Поднять ветку`(s => {
        Sound(branchPickupSound)
        s.hasBranch = true
      })
    }
    // Пример для snackbar: смена `gold` даёт уведомление с форматтером `watch.gold`.
    act`Подобрать монету`(s => {
      Sound(coinPickupSound)
      s.gold += 1
    })

    goto('clearing')`Пойти на поляну`
  },

  clearing: (state: GameState, { goto }: SceneContext<GameState, K>) => {
    PlayMusic(adventureMusic)
    H1`Поляна`
    const branchNote = state.hasBranch ? t`В руке у тебя ${strong`ветка`}.` : ''
    Phtml(t`На поляне тихо.` + (branchNote ? ' ' + branchNote : ''))
    P`На поляне тихо без phtml ${branchNote}`

    goto('start')`Вернуться в лес`
  },
}
