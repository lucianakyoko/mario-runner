import { describe, expect, it } from 'vitest'

import type { Mario } from './mario'
import { landMario } from './land-mario'

const createMario = (positionY: number): Mario => ({
  position: {
    x: 100,
    y: positionY,
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
  isGrounded: false,
})

describe('landMario', () => {
  it('places Mario exactly on the ground', () => {
    const mario = createMario(300)

    const updatedMario = landMario(mario, 300)

    expect(updatedMario.position.y).toBe(300)
    expect(updatedMario.velocity.y).toBe(0)
    expect(updatedMario.isGrounded).toBe(true)
    expect(updatedMario.movementState).toBe('RUNNING')
  })

  it('prevents Mario from remaining below the ground', () => {
    const mario = createMario(320)

    const updatedMario = landMario(mario, 300)

    expect(updatedMario.position.y).toBe(300)
    expect(updatedMario.velocity.y).toBe(0)
  })

  it('does not land Mario while he is above the ground', () => {
    const mario = createMario(250)

    const updatedMario = landMario(mario, 300)

    expect(updatedMario).toBe(mario)
  })

  it('preserves horizontal movement when landing', () => {
    const mario = createMario(300)

    const updatedMario = landMario(mario, 300)

    expect(updatedMario.velocity.x).toBe(280)
  })

  it('preserves the original Mario state', () => {
    const mario = createMario(320)

    landMario(mario, 300)

    expect(mario.position.y).toBe(320)
    expect(mario.velocity.y).toBe(400)
    expect(mario.isGrounded).toBe(false)
    expect(mario.movementState).toBe('FALLING')
  })
})
