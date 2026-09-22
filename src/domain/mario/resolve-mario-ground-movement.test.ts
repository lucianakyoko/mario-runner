import { describe, expect, it } from 'vitest'

import type { Mario } from './mario'
import { resolveMarioGroundMovement } from './resolve-mario-ground-movement'

const jumpForce = 680

const createMario = (): Mario => ({
  position: {
    x: 100,
    y: 300,
  },
  velocity: {
    x: 280,
    y: 0,
  },
  size: {
    width: 32,
    height: 48,
  },
  movementState: 'RUNNING',
  isGrounded: true,
})

describe('resolveMarioGroundMovement', () => {
  it('starts a jump when jump is active', () => {
    const mario = createMario()

    const updatedMario = resolveMarioGroundMovement(
      mario,
      {
        jump: true,
        crouch: false,
      },
      {
        jumpForce,
      },
    )

    expect(updatedMario.movementState).toBe('JUMPING')
    expect(updatedMario.velocity.y).toBe(-jumpForce)
    expect(updatedMario.isGrounded).toBe(false)
  })

  it('starts crouching when only crouch is active', () => {
    const mario = createMario()

    const updatedMario = resolveMarioGroundMovement(
      mario,
      {
        jump: false,
        crouch: true,
      },
      {
        jumpForce,
      },
    )

    expect(updatedMario.movementState).toBe('CROUCHING')
    expect(updatedMario.isGrounded).toBe(true)
  })

  it('gives jump priority when jump and crouch are both active', () => {
    const mario = createMario()

    const updatedMario = resolveMarioGroundMovement(
      mario,
      {
        jump: true,
        crouch: true,
      },
      {
        jumpForce,
      },
    )

    expect(updatedMario.movementState).toBe('JUMPING')
    expect(updatedMario.velocity.y).toBe(-jumpForce)
    expect(updatedMario.isGrounded).toBe(false)
  })

  it('returns to running when neither command is active', () => {
    const mario: Mario = {
      ...createMario(),
      movementState: 'CROUCHING',
    }

    const updatedMario = resolveMarioGroundMovement(
      mario,
      {
        jump: false,
        crouch: false,
      },
      {
        jumpForce,
      },
    )

    expect(updatedMario.movementState).toBe('RUNNING')
    expect(updatedMario.isGrounded).toBe(true)
  })

  it('does not change an airborne Mario', () => {
    const mario: Mario = {
      ...createMario(),
      movementState: 'JUMPING',
      isGrounded: false,
      velocity: {
        x: 280,
        y: -680,
      },
    }

    const updatedMario = resolveMarioGroundMovement(
      mario,
      {
        jump: true,
        crouch: true,
      },
      {
        jumpForce,
      },
    )

    expect(updatedMario).toBe(mario)
  })

  it('preserves Mario position when resolving ground movement', () => {
    const mario = createMario()

    const updatedMario = resolveMarioGroundMovement(
      mario,
      {
        jump: true,
        crouch: false,
      },
      {
        jumpForce,
      },
    )

    expect(updatedMario.position).toEqual(mario.position)
  })
})
