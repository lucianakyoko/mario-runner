import { describe, expect, it } from 'vitest'

import { createPowerUpCollidable } from './create-power-up-collidable'
import { createMushroom } from './create-mushroom'
import { POWER_UP_TYPE } from './power-up-type'

const createTestMushroom = () =>
  createMushroom({
    id: 'mushroom-1',
    x: 100,
    config: {
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
    },
    velocityX: -280,
  })

describe('createPowerUpCollidable', () => {
  it('exposes the power-up collision bounds through the Collidable contract', () => {
    const mushroom = createTestMushroom()

    expect(mushroom.type).toBe(POWER_UP_TYPE.MUSHROOM)

    const collidable = createPowerUpCollidable(mushroom)

    expect(collidable.getCollisionBounds()).toEqual({
      x: 102,
      y: -30,
      width: 28,
      height: 28,
    })
  })

  it('follows the power-up position through the adapter', () => {
    const mushroom = createTestMushroom()
    const collidable = createPowerUpCollidable(mushroom)

    mushroom.position.x = 180
    mushroom.position.y = -40

    expect(collidable.getCollisionBounds()).toEqual({
      x: 182,
      y: -70,
      width: 28,
      height: 28,
    })
  })

  it('preserves collision dimensions when the visual size changes', () => {
    const mushroom = createTestMushroom()
    const collidable = createPowerUpCollidable(mushroom)

    mushroom.size = {
      width: 64,
      height: 80,
    }

    expect(collidable.getCollisionBounds()).toEqual({
      x: 102,
      y: -78,
      width: 28,
      height: 28,
    })
  })
})
