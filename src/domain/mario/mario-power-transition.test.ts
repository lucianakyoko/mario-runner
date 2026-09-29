import { describe, expect, it } from 'vitest'

import { growMario } from './grow-mario'
import { loseMarioPower } from './lose-mario-power'
import { marioPowerState } from './mario-power-state'
import type { Mario } from './mario'

const normalConfig = {
  width: 32,
  height: 48,
  collisionBounds: {
    offsetX: 2,
    offsetY: 2,
    width: 28,
    height: 44,
  },
}

const poweredConfig = {
  width: 32,
  height: 64,
  collisionBounds: {
    offsetX: 2,
    offsetY: 2,
    width: 28,
    height: 60,
  },
}

const createMario = (): Mario => ({
  position: {
    x: 120,
    y: 0,
  },
  velocity: {
    x: 320,
    y: 0,
  },
  size: {
    width: 32,
    height: 48,
  },
  collisionBounds: normalConfig.collisionBounds,
  movementState: 'RUNNING',
  powerState: marioPowerState.NORMAL,
  isGrounded: true,
})

describe('Mario power transitions', () => {
  it('transitions from normal to powered and back to normal', () => {
    const mario = createMario()

    const poweredMario = growMario(mario, poweredConfig)
    const normalMario = loseMarioPower(poweredMario, normalConfig)

    expect(poweredMario.powerState).toBe(marioPowerState.POWERED)
    expect(normalMario.powerState).toBe(marioPowerState.NORMAL)

    expect(normalMario.size).toEqual(mario.size)
    expect(normalMario.collisionBounds).toEqual(mario.collisionBounds)
  })

  it('preserves ground contact throughout the complete transition cycle', () => {
    const mario = createMario()

    const poweredMario = growMario(mario, poweredConfig)
    const normalMario = loseMarioPower(poweredMario, normalConfig)

    expect(poweredMario.position.y).toBe(0)
    expect(normalMario.position.y).toBe(0)

    expect(poweredMario.isGrounded).toBe(true)
    expect(normalMario.isGrounded).toBe(true)
  })

  it('preserves movement state and velocity throughout the complete transition cycle', () => {
    const mario = createMario()

    const poweredMario = growMario(mario, poweredConfig)
    const normalMario = loseMarioPower(poweredMario, normalConfig)

    expect(poweredMario.velocity).toEqual(mario.velocity)
    expect(normalMario.velocity).toEqual(mario.velocity)

    expect(poweredMario.movementState).toBe(mario.movementState)
    expect(normalMario.movementState).toBe(mario.movementState)
  })

  it('preserves the horizontal position throughout the complete transition cycle', () => {
    const mario = createMario()

    const poweredMario = growMario(mario, poweredConfig)
    const normalMario = loseMarioPower(poweredMario, normalConfig)

    expect(poweredMario.position.x).toBe(mario.position.x)
    expect(normalMario.position.x).toBe(mario.position.x)
  })

  it('supports the complete transition cycle while Mario is airborne', () => {
    const mario: Mario = {
      ...createMario(),
      position: {
        x: 120,
        y: -96,
      },
      velocity: {
        x: 320,
        y: 180,
      },
      movementState: 'FALLING',
      isGrounded: false,
    }

    const poweredMario = growMario(mario, poweredConfig)
    const normalMario = loseMarioPower(poweredMario, normalConfig)

    expect(poweredMario.powerState).toBe(marioPowerState.POWERED)
    expect(normalMario.powerState).toBe(marioPowerState.NORMAL)

    expect(poweredMario.position.y).toBe(-96)
    expect(normalMario.position.y).toBe(-96)

    expect(poweredMario.velocity).toEqual(mario.velocity)
    expect(normalMario.velocity).toEqual(mario.velocity)

    expect(poweredMario.isGrounded).toBe(false)
    expect(normalMario.isGrounded).toBe(false)
  })
})
