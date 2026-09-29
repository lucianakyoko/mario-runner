import { describe, expect, it } from 'vitest'

import type { PowerUpConfig } from '../config/gameplay-config'
import { createMushroom } from './create-mushroom'
import { POWER_UP_TYPE } from './power-up-type'

describe('createMushroom', () => {
  const config: PowerUpConfig = {
    width: 32,
    height: 32,
    groundOffset: 0,
    speed: 280,
    collisionBounds: {
      offsetX: 2,
      offsetY: 2,
      width: 28,
      height: 28,
    },
  }

  it('should create a mushroom power-up', () => {
    const mushroom = createMushroom({
      id: 'mushroom-1',
      x: 500,
      config,
      velocityX: -280,
    })

    expect(mushroom.id).toBe('mushroom-1')
    expect(mushroom.type).toBe(POWER_UP_TYPE.MUSHROOM)

    expect(mushroom.position.x).toBe(500)
    expect(mushroom.position.y).toBeCloseTo(0)

    expect(mushroom.size).toEqual({
      width: 32,
      height: 32,
    })

    expect(mushroom.collisionBounds).toEqual({
      offsetX: 2,
      offsetY: 2,
      width: 28,
      height: 28,
    })

    expect(mushroom.velocity).toEqual({
      x: -280,
      y: 0,
    })

    expect(mushroom.isCollected).toBe(false)
  })

  it('should use the configured ground offset', () => {
    const mushroom = createMushroom({
      id: 'mushroom-2',
      x: 300,
      config: {
        ...config,
        groundOffset: 24,
      },
      velocityX: -320,
    })

    expect(mushroom.position.y).toBe(-24)
  })
})
