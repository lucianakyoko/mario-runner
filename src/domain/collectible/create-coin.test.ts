import { describe, expect, it } from 'vitest'

import type { CollectibleConfig } from '../config/gameplay-config'
import { collectibleTypes } from './collectible-type'
import { createCoin } from './create-coin'

const coinConfig: CollectibleConfig = {
  width: 24,
  height: 24,
  groundOffset: 48,
  speed: 280,
  collisionBounds: {
    offsetX: 2,
    offsetY: 2,
    width: 20,
    height: 20,
  },
}

describe('createCoin', () => {
  it('creates a coin using the provided configuration', () => {
    const coin = createCoin({
      id: 'coin-1',
      x: 800,
      config: coinConfig,
      velocityX: -280,
    })

    expect(coin).toEqual({
      id: 'coin-1',
      type: collectibleTypes.COIN,
      position: {
        x: 800,
        y: -48,
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

  it('uses the configured dimensions independently from collision bounds', () => {
    const config: CollectibleConfig = {
      ...coinConfig,
      width: 32,
      height: 40,
      collisionBounds: {
        offsetX: 5,
        offsetY: 6,
        width: 18,
        height: 24,
      },
    }

    const coin = createCoin({
      id: 'coin-2',
      x: 600,
      config,
      velocityX: -320,
    })

    expect(coin.size).toEqual({
      width: 32,
      height: 40,
    })

    expect(coin.collisionBounds).toEqual({
      offsetX: 5,
      offsetY: 6,
      width: 18,
      height: 24,
    })
  })

  it('uses the configured ground offset for its vertical position', () => {
    const config: CollectibleConfig = {
      ...coinConfig,
      groundOffset: -72,
    }

    const coin = createCoin({
      id: 'coin-3',
      x: 500,
      config,
      velocityX: -280,
    })

    expect(coin.position).toEqual({
      x: 500,
      y: 72,
    })
  })

  it('uses the provided horizontal velocity', () => {
    const coin = createCoin({
      id: 'coin-4',
      x: 900,
      config: coinConfig,
      velocityX: -360,
    })

    expect(coin.velocity).toEqual({
      x: -360,
      y: 0,
    })
  })

  it('creates the coin as not collected', () => {
    const coin = createCoin({
      id: 'coin-5',
      x: 700,
      config: coinConfig,
      velocityX: -280,
    })

    expect(coin.isCollected).toBe(false)
  })
})
