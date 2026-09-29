import type { PowerUp } from './power-up'

export const removeOffscreenPowerUps = (powerUps: PowerUp[]): PowerUp[] =>
  powerUps.filter((powerUp) => powerUp.position.x + powerUp.size.width >= 0)
