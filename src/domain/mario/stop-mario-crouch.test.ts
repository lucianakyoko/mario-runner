import { describe, expect, it } from 'vitest'

import type { Mario } from './mario'
import { stopMarioCrouch } from './stop-mario-crouch'

const createMario = (): Mario => ({
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
  movementState: 'CROUCHING',
  isGrounded: true,
})

describe('stopMarioCrouch', () => {
  it('returns Mario to running state', () => {
    const mario = createMario()

    const updatedMario = stopMarioCrouch(mario)

    expect(updatedMario.movementState).toBe('RUNNING')
  })

  it('preserves grounded state', () => {
    const mario = createMario()

    const updatedMario = stopMarioCrouch(mario)

    expect(updatedMario.isGrounded).toBe(true)
  })

  it('preserves position and velocity', () => {
    const mario = createMario()

    const updatedMario = stopMarioCrouch(mario)

    expect(updatedMario.position).toEqual(mario.position)
    expect(updatedMario.velocity).toEqual(mario.velocity)
  })

  it('does nothing when Mario is not crouching', () => {
    const mario: Mario = {
      ...createMario(),
      movementState: 'RUNNING',
    }

    const updatedMario = stopMarioCrouch(mario)

    expect(updatedMario).toBe(mario)
  })

  it('preserves the original Mario state', () => {
    const mario = createMario()

    stopMarioCrouch(mario)

    expect(mario.movementState).toBe('CROUCHING')
  })
})
