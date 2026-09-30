import type { Mario } from './mario'
import { marioLifeState } from './mario-life-state'

export const dieMario = (mario: Mario): Mario => {
  if (mario.lifeState === marioLifeState.DEAD) {
    return mario
  }

  return {
    ...mario,
    lifeState: marioLifeState.DEAD,
  }
}
