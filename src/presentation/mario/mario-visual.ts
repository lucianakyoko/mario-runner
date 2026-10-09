import type { MarioMovementState } from '../../domain/mario/mario-movement-state'

export type MarioVisualVariant = 'SMALL' | 'BIG' | 'DEAD'
export type MarioAnimationFrame = 0 | 1

export interface MarioVisual {
  variant: MarioVisualVariant
  width: number
  height: number
  offsetX: number
  offsetY: number
  movementState: MarioMovementState
  animationFrame: MarioAnimationFrame
}

export const createMarioVisual = (
  variant: MarioVisualVariant,
  movementState: MarioMovementState,
  width: number,
  height: number,
  offsetX: number,
  offsetY: number,
  animationFrame: MarioAnimationFrame = 0,
): MarioVisual => ({
  variant,
  width,
  height,
  offsetX,
  offsetY,
  movementState,
  animationFrame,
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

  const animationFrame = (Math.floor(elapsedTime / frameDuration) %
    2) as MarioAnimationFrame

  if (variant === 'BIG') {
    return createMarioVisual(
      variant,
      movementState,
      32,
      64,
      0,
      0,
      animationFrame,
    )
  }

  if (animationFrame === 0) {
    return createMarioVisual(
      variant,
      movementState,
      32,
      48,
      0,
      0,
      animationFrame,
    )
  }

  return createMarioVisual(
    variant,
    movementState,
    34,
    46,
    -1,
    2,
    animationFrame,
  )
}
