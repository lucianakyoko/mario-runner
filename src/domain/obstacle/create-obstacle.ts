import type { ObstacleVariant } from './obstacle-variant'
import type { ObstacleConfig } from '../config/gameplay-config'
import type { Obstacle } from '../obstacle/obstacle'
import type { ObstacleType } from '../obstacle/obstacle-type'

export interface CreateObstacleParams {
  id: string
  type: ObstacleType
  variant: ObstacleVariant
  x: number
  config: ObstacleConfig
  velocityX: number
}

export const createObstacle = ({
  id,
  type,
  variant,
  x,
  config,
  velocityX,
}: CreateObstacleParams): Obstacle => ({
  id,
  type,
  variant,
  position: {
    x,
    y: config.groundOffset === 0 ? 0 : -config.groundOffset,
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
