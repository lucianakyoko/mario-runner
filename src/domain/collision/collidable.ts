import type { Rectangle } from './rectangle'

export interface Collidable {
  getCollisionBounds(): Rectangle
}
