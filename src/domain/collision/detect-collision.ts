import { intersectsRectangle } from './intersects-rectangle'
import type { Collidable } from './collidable'
import type { CollisionResult } from './collision-result'

export const detectCollision = (
  first: Collidable,
  second: Collidable,
): CollisionResult => {
  return {
    hasCollision: intersectsRectangle(
      first.getCollisionBounds(),
      second.getCollisionBounds(),
    ),
  }
}
