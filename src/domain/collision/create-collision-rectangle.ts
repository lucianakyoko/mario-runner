import type { CollisionBounds } from './collision-bounds'
import type { Rectangle } from './rectangle'

export interface CollisionPosition {
  x: number
  y: number
}

export const createCollisionRectangle = (
  position: CollisionPosition,
  bounds: CollisionBounds,
): Rectangle => ({
  x: position.x + bounds.offsetX,
  y: position.y + bounds.offsetY,
  width: bounds.width,
  height: bounds.height,
})
