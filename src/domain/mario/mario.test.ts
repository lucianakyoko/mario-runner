import { describe, expect, it } from 'vitest'

import { createInitialMario, getMarioCollisionBounds } from './mario'
import { marioLifeState } from './mario-life-state'
import { marioPowerState } from './mario-power-state'

describe('createInitialMario', () => {
  it('creates Mario in the expected initial state', () => {
    const mario = createInitialMario({
      width: 32,
      height: 48,
      initialX: 24,
      groundY: 300,
      initialSpeed: 280,
      collisionBounds: {
        offsetX: 2,
        offsetY: 2,
        width: 28,
        height: 44,
      },
    })

    expect(mario.position).toEqual({
      x: 24,
      y: 300,
    })

    expect(mario.velocity).toEqual({
      x: 280,
      y: 0,
    })

    expect(mario.size).toEqual({
      width: 32,
      height: 48,
    })

    expect(mario.collisionBounds).toEqual({
      offsetX: 2,
      offsetY: 2,
      width: 28,
      height: 44,
    })

    expect(mario.movementState).toBe('RUNNING')
    expect(mario.lifeState).toBe(marioLifeState.ALIVE)
    expect(mario.powerState).toBe(marioPowerState.NORMAL)
    expect(mario.isGrounded).toBe(true)
  })
})

describe('getMarioCollisionBounds', () => {
  it('creates collision bounds from Mario position and configured bounds', () => {
    const mario = createInitialMario({
      width: 32,
      height: 48,
      initialX: 100,
      groundY: 200,
      initialSpeed: 280,
      collisionBounds: {
        offsetX: 2,
        offsetY: 3,
        width: 28,
        height: 44,
      },
    })

    expect(getMarioCollisionBounds(mario)).toEqual({
      x: 102,
      y: 203,
      width: 28,
      height: 44,
    })
  })

  it('follows Mario when his position changes without modifying Mario state', () => {
    const mario = createInitialMario({
      width: 32,
      height: 48,
      initialX: 100,
      groundY: 200,
      initialSpeed: 280,
      collisionBounds: {
        offsetX: 2,
        offsetY: 3,
        width: 28,
        height: 44,
      },
    })

    const originalCollisionBounds = { ...mario.collisionBounds }

    mario.position.x = 140
    mario.position.y = 180

    expect(getMarioCollisionBounds(mario)).toEqual({
      x: 142,
      y: 183,
      width: 28,
      height: 44,
    })

    expect(mario.collisionBounds).toEqual(originalCollisionBounds)
  })
})
