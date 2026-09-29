import type { PowerUp } from './power-up'

export const consumePowerUp = (powerUp: PowerUp): PowerUp => {
  if (powerUp.isCollected) {
    return powerUp
  }

  return {
    ...powerUp,
    isCollected: true,
  }
}
