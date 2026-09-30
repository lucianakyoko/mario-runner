import {
  marioPowerState,
  type MarioPowerState,
} from '../../domain/mario/mario-power-state'
import type { MarioVisualVariant } from './mario-visual'

export const selectMarioVisualVariant = (
  powerState: MarioPowerState,
): MarioVisualVariant =>
  powerState === marioPowerState.POWERED ? 'BIG' : 'SMALL'
