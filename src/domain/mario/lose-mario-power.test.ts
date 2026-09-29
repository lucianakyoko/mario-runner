import { describe, expect, it } from 'vitest'

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

const createPoweredMario = (): Mario => ({
  position: {
    x: 100,
    y: 0,
  },
  velocity: {
    x: 280,
    y: 0,
  },
  size: {
    width: 32,
    height: 64,
  },
  collisionBounds: {
    offsetX: 2,
    offsetY: 2,
    width: 28,
    height: 60,
  },
  movementState: 'RUNNING',
  powerState: marioPowerState.POWERED,
  isGrounded: true,
})

describe('loseMarioPower', () => {
  it('transforms Mario from powered to normal', () => {
    const mario = createPoweredMario()

    const normalMario = loseMarioPower(mario, normalConfig)

    expect(normalMario.powerState).toBe(marioPowerState.NORMAL)
    expect(normalMario.size).toEqual({
      width: 32,
      height: 48,
    })
  })

  it('updates collision bounds when Mario loses power', () => {
    const mario = createPoweredMario()

    const normalMario = loseMarioPower(mario, normalConfig)

    expect(normalMario.collisionBounds).toEqual({
      offsetX: 2,
      offsetY: 2,
      width: 28,
      height: 44,
    })
  })

  it('preserves ground contact when Mario loses power', () => {
    const mario = createPoweredMario()

    const normalMario = loseMarioPower(mario, normalConfig)

    expect(normalMario.position.y).toBe(mario.position.y)
    expect(normalMario.position.y).toBe(0)
    expect(normalMario.isGrounded).toBe(true)
  })

  it('preserves vertical reference when Mario loses power in the air', () => {
    const mario: Mario = {
      ...createPoweredMario(),
      position: {
        x: 100,
        y: -80,
      },
      isGrounded: false,
      movementState: 'FALLING',
    }

    const normalMario = loseMarioPower(mario, normalConfig)

    expect(normalMario.position.y).toBe(-80)
    expect(normalMario.isGrounded).toBe(false)
    expect(normalMario.movementState).toBe('FALLING')
  })

  it('preserves horizontal position and velocity', () => {
    const mario = createPoweredMario()

    const normalMario = loseMarioPower(mario, normalConfig)

    expect(normalMario.position.x).toBe(mario.position.x)
    expect(normalMario.velocity).toEqual(mario.velocity)
  })

  it('does not change Mario when he is already normal', () => {
    const mario: Mario = {
      ...createPoweredMario(),
      size: {
        width: 32,
        height: 48,
      },
      collisionBounds: normalConfig.collisionBounds,
      powerState: marioPowerState.NORMAL,
    }

    const unchangedMario = loseMarioPower(mario, normalConfig)

    expect(unchangedMario).toBe(mario)
  })
})
