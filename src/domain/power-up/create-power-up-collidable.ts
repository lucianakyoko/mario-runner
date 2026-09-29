import type { Collidable } from '../collision/collidable'
import { getPowerUpCollisionBounds } from './power-up'
import type { PowerUp } from './power-up'

export const createPowerUpCollidable = (powerUp: PowerUp): Collidable => ({
  getCollisionBounds: () => getPowerUpCollisionBounds(powerUp),
})
