import { describe, expect, it } from 'vitest'

import type { Mario } from './mario'
import { landMario } from './land-mario'
import { resolveMarioGroundMovement } from './resolve-mario-ground-movement'
import { startMarioJump } from './start-mario-jump'
import { updateMarioVerticalMovement } from './update-mario-vertical-movement'

const jumpForce = 680
const gravity = 1800
const groundY = 300

const createMario = (): Mario => ({
  position: {
    x: 100,
    y: groundY,
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

describe('Mario movement transitions', () => {
  it('transitions from running to crouching and back to running', () => {
    let mario = createMario()

    mario = resolveMarioGroundMovement(
      mario,
      {
        jump: false,
        crouch: true,
      },
      {
        jumpForce,
      },
    )

    expect(mario.movementState).toBe('CROUCHING')

    mario = resolveMarioGroundMovement(
      mario,
      {
        jump: false,
        crouch: false,
      },
      {
        jumpForce,
      },
    )

    expect(mario.movementState).toBe('RUNNING')
    expect(mario.isGrounded).toBe(true)
  })

  it('transitions from running to jumping', () => {
    const mario = createMario()

    const jumpingMario = resolveMarioGroundMovement(
      mario,
      {
        jump: true,
        crouch: false,
      },
      {
        jumpForce,
      },
    )

    expect(jumpingMario.movementState).toBe('JUMPING')
    expect(jumpingMario.isGrounded).toBe(false)
    expect(jumpingMario.velocity.y).toBe(-jumpForce)
  })

  it('transitions from jumping to falling as gravity changes vertical velocity', () => {
    let mario = startMarioJump(createMario(), jumpForce)

    expect(mario.movementState).toBe('JUMPING')
    expect(mario.velocity.y).toBeLessThan(0)

    for (let frame = 0; frame < 60; frame += 1) {
      mario = updateMarioVerticalMovement(mario, gravity, 1 / 60)

      if (mario.velocity.y >= 0) {
        break
      }
    }

    mario = {
      ...mario,
      movementState: 'FALLING',
    }

    expect(mario.movementState).toBe('FALLING')
    expect(mario.velocity.y).toBeGreaterThanOrEqual(0)
    expect(mario.isGrounded).toBe(false)
  })

  it('transitions from falling to running when Mario lands', () => {
    const fallingMario: Mario = {
      ...createMario(),
      position: {
        x: 100,
        y: groundY + 20,
      },
      velocity: {
        x: 280,
        y: 400,
      },
      movementState: 'FALLING',
      isGrounded: false,
    }

    const landedMario = landMario(fallingMario, groundY)

    expect(landedMario.movementState).toBe('RUNNING')
    expect(landedMario.isGrounded).toBe(true)
    expect(landedMario.position.y).toBe(groundY)
    expect(landedMario.velocity.y).toBe(0)
  })

  it('does not allow a second jump while Mario is airborne', () => {
    const jumpingMario = startMarioJump(createMario(), jumpForce)

    const secondJump = resolveMarioGroundMovement(
      jumpingMario,
      {
        jump: true,
        crouch: false,
      },
      {
        jumpForce,
      },
    )

    expect(secondJump).toBe(jumpingMario)
    expect(secondJump.movementState).toBe('JUMPING')
    expect(secondJump.velocity.y).toBe(-jumpForce)
  })

  it('keeps Mario airborne when crouch is active during a jump', () => {
    const jumpingMario = startMarioJump(createMario(), jumpForce)

    const updatedMario = resolveMarioGroundMovement(
      jumpingMario,
      {
        jump: false,
        crouch: true,
      },
      {
        jumpForce,
      },
    )

    expect(updatedMario).toBe(jumpingMario)
    expect(updatedMario.movementState).toBe('JUMPING')
    expect(updatedMario.isGrounded).toBe(false)
  })

  it('keeps jump as the deterministic result when both commands are active', () => {
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
    expect(updatedMario.isGrounded).toBe(false)
  })
})
