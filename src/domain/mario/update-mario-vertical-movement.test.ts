import { describe, expect, it } from 'vitest'

import type { Mario } from './mario'
import { updateMarioVerticalMovement } from './update-mario-vertical-movement'
import { marioLifeState } from './mario-life-state'

const createMario = (): Mario => ({
  position: {
    x: 0,
    y: 0,
  },
  velocity: {
    x: 280,
    y: 0,
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
  movementState: 'RUNNING',
  powerState: 'NORMAL',
  lifeState: marioLifeState.ALIVE,
  isGrounded: true,
})

describe('updateMarioVerticalMovement', () => {
  it('applies gravity according to elapsed time', () => {
    const mario = createMario()

    const updatedMario = updateMarioVerticalMovement(mario, 1800, 0.5)

    expect(updatedMario.velocity.y).toBe(900)
  })

  it('preserves the horizontal velocity', () => {
    const mario = createMario()

    const updatedMario = updateMarioVerticalMovement(mario, 1800, 0.5)

    expect(updatedMario.velocity.x).toBe(280)
  })

  it('preserves the original Mario state', () => {
    const mario = createMario()

    updateMarioVerticalMovement(mario, 1800, 0.5)

    expect(mario.velocity.y).toBe(0)
  })
})
