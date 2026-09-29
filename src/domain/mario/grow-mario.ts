import type { Mario } from './mario'
import { marioPowerState } from './mario-power-state'

export interface MarioGrowthConfig {
  width: number
  height: number
}

export const growMario = (mario: Mario, config: MarioGrowthConfig): Mario => {
  if (mario.powerState === marioPowerState.POWERED) {
    return mario
  }

  const heightDifference = config.height - mario.size.height

  return {
    ...mario,
    position: {
      ...mario.position,
      y: mario.position.y - heightDifference,
    },
    size: {
      width: config.width,
      height: config.height,
    },
    powerState: marioPowerState.POWERED,
  }
}
