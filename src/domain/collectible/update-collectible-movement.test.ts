import { describe, expect, it } from 'vitest'
import type { Collectible } from './collectible'
import { collectibleTypes } from './collectible-type'
import { updateCollectibleMovement } from './update-collectible-movement'

const collectible: Collectible = {
  id: 'coin-1',
  type: collectibleTypes.COIN,
  position: {
    x: 100,
    y: 200,
  },
  size: {
    width: 16,
    height: 16,
  },
  collisionBounds: {
    offsetX: 0,
    offsetY: 0,
    width: 16,
    height: 16,
  },
  velocity: {
    x: -120,
    y: 0,
  },
  isCollected: false,
}

describe('updateCollectibleMovement', () => {
  it('moves the collectible according to elapsed time', () => {
    const result = updateCollectibleMovement(collectible, 0.5)

    expect(result.position).toEqual({
      x: 40,
      y: 200,
    })
  })

  it('does not change position when delta time is zero', () => {
    const result = updateCollectibleMovement(collectible, 0)

    expect(result.position).toEqual(collectible.position)
  })
})
