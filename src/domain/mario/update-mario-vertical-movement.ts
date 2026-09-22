import type { Mario } from './mario'

export const updateMarioVerticalMovement = (
  mario: Mario,
  gravity: number,
  deltaTime: number,
): Mario => ({
  ...mario,
  velocity: {
    ...mario.velocity,
    y: mario.velocity.y + gravity * deltaTime,
  },
})
