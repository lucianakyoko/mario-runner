import { createCollisionRectangle } from '../collision/create-collision-rectangle'
import type { CollisionBounds } from '../collision/collision-bounds'
import type { Rectangle } from '../collision/rectangle'
import type { PowerUpType } from './power-up-type'

export interface PowerUpPosition {
  x: number
  y: number
}

export interface PowerUpSize {
  width: number
  height: number
}

export interface PowerUpVelocity {
  x: number
  y: number
}

export interface PowerUp {
  id: string
  type: PowerUpType

  position: PowerUpPosition

  // Área visual (sprite renderizado)
  size: PowerUpSize

  // Área de colisão independente do visual
  collisionBounds: CollisionBounds

  velocity: PowerUpVelocity

  isCollected: boolean
}

export const getPowerUpCollisionBounds = (powerUp: PowerUp): Rectangle =>
  createCollisionRectangle(
    {
      x: powerUp.position.x,
      y: powerUp.position.y - powerUp.size.height,
    },
    powerUp.collisionBounds,
  )
