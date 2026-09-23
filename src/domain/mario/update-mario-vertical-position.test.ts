import { describe, expect, it } from 'vitest'

import type { Mario } from './mario'
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
  movementState: 'FALLING',
  isGrounded: false,
})

describe('updateMarioVerticalPosition', () => {
  it('updates vertical position according to elapsed time', () => {
    const mario = createMario()

    const updatedMario = updateMarioVerticalPosition(mario, 0.5)

    expect(updatedMario.position.y).toBe(400)
  })

  it('preserves horizontal position and velocity', () => {
    const mario = createMario()

    const updatedMario = updateMarioVerticalPosition(mario, 0.5)

    expect(updatedMario.position.x).toBe(100)
    expect(updatedMario.velocity.x).toBe(280)
    expect(updatedMario.velocity.y).toBe(400)
  })

  it('preserves the original Mario state', () => {
    const mario = createMario()

    updateMarioVerticalPosition(mario, 0.5)

    expect(mario.position.y).toBe(200)
  })
})
