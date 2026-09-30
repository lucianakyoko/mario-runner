import { describe, expect, it } from 'vitest'

import { dieMario } from './die-mario'
import { marioLifeState } from './mario-life-state'
import { marioPowerState } from './mario-power-state'
import type { Mario } from './mario'

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
    height: 64,
  },
  collisionBounds: {
    offsetX: 2,
    offsetY: 2,
    width: 28,
    height: 60,
  },
  movementState: 'FALLING',
  powerState: marioPowerState.POWERED,
  lifeState: marioLifeState.ALIVE,
  isGrounded: false,
})

describe('dieMario', () => {
  it('transitions Mario from alive to dead', () => {
    const mario = createMario()

    const deadMario = dieMario(mario)

    expect(deadMario.lifeState).toBe(marioLifeState.DEAD)
  })

  it('preserves Mario power state when he dies', () => {
    const mario = createMario()

    const deadMario = dieMario(mario)

    expect(deadMario.powerState).toBe(marioPowerState.POWERED)
  })

  it('preserves Mario movement state when he dies', () => {
    const mario = createMario()

    const deadMario = dieMario(mario)

    expect(deadMario.movementState).toBe('FALLING')
  })

  it('allows dead Mario to remain powered', () => {
    const mario = createMario()

    const deadMario = dieMario(mario)

    expect(deadMario.lifeState).toBe(marioLifeState.DEAD)
    expect(deadMario.powerState).toBe(marioPowerState.POWERED)
  })

  it('allows dead Mario to remain in a non-running movement state', () => {
    const mario: Mario = {
      ...createMario(),
      movementState: 'CROUCHING',
      isGrounded: true,
    }

    const deadMario = dieMario(mario)

    expect(deadMario.lifeState).toBe(marioLifeState.DEAD)
    expect(deadMario.movementState).toBe('CROUCHING')
    expect(deadMario.isGrounded).toBe(true)
  })

  it('preserves Mario gameplay state when he dies', () => {
    const mario = createMario()

    const deadMario = dieMario(mario)

    expect(deadMario.position).toEqual(mario.position)
    expect(deadMario.velocity).toEqual(mario.velocity)
    expect(deadMario.size).toEqual(mario.size)
    expect(deadMario.collisionBounds).toEqual(mario.collisionBounds)
    expect(deadMario.movementState).toBe(mario.movementState)
    expect(deadMario.isGrounded).toBe(mario.isGrounded)
  })

  it('does not change Mario when he is already dead', () => {
    const mario: Mario = {
      ...createMario(),
      lifeState: marioLifeState.DEAD,
    }

    const deadMario = dieMario(mario)

    expect(deadMario).toBe(mario)
  })
})
