import type { Mario } from './mario'

export const updateMarioMovement = (
  mario: Mario,
  deltaTime: number,
): Mario => ({
  ...mario,
  position: {
    ...mario.position,
    x: mario.position.x + mario.velocity.x * deltaTime,
  },
})
