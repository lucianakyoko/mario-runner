import { createCollisionRectangle } from '../collision/create-collision-rectangle'
import type { CollisionBounds } from '../collision/collision-bounds'
import type { Rectangle } from '../collision/rectangle'
import type { ObstacleType } from './obstacle-type'
import type { ObstacleVariant } from './obstacle-variant'

export interface ObstaclePosition {
  x: number
  y: number
}

export interface ObstacleSize {
  width: number
  height: number
}

export interface ObstacleVelocity {
  x: number
  y: number
}

export interface Obstacle {
  id: string
  type: ObstacleType
  variant: ObstacleVariant
  position: ObstaclePosition

  // Área visual (sprite renderizado)
  size: ObstacleSize

  // Área de colisão independente do visual
  collisionBounds: CollisionBounds

  velocity: ObstacleVelocity
}

export const getObstacleCollisionBounds = (obstacle: Obstacle): Rectangle =>
  createCollisionRectangle(obstacle.position, obstacle.collisionBounds)
