import { describe, expect, it } from 'vitest'

import type { CollectibleConfig } from '../config/gameplay-config'
import { collectibleTypes } from './collectible-type'
import { createMedal } from './create-medal'

const medalConfig: CollectibleConfig = {
  width: 32,
  height: 32,
  groundOffset: 64,
  speed: 280,
  collisionBounds: {
    offsetX: 4,
    offsetY: 3,
    width: 24,
    height: 26,
  },
}

describe('createMedal', () => {
  it('creates a medal using the provided configuration', () => {
    const medal = createMedal({
      id: 'medal-1',
      x: 800,
      config: medalConfig,
      velocityX: -280,
    })

    expect(medal).toEqual({
      id: 'medal-1',
      type: collectibleTypes.MEDAL,
      position: {
        x: 800,
        y: -64,
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
    })
  })

  it('uses the configured dimensions independently from collision bounds', () => {
    const config: CollectibleConfig = {
      ...medalConfig,
      width: 40,
      height: 48,
      collisionBounds: {
        offsetX: 6,
        offsetY: 7,
        width: 28,
        height: 34,
      },
    }

    const medal = createMedal({
      id: 'medal-2',
      x: 600,
      config,
      velocityX: -320,
    })

    expect(medal.size).toEqual({
      width: 40,
      height: 48,
    })

    expect(medal.collisionBounds).toEqual({
      offsetX: 6,
      offsetY: 7,
      width: 28,
      height: 34,
    })
  })

  it('uses the configured ground offset for its vertical position', () => {
    const config: CollectibleConfig = {
      ...medalConfig,
      groundOffset: -80,
    }

    const medal = createMedal({
      id: 'medal-3',
      x: 500,
      config,
      velocityX: -280,
    })

    expect(medal.position).toEqual({
      x: 500,
      y: 80,
    })
  })

  it('uses the provided horizontal velocity', () => {
    const medal = createMedal({
      id: 'medal-4',
      x: 900,
      config: medalConfig,
      velocityX: -360,
    })

    expect(medal.velocity).toEqual({
      x: -360,
      y: 0,
    })
  })

  it('creates the medal as not collected', () => {
    const medal = createMedal({
      id: 'medal-5',
      x: 700,
      config: medalConfig,
      velocityX: -280,
    })

    expect(medal.isCollected).toBe(false)
  })
})
