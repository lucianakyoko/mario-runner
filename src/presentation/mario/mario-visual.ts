import type { MarioMovementState } from '../../domain/mario/mario-movement-state'

export type MarioVisualVariant = 'SMALL' | 'BIG'

export interface MarioVisual {
  variant: MarioVisualVariant
  width: number
  height: number
  offsetX: number
  offsetY: number
  movementState: MarioMovementState
}

export const createMarioVisual = (
  variant: MarioVisualVariant,
  movementState: MarioMovementState,
  width: number,
  height: number,
  offsetX: number,
  offsetY: number,
): MarioVisual => ({
  variant,
  width,
  height,
  offsetX,
  offsetY,
  movementState,
})
