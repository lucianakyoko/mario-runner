import { createCollisionRectangle } from '../collision/create-collision-rectangle'
import type { CollisionBounds } from '../collision/collision-bounds'
import type { Rectangle } from '../collision/rectangle'
import type { CollectibleType } from './collectible-type'

export interface CollectiblePosition {
  x: number
  y: number
}

export interface CollectibleSize {
  width: number
  height: number
}

export interface CollectibleVelocity {
  x: number
  y: number
}

export interface Collectible {
  id: string
  type: CollectibleType

  position: CollectiblePosition

  // Área visual (sprite renderizado)
  size: CollectibleSize

  // Área de colisão independente do visual
  collisionBounds: CollisionBounds

  velocity: CollectibleVelocity

  isCollected: boolean
}

export const getCollectibleCollisionBounds = (
  collectible: Collectible,
): Rectangle =>
  createCollisionRectangle(collectible.position, collectible.collisionBounds)
