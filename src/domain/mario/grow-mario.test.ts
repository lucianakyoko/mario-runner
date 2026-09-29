import { describe, expect, it } from 'vitest'

import { growMario } from './grow-mario'
import { marioPowerState } from './mario-power-state'
import type { Mario } from './mario'

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
    x: 100,
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
    offsetX: 2,
    offsetY: 2,
    width: 28,
    height: 44,
  },
  movementState: 'RUNNING',
  powerState: marioPowerState.NORMAL,
  isGrounded: true,
})

describe('growMario', () => {
  it('transforms Mario from normal to powered', () => {
    const mario = createMario()

    const poweredMario = growMario(mario, poweredConfig)

    expect(poweredMario.powerState).toBe(marioPowerState.POWERED)
    expect(poweredMario.size).toEqual({
      width: 32,
      height: 64,
    })
  })

  it('updates collision bounds when Mario grows', () => {
    const mario = createMario()

    const poweredMario = growMario(mario, poweredConfig)

    expect(poweredMario.collisionBounds).toEqual({
      offsetX: 2,
      offsetY: 2,
      width: 28,
      height: 60,
    })
  })

  it('preserves ground contact when Mario grows', () => {
    const mario = createMario()

    const poweredMario = growMario(mario, poweredConfig)

    expect(poweredMario.position.y).toBe(mario.position.y)
    expect(poweredMario.position.y).toBe(0)
    expect(poweredMario.isGrounded).toBe(true)
  })

  it('preserves vertical reference when Mario grows in the air', () => {
    const mario: Mario = {
      ...createMario(),
      position: {
        x: 100,
        y: -80,
      },
      isGrounded: false,
      movementState: 'JUMPING',
    }

    const poweredMario = growMario(mario, poweredConfig)

    expect(poweredMario.position.y).toBe(-80)
    expect(poweredMario.isGrounded).toBe(false)
    expect(poweredMario.movementState).toBe('JUMPING')
  })

  it('preserves horizontal position and velocity', () => {
    const mario = createMario()

    const poweredMario = growMario(mario, poweredConfig)

    expect(poweredMario.position.x).toBe(mario.position.x)
    expect(poweredMario.velocity).toEqual(mario.velocity)
  })

  it('does not grow Mario again when he is already powered', () => {
    const mario = createMario()

    const poweredMario = growMario(mario, poweredConfig)
    const unchangedMario = growMario(poweredMario, poweredConfig)

    expect(unchangedMario).toBe(poweredMario)
  })
})
