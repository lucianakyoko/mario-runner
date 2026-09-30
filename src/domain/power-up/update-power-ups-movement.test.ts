import { describe, expect, it } from 'vitest'

import { POWER_UP_TYPE } from './power-up-type'
import type { PowerUp } from './power-up'
import { updatePowerUpsMovement } from './update-power-ups-movement'

const createPowerUp = (id: string, x: number): PowerUp => ({
  id,
  type: POWER_UP_TYPE.MUSHROOM,
  position: {
    x,
    y: 100,
  },
  size: {
    width: 32,
    height: 32,
  },
  collisionBounds: {
    offsetX: 2,
    offsetY: 2,
    width: 28,
    height: 28,
  },
  velocity: {
    x: -280,
    y: 0,
  },
  isCollected: false,
})

describe('updatePowerUpsMovement', () => {
  it('updates the movement of every power-up using delta time', () => {
    const powerUps = [
      createPowerUp('mushroom-1', 500),
      createPowerUp('mushroom-2', 700),
    ]

    const updatedPowerUps = updatePowerUpsMovement(powerUps, 0.5)

    expect(updatedPowerUps).toEqual([
      {
        ...powerUps[0],
        position: {
          x: 360,
          y: 100,
        },
      },
      {
        ...powerUps[1],
        position: {
          x: 560,
          y: 100,
        },
      },
    ])
  })

  it('returns an empty array when there are no power-ups', () => {
    expect(updatePowerUpsMovement([], 0.5)).toEqual([])
  })

  it('preserves the original power-up collection', () => {
    const powerUps = [createPowerUp('mushroom-1', 500)]

    const updatedPowerUps = updatePowerUpsMovement(powerUps, 0.5)

    expect(updatedPowerUps).not.toBe(powerUps)
    expect(updatedPowerUps[0]).not.toBe(powerUps[0])
    expect(powerUps[0].position).toEqual({
      x: 500,
      y: 100,
    })
  })
})
