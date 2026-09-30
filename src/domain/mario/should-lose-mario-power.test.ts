import { describe, expect, it } from 'vitest'

import type { Mario } from './mario'
import { shouldLoseMarioPower } from './should-lose-mario-power'

const createMario = (powerState: Mario['powerState']): Mario => ({
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
    height: powerState === 'POWERED' ? 64 : 48,
  },
  collisionBounds: {
    offsetX: 0,
    offsetY: 0,
    width: 32,
    height: powerState === 'POWERED' ? 64 : 48,
  },
  movementState: 'RUNNING',
  powerState,
  isGrounded: true,
})

describe('shouldLoseMarioPower', () => {
  it('returns true when powered Mario collides with an obstacle', () => {
    const mario = createMario('POWERED')

    expect(shouldLoseMarioPower(mario, true)).toBe(true)
  })

  it('returns false when powered Mario does not collide', () => {
    const mario = createMario('POWERED')

    expect(shouldLoseMarioPower(mario, false)).toBe(false)
  })

  it('returns false when normal Mario collides with an obstacle', () => {
    const mario = createMario('NORMAL')

    expect(shouldLoseMarioPower(mario, true)).toBe(false)
  })

  it('returns false when normal Mario does not collide', () => {
    const mario = createMario('NORMAL')

    expect(shouldLoseMarioPower(mario, false)).toBe(false)
  })
})
