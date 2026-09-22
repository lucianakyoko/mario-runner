import type { MarioMovementState } from './mario-movement-state'

export interface MarioPosition {
  x: number
  y: number
}

export interface MarioVelocity {
  x: number
  y: number
}

export interface MarioSize {
  width: number
  height: number
}

export interface Mario {
  position: MarioPosition
  velocity: MarioVelocity
  size: MarioSize
  movementState: MarioMovementState
  isGrounded: boolean
}
