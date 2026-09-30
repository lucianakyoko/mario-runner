import { describe, expect, it } from 'vitest'

import type { Mario } from './mario'
import { marioLifeState } from './mario-life-state'
import { updateMarioMovement } from './update-mario-movement'

const createMario = (): Mario => ({
  position: {
    x: 100,
    y: 200,
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

describe('updateMarioMovement', () => {
  it('updates Mario horizontal position using delta time', () => {
    const mario = createMario()

    const updatedMario = updateMarioMovement(mario, 0.5)

    expect(updatedMario.position.x).toBe(240)
  })

  it('preserves Mario vertical position', () => {
    const mario = createMario()

    const updatedMario = updateMarioMovement(mario, 0.5)

    expect(updatedMario.position.y).toBe(200)
  })

  it('preserves Mario velocity', () => {
    const mario = createMario()

    const updatedMario = updateMarioMovement(mario, 0.5)

    expect(updatedMario.velocity).toEqual(mario.velocity)
  })

  it('does not mutate the original Mario state', () => {
    const mario = createMario()

    updateMarioMovement(mario, 0.5)

    expect(mario.position.x).toBe(100)
    expect(mario.position.y).toBe(200)
  })
})
