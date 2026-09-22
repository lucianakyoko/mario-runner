import { describe, expect, it } from 'vitest'

import type { Mario } from './mario'
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
  movementState: 'RUNNING',
  isGrounded: true,
})

describe('updateMarioMovement', () => {
  it('moves Mario according to elapsed time', () => {
    const mario = createMario()

    const updatedMario = updateMarioMovement(mario, 0.5)

    expect(updatedMario.position.x).toBe(240)
    expect(updatedMario.position.y).toBe(200)
  })

  it('preserves the original Mario state', () => {
    const mario = createMario()

    updateMarioMovement(mario, 0.5)

    expect(mario.position.x).toBe(100)
    expect(mario.position.y).toBe(200)
  })

  it('produces the same displacement at different frame rates', () => {
    const sixtyFpsDeltaTime = 1 / 60
    const thirtyFpsDeltaTime = 1 / 30

    let marioAtSixtyFps = createMario()
    let marioAtThirtyFps = createMario()

    for (let frame = 0; frame < 60; frame += 1) {
      marioAtSixtyFps = updateMarioMovement(marioAtSixtyFps, sixtyFpsDeltaTime)
    }

    for (let frame = 0; frame < 30; frame += 1) {
      marioAtThirtyFps = updateMarioMovement(
        marioAtThirtyFps,
        thirtyFpsDeltaTime,
      )
    }

    expect(marioAtSixtyFps.position.x).toBeCloseTo(marioAtThirtyFps.position.x)
  })
})
