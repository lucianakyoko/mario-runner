import {
  marioLifeState,
  type MarioLifeState,
} from '../../domain/mario/mario-life-state'
import {
  marioPowerState,
  type MarioPowerState,
} from '../../domain/mario/mario-power-state'
import type { MarioVisualVariant } from './mario-visual'

export const selectMarioVisualVariant = (
  lifeState: MarioLifeState,
  powerState: MarioPowerState,
): MarioVisualVariant => {
  if (lifeState === marioLifeState.DEAD) {
    return 'DEAD'
  }

  return powerState === marioPowerState.POWERED ? 'BIG' : 'SMALL'
}
