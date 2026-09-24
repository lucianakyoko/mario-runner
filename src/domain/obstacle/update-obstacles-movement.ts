import type { Obstacle } from './obstacle'
import { updateObstacleMovement } from './update-obstacle-movement'

export const updateObstaclesMovement = (
  obstacles: Obstacle[],
  deltaTime: number,
): Obstacle[] =>
  obstacles.map((obstacle) => updateObstacleMovement(obstacle, deltaTime))
