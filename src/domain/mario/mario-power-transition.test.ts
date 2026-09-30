import { describe, expect, it } from 'vitest'

import { growMario } from './grow-mario'
import { loseMarioPower } from './lose-mario-power'
import { marioPowerState } from './mario-power-state'
import type { Mario } from './mario'
import { marioLifeState } from './mario-life-state'

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
    x: 0,
    y: 0,
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

describe('Mario power transitions', () => {
  it('transitions from normal to powered and back to normal', () => {
    const mario = createMario()

    const poweredMario = growMario(mario, poweredConfig)
    const normalMario = loseMarioPower(poweredMario, normalConfig)

    expect(poweredMario.powerState).toBe(marioPowerState.POWERED)
    expect(normalMario.powerState).toBe(marioPowerState.NORMAL)

    expect(normalMario.size).toEqual(mario.size)
    expect(normalMario.collisionBounds).toEqual(normalConfig.collisionBounds)
  })

  it('restores normal Mario dimensions after losing power', () => {
    const mario = createMario()

    const poweredMario = growMario(mario, poweredConfig)
    const normalMario = loseMarioPower(poweredMario, normalConfig)

    expect(normalMario.size).toEqual({
      width: 32,
      height: 48,
    })
  })

  it('restores normal Mario collision bounds after losing power', () => {
    const mario = createMario()

    const poweredMario = growMario(mario, poweredConfig)
    const normalMario = loseMarioPower(poweredMario, normalConfig)

    expect(normalMario.collisionBounds).toEqual(normalConfig.collisionBounds)
  })

  it('preserves Mario position during the full power transition', () => {
    const mario = createMario()

    const poweredMario = growMario(mario, poweredConfig)
    const normalMario = loseMarioPower(poweredMario, normalConfig)

    expect(poweredMario.position).toEqual(mario.position)
    expect(normalMario.position).toEqual(mario.position)
  })

  it('preserves Mario velocity during the full power transition', () => {
    const mario = createMario()

    const poweredMario = growMario(mario, poweredConfig)
    const normalMario = loseMarioPower(poweredMario, normalConfig)

    expect(poweredMario.velocity).toEqual(mario.velocity)
    expect(normalMario.velocity).toEqual(mario.velocity)
  })

  it('preserves Mario movement state during the full power transition', () => {
    const mario = createMario()

    const poweredMario = growMario(mario, poweredConfig)
    const normalMario = loseMarioPower(poweredMario, normalConfig)

    expect(poweredMario.movementState).toBe(mario.movementState)
    expect(normalMario.movementState).toBe(mario.movementState)
  })

  it('preserves Mario ground contact during the full power transition', () => {
    const mario = createMario()

    const poweredMario = growMario(mario, poweredConfig)
    const normalMario = loseMarioPower(poweredMario, normalConfig)

    expect(poweredMario.isGrounded).toBe(true)
    expect(normalMario.isGrounded).toBe(true)
  })
})
