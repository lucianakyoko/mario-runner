import type { PowerUp } from './power-up'
import { updatePowerUpMovement } from './update-power-up-movement'

export const updatePowerUpsMovement = (
  powerUps: PowerUp[],
  deltaTime: number,
): PowerUp[] =>
  powerUps.map((powerUp) => updatePowerUpMovement(powerUp, deltaTime))
