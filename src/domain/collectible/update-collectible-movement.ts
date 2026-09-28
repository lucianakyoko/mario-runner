import type { Collectible } from './collectible'

export const updateCollectibleMovement = (
  collectible: Collectible,
  deltaTime: number,
): Collectible => ({
  ...collectible,
  position: {
    x: collectible.position.x + collectible.velocity.x * deltaTime,
    y: collectible.position.y + collectible.velocity.y * deltaTime,
  },
})
