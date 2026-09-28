import type { Collectible } from './collectible'
import { updateCollectibleMovement } from './update-collectible-movement'

export const updateCollectiblesMovement = (
  collectibles: Collectible[],
  deltaTime: number,
): Collectible[] =>
  collectibles.map((collectible) =>
    updateCollectibleMovement(collectible, deltaTime),
  )
