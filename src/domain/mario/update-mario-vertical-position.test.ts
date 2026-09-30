import { describe, expect, it } from 'vitest'

import type { Mario } from './mario'
import { marioLifeState } from './mario-life-state'
import { updateMarioVerticalPosition } from './update-mario-vertical-position'

const createMario = (): Mario => ({
  position: {
    x: 100,
    y: 200,
  },
  velocity: {
    x: 280,
    y: 400,
  },
  size: {
    width: 32,
    height: 48,
  },
  collisionBounds: {
    offsetX: 0,
    offsetY: 0,
    width: 32,
    height: 48,
  },
  movementState: 'FALLING',
  powerState: 'NORMAL',
  lifeState: marioLifeState.ALIVE,
  isGrounded: false,
})

describe('updateMarioVerticalPosition', () => {
  it('updates Mario vertical position using delta time', () => {
    const mario = createMario()

    const updatedMario = updateMarioVerticalPosition(mario, 0.5)

    expect(updatedMario.position.y).toBe(400)
  })

  it('preserves Mario horizontal position', () => {
    const mario = createMario()

    const updatedMario = updateMarioVerticalPosition(mario, 0.5)

    expect(updatedMario.position.x).toBe(100)
  })

  it('preserves Mario velocity', () => {
    const mario = createMario()

    const updatedMario = updateMarioVerticalPosition(mario, 0.5)

    expect(updatedMario.velocity).toEqual(mario.velocity)
  })

  it('does not mutate the original Mario state', () => {
    const mario = createMario()

    updateMarioVerticalPosition(mario, 0.5)

    expect(mario.position.x).toBe(100)
    expect(mario.position.y).toBe(200)
  })
})
