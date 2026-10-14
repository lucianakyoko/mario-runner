import { describe, expect, it } from 'vitest'

import { collectibleTypes } from './collectible-type'
import type { Collectible } from './collectible'
import { createCollectibleCollidable } from './create-collectible-collidable'

const createCollectible = (): Collectible => ({
  id: 'coin-1',
  type: collectibleTypes.COIN,
  position: {
    x: 100,
    y: 200,
  },
  size: {
    width: 24,
    height: 24,
  },
  collisionBounds: {
    offsetX: 4,
    offsetY: 6,
    width: 16,
    height: 18,
  },
  velocity: {
    x: -280,
    y: 0,
  },
  isCollected: false,
})

describe('createCollectibleCollidable', () => {
  it('exposes the collectible collision bounds through the Collidable contract', () => {
    const collectible = createCollectible()
    const collidable = createCollectibleCollidable(collectible)

    expect(collidable.getCollisionBounds()).toEqual({
      x: 104,
      y: 198,
      width: 16,
      height: 18,
    })
  })

  it('follows the collectible position through the adapter', () => {
    const collectible = createCollectible()
    const collidable = createCollectibleCollidable(collectible)

    collectible.position.x = 180
    collectible.position.y = 140

    expect(collidable.getCollisionBounds()).toEqual({
      x: 184,
      y: 138,
      width: 16,
      height: 18,
    })
  })

  it('preserves collision dimensions when the visual size changes', () => {
    const collectible = createCollectible()
    const collidable = createCollectibleCollidable(collectible)

    collectible.size = {
      width: 64,
      height: 80,
    }

    expect(collidable.getCollisionBounds()).toEqual({
      x: 104,
      y: 142,
      width: 16,
      height: 18,
    })
  })
})
