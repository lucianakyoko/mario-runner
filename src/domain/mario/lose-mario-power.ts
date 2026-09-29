import type { CollisionBounds } from '../collision/collision-bounds'
import type { Mario } from './mario'
import { marioPowerState } from './mario-power-state'

export interface MarioNormalConfig {
  width: number
  height: number
  collisionBounds: CollisionBounds
}

export const loseMarioPower = (
  mario: Mario,
  config: MarioNormalConfig,
): Mario => {
  if (mario.powerState === marioPowerState.NORMAL) {
    return mario
  }

  return {
    ...mario,
    size: {
      width: config.width,
      height: config.height,
    },
    collisionBounds: config.collisionBounds,
    powerState: marioPowerState.NORMAL,
  }
}
