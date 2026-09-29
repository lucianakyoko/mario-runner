import { describe, expect, it } from 'vitest'

import { growMario } from './grow-mario'
import { marioPowerState } from './mario-power-state'
import type { Mario } from './mario'

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

    const poweredMario = growMario(mario, {
      width: 32,
      height: 64,
      collisionBounds: {
        offsetX: 2,
        offsetY: 2,
        width: 28,
        height: 60,
      },
    })

    expect(poweredMario.powerState).toBe(marioPowerState.POWERED)
    expect(poweredMario.size).toEqual({
      width: 32,
      height: 64,
    })
  })

  it('updates collision bounds when Mario grows', () => {
    const mario = createMario()

    const poweredMario = growMario(mario, {
      width: 32,
      height: 64,
      collisionBounds: {
        offsetX: 2,
        offsetY: 2,
        width: 28,
        height: 60,
      },
    })

    expect(poweredMario.collisionBounds).toEqual({
      offsetX: 2,
      offsetY: 2,
      width: 28,
      height: 60,
    })
  })

  it('preserves Mario ground contact when he grows', () => {
    const mario = createMario()

    const poweredMario = growMario(mario, {
      width: 32,
      height: 64,
      collisionBounds: {
        offsetX: 2,
        offsetY: 2,
        width: 28,
        height: 60,
      },
    })

    expect(mario.position.y).toBe(0)
    expect(poweredMario.position.y).toBe(-16)
  })

  it('preserves horizontal position and velocity', () => {
    const mario = createMario()

    const poweredMario = growMario(mario, {
      width: 32,
      height: 64,
      collisionBounds: {
        offsetX: 2,
        offsetY: 2,
        width: 28,
        height: 60,
      },
    })

    expect(poweredMario.position.x).toBe(mario.position.x)
    expect(poweredMario.velocity).toEqual(mario.velocity)
  })

  it('does not grow Mario again when he is already powered', () => {
    const mario = createMario()

    const poweredMario = growMario(mario, {
      width: 32,
      height: 64,
      collisionBounds: {
        offsetX: 2,
        offsetY: 2,
        width: 28,
        height: 60,
      },
    })

    const unchangedMario = growMario(poweredMario, {
      width: 32,
      height: 64,
      collisionBounds: {
        offsetX: 2,
        offsetY: 2,
        width: 28,
        height: 60,
      },
    })

    expect(unchangedMario).toBe(poweredMario)
  })
})
