import type { Mario } from './mario'
import { marioPowerState } from './mario-power-state'

export const shouldLoseMarioPower = (
  mario: Mario,
  hasCollision: boolean,
): boolean => hasCollision && mario.powerState === marioPowerState.POWERED
