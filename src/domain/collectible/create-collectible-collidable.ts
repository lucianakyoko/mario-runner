import type { Collidable } from '../collision/collidable'
import { getCollectibleCollisionBounds } from './collectible'
import type { Collectible } from './collectible'

export const createCollectibleCollidable = (
  collectible: Collectible,
): Collidable => ({
  getCollisionBounds: () => getCollectibleCollisionBounds(collectible),
})
