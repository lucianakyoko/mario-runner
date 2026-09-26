import type { ObstacleConfig } from '../config/gameplay-config'
import type { Obstacle } from '../obstacle/obstacle'
import type { ObstacleType } from '../obstacle/obstacle-type'

export interface CreateObstacleParams {
  id: string
  type: ObstacleType
  x: number
  config: ObstacleConfig
  velocityX: number
}

export const createObstacle = ({
  id,
  type,
  x,
  config,
  velocityX,
}: CreateObstacleParams): Obstacle => ({
  id,
  type,
  position: {
    x,
    y: config.groundOffset,
  },
  size: {
    width: config.width,
    height: config.height,
  },
  collisionBounds: config.collisionBounds,
  velocity: {
    x: velocityX,
    y: 0,
  },
})
