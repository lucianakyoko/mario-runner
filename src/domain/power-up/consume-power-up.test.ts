import { describe, expect, it } from 'vitest'

import { consumePowerUp } from './consume-power-up'
import type { PowerUp } from './power-up'
import { POWER_UP_TYPE } from './power-up-type'

const createMushroom = (isCollected = false): PowerUp => ({
  id: 'mushroom-1',
  type: POWER_UP_TYPE.MUSHROOM,
  position: {
    x: 100,
    y: 0,
  },
  size: {
    width: 32,
    height: 32,
  },
  collisionBounds: {
    offsetX: 0,
    offsetY: 0,
    width: 32,
    height: 32,
  },
  velocity: {
    x: -280,
    y: 0,
  },
  isCollected,
})

describe('consumePowerUp', () => {
  it('marks the power-up as collected', () => {
    const mushroom = createMushroom()

    const result = consumePowerUp(mushroom)

    expect(result.isCollected).toBe(true)
  })

  it('does not change an already collected power-up', () => {
    const mushroom = createMushroom(true)

    const result = consumePowerUp(mushroom)

    expect(result).toEqual(mushroom)
  })

  it('preserves the power-up data when consuming it', () => {
    const mushroom = createMushroom()

    const result = consumePowerUp(mushroom)

    expect(result).toMatchObject({
      id: mushroom.id,
      type: mushroom.type,
      position: mushroom.position,
      size: mushroom.size,
      collisionBounds: mushroom.collisionBounds,
      velocity: mushroom.velocity,
      isCollected: true,
    })
  })
})
