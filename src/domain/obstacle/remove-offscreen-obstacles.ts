import type { Obstacle } from './obstacle'

export const removeOffscreenObstacles = (
  obstacles: Obstacle[],
  cameraLeftX: number,
): Obstacle[] =>
  obstacles.filter(
    (obstacle) => obstacle.position.x + obstacle.size.width >= cameraLeftX,
  )
