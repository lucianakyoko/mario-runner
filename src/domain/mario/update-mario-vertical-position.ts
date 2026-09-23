import type { Mario } from './mario'

export const updateMarioVerticalPosition = (
  mario: Mario,
  deltaTime: number,
): Mario => ({
  ...mario,
  position: {
    ...mario.position,
    y: mario.position.y + mario.velocity.y * deltaTime,
  },
})
