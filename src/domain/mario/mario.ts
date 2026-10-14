import { createCollisionRectangle } from '../collision/create-collision-rectangle'
import type { CollisionBounds } from '../collision/collision-bounds'
import type { Rectangle } from '../collision/rectangle'
import type { MarioMovementState } from './mario-movement-state'
import { marioLifeState, type MarioLifeState } from './mario-life-state'
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
  lifeState: MarioLifeState
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
  lifeState: marioLifeState.ALIVE,
  isGrounded: true,
})

export const getMarioVisualHeight = (mario: Mario): number => {
  const isBig =
    mario.powerState === marioPowerState.POWERED &&
    mario.lifeState !== marioLifeState.DEAD

  switch (mario.movementState) {
    case 'RUNNING':
      return isBig ? 64 : 48

    case 'JUMPING':
      return isBig ? 64 : 48

    case 'FALLING':
      return isBig ? 62 : 46

    case 'CROUCHING':
      return isBig ? 36 : 32
  }
}

export const getMarioCollisionBounds = (mario: Mario): Rectangle =>
  createCollisionRectangle(
    {
      x: mario.position.x,
      y: mario.position.y - getMarioVisualHeight(mario),
    },
    mario.collisionBounds,
  )
