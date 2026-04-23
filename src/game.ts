import { defineGame, H2, P } from './ifKit'
import { scenes } from './scenes'
import { initialState } from './state'
import type { GameState } from './state'

defineGame({
  state: initialState,
  static: (state: GameState) => {
    H2('Персонаж')
    P(`HP: ${state.hp} | Золото: ${state.gold}`)
  },
  scenes,
})
