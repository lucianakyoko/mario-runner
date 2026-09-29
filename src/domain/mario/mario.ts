import { createCollisionRectangle } from '../collision/create-collision-rectangle'
import type { CollisionBounds } from '../collision/collision-bounds'
import type { Rectangle } from '../collision/rectangle'
import type { MarioMovementState } from './mario-movement-state'
import { marioPowerState, type MarioPowerState } from './mario-power-state'

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

  // Área visual (sprite renderizado)
  size: MarioSize

  // Área de colisão independente do visual
  collisionBounds: CollisionBounds

  movementState: MarioMovementState
  powerState: MarioPowerState
  isGrounded: boolean
}

export interface InitialMarioConfig {
  width: number
  height: number
  initialX: number
  groundY: number
  initialSpeed: number
  collisionBounds: CollisionBounds
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
  collisionBounds: config.collisionBounds,
  movementState: 'RUNNING',
  powerState: marioPowerState.NORMAL,
  isGrounded: true,
})

export const getMarioCollisionBounds = (mario: Mario): Rectangle =>
  createCollisionRectangle(mario.position, mario.collisionBounds)
