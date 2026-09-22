import { describe, expect, it } from 'vitest'

import type { Mario } from './mario'
import { startMarioCrouch } from './start-mario-crouch'

const createMario = (isGrounded = true): Mario => ({
  position: {
    x: 100,
    y: 300,
  },
  velocity: {
    x: 280,
    y: 0,
  },
  size: {
    width: 32,
    height: 48,
  },
  movementState: 'RUNNING',
  isGrounded,
})

describe('startMarioCrouch', () => {
  it('starts crouching when Mario is grounded', () => {
    const mario = createMario()

    const updatedMario = startMarioCrouch(mario)

    expect(updatedMario.movementState).toBe('CROUCHING')
    expect(updatedMario.isGrounded).toBe(true)
  })

  it('does not start crouching while Mario is airborne', () => {
    const mario = createMario(false)

    const updatedMario = startMarioCrouch(mario)

    expect(updatedMario).toBe(mario)
  })

  it('preserves position and velocity when crouching', () => {
    const mario = createMario()

    const updatedMario = startMarioCrouch(mario)

    expect(updatedMario.position).toEqual(mario.position)
    expect(updatedMario.velocity).toEqual(mario.velocity)
  })

  it('preserves the original Mario state', () => {
    const mario = createMario()

    startMarioCrouch(mario)

    expect(mario.movementState).toBe('RUNNING')
  })
})
