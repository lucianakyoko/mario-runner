import type { PowerUp } from './power-up'

export const updatePowerUpMovement = (
  powerUp: PowerUp,
  deltaTime: number,
): PowerUp => ({
  ...powerUp,
  position: {
    x: powerUp.position.x + powerUp.velocity.x * deltaTime,
    y: powerUp.position.y + powerUp.velocity.y * deltaTime,
  },
})
