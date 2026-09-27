import { describe, expect, it } from 'vitest'

import type { Collectible } from './collectible'
import { collectibleTypes } from './collectible-type'
import { collectCollectible } from './collect-collectible'

const createCollectible = (
  type: Collectible['type'] = collectibleTypes.COIN,
): Collectible => ({
  id: 'collectible-1',
  type,
  position: {
    x: 100,
    y: 50,
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

describe('collectCollectible', () => {
  it('marks a coin as collected', () => {
    const coin = createCollectible(collectibleTypes.COIN)

    const collectedCoin = collectCollectible(coin)

    expect(collectedCoin.isCollected).toBe(true)
  })

  it('marks a medal as collected', () => {
    const medal = createCollectible(collectibleTypes.MEDAL)

    const collectedMedal = collectCollectible(medal)

    expect(collectedMedal.isCollected).toBe(true)
  })

  it('preserves the collectible data', () => {
    const collectible = createCollectible()

    const collected = collectCollectible(collectible)

    expect(collected).toEqual({
      ...collectible,
      isCollected: true,
    })
  })

  it('does not mutate the original collectible', () => {
    const collectible = createCollectible()

    const collected = collectCollectible(collectible)

    expect(collected).not.toBe(collectible)
    expect(collectible.isCollected).toBe(false)
  })

  it('keeps an already collected collectible collected', () => {
    const collectible = {
      ...createCollectible(),
      isCollected: true,
    }

    const collected = collectCollectible(collectible)

    expect(collected.isCollected).toBe(true)
  })
})
