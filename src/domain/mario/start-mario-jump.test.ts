import { describe, expect, it } from 'vitest'

import type { Mario } from './mario'
import { startMarioJump } from './start-mario-jump'
import { marioLifeState } from './mario-life-state'

const createMario = (isGrounded = true): Mario => ({
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
  isGrounded,
})

describe('startMarioJump', () => {
  it('starts a jump when Mario is grounded', () => {
    const mario = createMario()

    const updatedMario = startMarioJump(mario, 680)

    expect(updatedMario.velocity.y).toBe(-680)
    expect(updatedMario.movementState).toBe('JUMPING')
    expect(updatedMario.isGrounded).toBe(false)
  })

  it('does not start a second jump while Mario is in the air', () => {
    const mario = createMario(false)

    const updatedMario = startMarioJump(mario, 680)

    expect(updatedMario).toBe(mario)
  })

  it('preserves horizontal movement when starting a jump', () => {
    const mario = createMario()

    const updatedMario = startMarioJump(mario, 680)

    expect(updatedMario.velocity.x).toBe(280)
  })

  it('preserves the original Mario state', () => {
    const mario = createMario()

    startMarioJump(mario, 680)

    expect(mario.velocity.y).toBe(0)
    expect(mario.movementState).toBe('RUNNING')
    expect(mario.isGrounded).toBe(true)
  })
})
