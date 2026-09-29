import { describe, expect, it } from 'vitest'

import type { PowerUp } from './power-up'
import { POWER_UP_TYPE } from './power-up-type'
import { removeOffscreenPowerUps } from './remove-offscreen-power-ups'

const createPowerUp = (x: number): PowerUp => ({
  id: `mushroom-${x}`,
  type: POWER_UP_TYPE.MUSHROOM,
  position: {
    x,
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
  isCollected: false,
})

describe('removeOffscreenPowerUps', () => {
  it('keeps power-ups that are still visible', () => {
    const powerUps = [createPowerUp(10), createPowerUp(-20)]

    const result = removeOffscreenPowerUps(powerUps)

    expect(result).toEqual(powerUps)
  })

  it('removes power-ups that are completely outside the world', () => {
    const visible = createPowerUp(40)
    const offscreen = createPowerUp(-40)

    const result = removeOffscreenPowerUps([visible, offscreen])

    expect(result).toEqual([visible])
  })

  it('returns an empty collection when every power-up is offscreen', () => {
    const result = removeOffscreenPowerUps([
      createPowerUp(-50),
      createPowerUp(-80),
    ])

    expect(result).toEqual([])
  })

  it('does not mutate the original collection', () => {
    const powerUps = [createPowerUp(-40), createPowerUp(20)]

    removeOffscreenPowerUps(powerUps)

    expect(powerUps).toHaveLength(2)
  })
})
