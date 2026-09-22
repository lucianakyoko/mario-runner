import type { Mario } from './mario'

export const startMarioCrouch = (mario: Mario): Mario => {
  if (!mario.isGrounded) {
    return mario
  }

  return {
    ...mario,
    movementState: 'CROUCHING',
  }
}
