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

export const createMarioVisualForState = (
  variant: MarioVisualVariant,
  movementState: MarioMovementState,
): MarioVisual => {
  switch (movementState) {
    case 'RUNNING':
      return createMarioVisual(variant, movementState, 32, 48, 0, 0)

    case 'JUMPING':
      return createMarioVisual(variant, movementState, 34, 48, -1, 0)

    case 'FALLING':
      return createMarioVisual(variant, movementState, 30, 46, 1, 2)

    case 'CROUCHING':
      return createMarioVisual(variant, movementState, 36, 32, -2, 0)
  }
}
