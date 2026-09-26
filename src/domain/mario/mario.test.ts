import { describe, expect, it } from 'vitest'
import { createInitialMario } from './mario'

describe('createInitialMario', () => {
  it('creates Mario in the expected initial state', () => {
    const mario = createInitialMario({
      width: 32,
      height: 48,
      initialX: 24,
      groundY: 300,
      initialSpeed: 280,
    })

    expect(mario).toEqual({
      position: {
        x: 24,
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
      collisionBounds: {
        offsetX: 0,
        offsetY: 0,
        width: 32,
        height: 48,
      },
      movementState: 'RUNNING',
      isGrounded: true,
    })
  })
})
