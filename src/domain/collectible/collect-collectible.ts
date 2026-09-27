import type { Collectible } from './collectible'

export const collectCollectible = (collectible: Collectible): Collectible => ({
  ...collectible,
  isCollected: true,
})
