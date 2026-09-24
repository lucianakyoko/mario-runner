import type { Obstacle } from './obstacle'

export const updateObstacleMovement = (
  obstacle: Obstacle,
  deltaTime: number,
): Obstacle => ({
  ...obstacle,
  position: {
    x: obstacle.position.x + obstacle.velocity.x * deltaTime,
    y: obstacle.position.y + obstacle.velocity.y * deltaTime,
  },
})
