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
      return createMarioVisual(
        variant,
        movementState,
        32,
        variant === 'BIG' ? 64 : 48,
        0,
        0,
      )

    case 'JUMPING':
      return createMarioVisual(
        variant,
        movementState,
        34,
        variant === 'BIG' ? 64 : 48,
        -1,
        0,
      )

    case 'FALLING':
      return createMarioVisual(
        variant,
        movementState,
        30,
        variant === 'BIG' ? 62 : 46,
        1,
        2,
      )

    case 'CROUCHING':
      return createMarioVisual(
        variant,
        movementState,
        36,
        variant === 'BIG' ? 48 : 32,
        -2,
        0,
      )
  }
}

export const createAnimatedMarioVisual = (
  variant: MarioVisualVariant,
  movementState: MarioMovementState,
  elapsedTime: number,
  frameDuration: number,
): MarioVisual => {
  if (movementState !== 'RUNNING') {
    return createMarioVisualForState(variant, movementState)
  }

  const animationFrame = Math.floor(elapsedTime / frameDuration) % 2

  if (animationFrame === 0) {
    return createMarioVisual(
      variant,
      movementState,
      32,
      variant === 'BIG' ? 64 : 48,
      0,
      0,
    )
  }

  return createMarioVisual(
    variant,
    movementState,
    34,
    variant === 'BIG' ? 62 : 46,
    -1,
    2,
  )
}
