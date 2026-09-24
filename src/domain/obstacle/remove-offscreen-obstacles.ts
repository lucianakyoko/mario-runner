import type { Obstacle } from './obstacle'

export const removeOffscreenObstacles = (obstacles: Obstacle[]): Obstacle[] =>
  obstacles.filter((obstacle) => obstacle.position.x + obstacle.size.width >= 0)
