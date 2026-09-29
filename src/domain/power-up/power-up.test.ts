import { describe, expect, it } from 'vitest'

import { getPowerUpCollisionBounds, type PowerUp } from './power-up'
import { POWER_UP_TYPE } from './power-up-type'

describe('PowerUp', () => {
  it('should represent a mushroom power-up', () => {
    const powerUp: PowerUp = {
      id: 'mushroom-1',
      type: POWER_UP_TYPE.MUSHROOM,
      position: { x: 120, y: 200 },
      size: { width: 32, height: 32 },
      collisionBounds: {
        offsetX: 2,
        offsetY: 2,
        width: 28,
        height: 28,
      },
      velocity: { x: -280, y: 0 },
      isCollected: false,
    }

    expect(powerUp.type).toBe(POWER_UP_TYPE.MUSHROOM)
    expect(powerUp.isCollected).toBe(false)
  })

  it('should calculate collision bounds independently from visual size', () => {
    const powerUp: PowerUp = {
      id: 'mushroom-1',
      type: POWER_UP_TYPE.MUSHROOM,
      position: { x: 100, y: 50 },
      size: { width: 32, height: 32 },
      collisionBounds: {
        offsetX: 3,
        offsetY: 4,
        width: 24,
        height: 22,
      },
      velocity: { x: 0, y: 0 },
      isCollected: false,
    }

    expect(getPowerUpCollisionBounds(powerUp)).toEqual({
      x: 103,
      y: 54,
      width: 24,
      height: 22,
    })
  })
})
