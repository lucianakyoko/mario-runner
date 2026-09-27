import { describe, expect, it } from 'vitest'

import { collectibleTypes } from './collectible-type'
import type { Collectible } from './collectible'
import { getCollectibleCollisionBounds } from './collectible'

describe('Collectible', () => {
  it('represents a coin', () => {
    const collectible: Collectible = {
      id: 'collectible-1',
      type: collectibleTypes.COIN,
      position: {
        x: 400,
        y: 120,
      },
      size: {
        width: 24,
        height: 24,
      },
      collisionBounds: {
        offsetX: 2,
        offsetY: 2,
        width: 20,
        height: 20,
      },
      velocity: {
        x: -280,
        y: 0,
      },
      isCollected: false,
    }

    expect(collectible).toEqual({
      id: 'collectible-1',
      type: collectibleTypes.COIN,
      position: {
        x: 400,
        y: 120,
      },
      size: {
        width: 24,
        height: 24,
      },
      collisionBounds: {
        offsetX: 2,
        offsetY: 2,
        width: 20,
        height: 20,
      },
      velocity: {
        x: -280,
        y: 0,
      },
      isCollected: false,
    })
  })

  it('represents a medal', () => {
    const collectible: Collectible = {
      id: 'collectible-2',
      type: collectibleTypes.MEDAL,
      position: {
        x: 600,
        y: 80,
      },
      size: {
        width: 32,
        height: 32,
      },
      collisionBounds: {
        offsetX: 4,
        offsetY: 3,
        width: 24,
        height: 26,
      },
      velocity: {
        x: -280,
        y: 0,
      },
      isCollected: false,
    }

    expect(collectible.type).toBe(collectibleTypes.MEDAL)
    expect(collectible.position).toEqual({
      x: 600,
      y: 80,
    })
    expect(collectible.size).toEqual({
      width: 32,
      height: 32,
    })
    expect(collectible.collisionBounds).toEqual({
      offsetX: 4,
      offsetY: 3,
      width: 24,
      height: 26,
    })
    expect(collectible.isCollected).toBe(false)
  })

  it('keeps collectible identity independent from its type', () => {
    const firstCollectible: Collectible = {
      id: 'collectible-1',
      type: collectibleTypes.COIN,
      position: {
        x: 400,
        y: 120,
      },
      size: {
        width: 24,
        height: 24,
      },
      collisionBounds: {
        offsetX: 2,
        offsetY: 2,
        width: 20,
        height: 20,
      },
      velocity: {
        x: -280,
        y: 0,
      },
      isCollected: false,
    }

    const secondCollectible: Collectible = {
      id: 'collectible-2',
      type: collectibleTypes.COIN,
      position: {
        x: 600,
        y: 120,
      },
      size: {
        width: 24,
        height: 24,
      },
      collisionBounds: {
        offsetX: 2,
        offsetY: 2,
        width: 20,
        height: 20,
      },
      velocity: {
        x: -280,
        y: 0,
      },
      isCollected: false,
    }

    expect(firstCollectible.id).not.toBe(secondCollectible.id)
    expect(firstCollectible.type).toBe(secondCollectible.type)
  })

  it('represents a collected collectible', () => {
    const collectible: Collectible = {
      id: 'collectible-1',
      type: collectibleTypes.COIN,
      position: {
        x: 400,
        y: 120,
      },
      size: {
        width: 24,
        height: 24,
      },
      collisionBounds: {
        offsetX: 2,
        offsetY: 2,
        width: 20,
        height: 20,
      },
      velocity: {
        x: -280,
        y: 0,
      },
      isCollected: true,
    }

    expect(collectible.isCollected).toBe(true)
  })
})

describe('getCollectibleCollisionBounds', () => {
  it('creates collision bounds from collectible position and configured bounds', () => {
    const collectible: Collectible = {
      id: 'collectible-1',
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
    }

    expect(getCollectibleCollisionBounds(collectible)).toEqual({
      x: 104,
      y: 206,
      width: 16,
      height: 18,
    })
  })

  it('follows collectible position without depending on visual dimensions', () => {
    const collectible: Collectible = {
      id: 'collectible-1',
      type: collectibleTypes.MEDAL,
      position: {
        x: 100,
        y: 200,
      },
      size: {
        width: 64,
        height: 64,
      },
      collisionBounds: {
        offsetX: 6,
        offsetY: 8,
        width: 24,
        height: 28,
      },
      velocity: {
        x: -280,
        y: 0,
      },
      isCollected: false,
    }

    collectible.position.x = 180
    collectible.position.y = 140

    expect(getCollectibleCollisionBounds(collectible)).toEqual({
      x: 186,
      y: 148,
      width: 24,
      height: 28,
    })

    expect(collectible.size).toEqual({
      width: 64,
      height: 64,
    })
  })

  it('keeps collision bounds independent from the collectible visual area', () => {
    const collectible: Collectible = {
      id: 'collectible-1',
      type: collectibleTypes.COIN,
      position: {
        x: 300,
        y: 120,
      },
      size: {
        width: 96,
        height: 64,
      },
      collisionBounds: {
        offsetX: 8,
        offsetY: 4,
        width: 20,
        height: 18,
      },
      velocity: {
        x: -280,
        y: 0,
      },
      isCollected: false,
    }

    expect(getCollectibleCollisionBounds(collectible)).toEqual({
      x: 308,
      y: 124,
      width: 20,
      height: 18,
    })
  })
})
