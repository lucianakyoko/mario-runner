import type { Mario } from './mario'
import { marioLifeState } from './mario-life-state'
import { marioPowerState } from './mario-power-state'

export const shouldDieMario = (mario: Mario, hasCollision: boolean): boolean =>
  hasCollision &&
  mario.lifeState === marioLifeState.ALIVE &&
  mario.powerState === marioPowerState.NORMAL
