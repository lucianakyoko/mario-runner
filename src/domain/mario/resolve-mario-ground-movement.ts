import type { Mario } from './mario'
import { startMarioCrouch } from './start-mario-crouch'
import { startMarioJump } from './start-mario-jump'
import { stopMarioCrouch } from './stop-mario-crouch'

export interface MarioGroundMovementInput {
  jump: boolean
  crouch: boolean
}

export interface MarioGroundMovementConfig {
  jumpForce: number
}

export const resolveMarioGroundMovement = (
  mario: Mario,
  input: MarioGroundMovementInput,
  config: MarioGroundMovementConfig,
): Mario => {
  if (!mario.isGrounded) {
    return mario
  }

  if (input.jump) {
    return startMarioJump(mario, config.jumpForce)
  }

  if (input.crouch) {
    return startMarioCrouch(mario)
  }

  return stopMarioCrouch(mario)
}
