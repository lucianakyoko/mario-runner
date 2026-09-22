import type { Mario } from './mario'

export const landMario = (mario: Mario, groundY: number): Mario => {
  if (mario.position.y < groundY) {
    return mario
  }

  return {
    ...mario,
    position: {
      ...mario.position,
      y: groundY,
    },
    velocity: {
      ...mario.velocity,
      y: 0,
    },
    movementState: 'RUNNING',
    isGrounded: true,
  }
}
