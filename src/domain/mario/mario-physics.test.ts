import { describe, expect, it } from 'vitest'

import type { Mario } from './mario'
import { landMario } from './land-mario'
import { startMarioJump } from './start-mario-jump'
import { updateMarioVerticalMovement } from './update-mario-vertical-movement'

const gravity = 1800
const jumpForce = 680
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
  collisionBounds: {
    offsetX: 0,
    offsetY: 0,
    width: 32,
    height: 48,
  },
  movementState: 'RUNNING',
  isGrounded: true,
})

describe('Mario physics', () => {
  it('starts a jump with upward vertical velocity', () => {
    const mario = createMario()

    const jumpingMario = startMarioJump(mario, jumpForce)

    expect(jumpingMario.velocity.y).toBe(-jumpForce)
    expect(jumpingMario.isGrounded).toBe(false)
    expect(jumpingMario.movementState).toBe('JUMPING')
  })

  it('changes vertical velocity from upward to downward during the jump', () => {
    let mario = startMarioJump(createMario(), jumpForce)

    const initialVelocityY = mario.velocity.y

    for (let frame = 0; frame < 60; frame += 1) {
      mario = updateMarioVerticalMovement(mario, gravity, 1 / 60)

      if (mario.velocity.y >= 0) {
        break
      }
    }

    expect(initialVelocityY).toBeLessThan(0)
    expect(mario.velocity.y).toBeGreaterThanOrEqual(0)
  })

  it('allows vertical velocity to become positive while falling', () => {
    let mario = startMarioJump(createMario(), jumpForce)

    for (let frame = 0; frame < 60; frame += 1) {
      mario = updateMarioVerticalMovement(mario, gravity, 1 / 60)
    }

    expect(mario.velocity.y).toBeGreaterThan(0)
  })

  it('returns Mario to the ground and normalizes vertical velocity', () => {
    const mario: Mario = {
      ...createMario(),
      position: {
        x: 100,
        y: 320,
      },
      velocity: {
        x: 280,
        y: 400,
      },
      movementState: 'FALLING',
      isGrounded: false,
    }

    const landedMario = landMario(mario, groundY)

    expect(landedMario.position.y).toBe(groundY)
    expect(landedMario.velocity.y).toBe(0)
    expect(landedMario.isGrounded).toBe(true)
    expect(landedMario.movementState).toBe('RUNNING')
  })

  it('does not allow a second jump while Mario is airborne', () => {
    const jumpingMario = startMarioJump(createMario(), jumpForce)

    const secondJump = startMarioJump(jumpingMario, jumpForce)

    expect(secondJump).toBe(jumpingMario)
    expect(secondJump.velocity.y).toBe(-jumpForce)
  })

  it('produces the same vertical velocity after the same elapsed time at different frame rates', () => {
    let marioAtSixtyFps = startMarioJump(createMario(), jumpForce)
    let marioAtThirtyFps = startMarioJump(createMario(), jumpForce)

    for (let frame = 0; frame < 60; frame += 1) {
      marioAtSixtyFps = updateMarioVerticalMovement(
        marioAtSixtyFps,
        gravity,
        1 / 60,
      )
    }

    for (let frame = 0; frame < 30; frame += 1) {
      marioAtThirtyFps = updateMarioVerticalMovement(
        marioAtThirtyFps,
        gravity,
        1 / 30,
      )
    }

    expect(marioAtSixtyFps.velocity.y).toBeCloseTo(marioAtThirtyFps.velocity.y)
  })
})
