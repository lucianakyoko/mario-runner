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

export interface InitialMarioConfig {
  width: number
  height: number
  initialX: number
  groundY: number
  initialSpeed: number
}

export const createInitialMario = (config: InitialMarioConfig): Mario => ({
  position: {
    x: config.initialX,
    y: config.groundY,
  },
  velocity: {
    x: config.initialSpeed,
    y: 0,
  },
  size: {
    width: config.width,
    height: config.height,
  },
  movementState: 'RUNNING',
  isGrounded: true,
})
