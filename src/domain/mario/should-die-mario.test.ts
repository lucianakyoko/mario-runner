import { describe, expect, it } from 'vitest'

import { marioLifeState } from './mario-life-state'
import { marioPowerState } from './mario-power-state'
import type { Mario } from './mario'
import { shouldDieMario } from './should-die-mario'

const createMario = (): Mario => ({
  position: {
    x: 120,
    y: 80,
  },
  velocity: {
    x: 280,
    y: 180,
  },
  size: {
    width: 32,
    height: 48,
  },
  collisionBounds: {
    offsetX: 2,
    offsetY: 2,
    width: 28,
    height: 44,
  },
  movementState: 'FALLING',
  powerState: marioPowerState.NORMAL,
  lifeState: marioLifeState.ALIVE,
  isGrounded: false,
})

describe('shouldDieMario', () => {
  it('returns true when normal Mario has a collision', () => {
    const mario = createMario()

    expect(shouldDieMario(mario, true)).toBe(true)
  })

  it('returns false when there is no collision', () => {
    const mario = createMario()

    expect(shouldDieMario(mario, false)).toBe(false)
  })

  it('returns false when powered Mario has a collision', () => {
    const mario: Mario = {
      ...createMario(),
      powerState: marioPowerState.POWERED,
    }

    expect(shouldDieMario(mario, true)).toBe(false)
  })

  it('returns false when Mario is already dead', () => {
    const mario: Mario = {
      ...createMario(),
      lifeState: marioLifeState.DEAD,
    }

    expect(shouldDieMario(mario, true)).toBe(false)
  })
})
