import type { Mario } from './mario'

export const startMarioJump = (mario: Mario, jumpForce: number): Mario => {
  if (!mario.isGrounded) {
    return mario
  }

  return {
    ...mario,
    velocity: {
      ...mario.velocity,
      y: -jumpForce,
    },
    movementState: 'JUMPING',
    isGrounded: false,
  }
}
