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

    expect(getCollectibleCollisionBounds(collectible)).toEqual({
      x: 402,
      y: 114,
      width: 20,
      height: 20,
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

    expect(getCollectibleCollisionBounds(collectible)).toEqual({
      x: 604,
      y: 67,
      width: 24,
      height: 26,
    })
  })

  it('keeps collectible identity independent from its type', () => {
    const firstCollectible: Collectible = {
      id: 'collectible-1',
      type: collectibleTypes.COIN,
      position: { x: 400, y: 120 },
      size: { width: 24, height: 24 },
      collisionBounds: {
        offsetX: 2,
        offsetY: 2,
        width: 20,
        height: 20,
      },
      velocity: { x: -280, y: 0 },
      isCollected: false,
    }

    const secondCollectible: Collectible = {
      ...firstCollectible,
      id: 'collectible-2',
      position: { x: 600, y: 120 },
    }

    expect(firstCollectible.id).not.toBe(secondCollectible.id)
    expect(firstCollectible.type).toBe(secondCollectible.type)
  })

  it('represents a collected collectible', () => {
    const collectible: Collectible = {
      id: 'collectible-1',
      type: collectibleTypes.COIN,
      position: { x: 400, y: 120 },
      size: { width: 24, height: 24 },
      collisionBounds: {
        offsetX: 2,
        offsetY: 2,
        width: 20,
        height: 20,
      },
      velocity: { x: -280, y: 0 },
      isCollected: true,
    }

    expect(collectible.isCollected).toBe(true)
  })
})
