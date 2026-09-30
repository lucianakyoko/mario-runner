import { describe, expect, it } from 'vitest'

import type { Mario } from './mario'
import { stopMarioCrouch } from './stop-mario-crouch'
import { marioLifeState } from './mario-life-state'

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

describe('stopMarioCrouch', () => {
  it('stops Mario from crouching', () => {
    const mario: Mario = {
      ...createMario(),
      movementState: 'CROUCHING',
    }

    const updatedMario = stopMarioCrouch(mario)

    expect(updatedMario.movementState).toBe('RUNNING')
  })

  it('preserves Mario position when stopping crouch', () => {
    const mario: Mario = {
      ...createMario(),
      movementState: 'CROUCHING',
    }

    const updatedMario = stopMarioCrouch(mario)

    expect(updatedMario.position).toEqual(mario.position)
  })

  it('preserves Mario velocity when stopping crouch', () => {
    const mario: Mario = {
      ...createMario(),
      movementState: 'CROUCHING',
    }

    const updatedMario = stopMarioCrouch(mario)

    expect(updatedMario.velocity).toEqual(mario.velocity)
  })

  it('does not change Mario when he is not crouching', () => {
    const mario = createMario()

    const updatedMario = stopMarioCrouch(mario)

    expect(updatedMario).toBe(mario)
  })

  it('preserves the original Mario state', () => {
    const mario = {
      ...createMario(),
      movementState: 'CROUCHING' as const,
    }

    stopMarioCrouch(mario)

    expect(mario.movementState).toBe('CROUCHING')
  })
})
