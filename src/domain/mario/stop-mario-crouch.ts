import type { Mario } from './mario'

export const stopMarioCrouch = (mario: Mario): Mario => {
  if (mario.movementState !== 'CROUCHING') {
    return mario
  }

  return {
    ...mario,
    movementState: 'RUNNING',
  }
}
