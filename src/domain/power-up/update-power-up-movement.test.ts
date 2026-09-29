import { describe, expect, it } from 'vitest'

import { POWER_UP_TYPE } from './power-up-type'
import type { PowerUp } from './power-up'
import { updatePowerUpMovement } from './update-power-up-movement'

describe('updatePowerUpMovement', () => {
  it('should move the power-up according to velocity and delta time', () => {
    const powerUp: PowerUp = {
      id: 'mushroom-1',
      type: POWER_UP_TYPE.MUSHROOM,
      position: {
        x: 500,
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
    }

    const updatedPowerUp = updatePowerUpMovement(powerUp, 0.5)

    expect(updatedPowerUp.position).toEqual({
      x: 360,
      y: 100,
    })
  })

  it('should support vertical movement independently from horizontal movement', () => {
    const powerUp: PowerUp = {
      id: 'mushroom-2',
      type: POWER_UP_TYPE.MUSHROOM,
      position: {
        x: 300,
        y: 120,
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
        x: -100,
        y: 40,
      },
      isCollected: false,
    }

    const updatedPowerUp = updatePowerUpMovement(powerUp, 0.25)

    expect(updatedPowerUp.position).toEqual({
      x: 275,
      y: 130,
    })
  })

  it('should preserve the power-up data while updating its position', () => {
    const powerUp: PowerUp = {
      id: 'mushroom-3',
      type: POWER_UP_TYPE.MUSHROOM,
      position: {
        x: 200,
        y: 80,
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
    }

    const updatedPowerUp = updatePowerUpMovement(powerUp, 0.1)

    expect(updatedPowerUp.id).toBe(powerUp.id)
    expect(updatedPowerUp.type).toBe(powerUp.type)
    expect(updatedPowerUp.size).toEqual(powerUp.size)
    expect(updatedPowerUp.collisionBounds).toEqual(powerUp.collisionBounds)
    expect(updatedPowerUp.velocity).toEqual(powerUp.velocity)
    expect(updatedPowerUp.isCollected).toBe(powerUp.isCollected)
  })
})
