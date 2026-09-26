import type { CollisionBounds } from '../collision/collision-bounds'
import type { ObstacleType } from './obstacle-type'

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

  position: ObstaclePosition

  // Área visual (sprite renderizado)
  size: ObstacleSize

  // Área de colisão independente do visual
  collisionBounds: CollisionBounds

  velocity: ObstacleVelocity
}
