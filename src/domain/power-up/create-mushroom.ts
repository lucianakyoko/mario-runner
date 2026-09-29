import type { PowerUpConfig } from '../config/gameplay-config'
import type { PowerUp } from './power-up'
import { POWER_UP_TYPE } from './power-up-type'

export interface CreateMushroomParams {
  id: string
  x: number
  config: PowerUpConfig
  velocityX: number
}

export const createMushroom = ({
  id,
  x,
  config,
  velocityX,
}: CreateMushroomParams): PowerUp => ({
  id,
  type: POWER_UP_TYPE.MUSHROOM,
  position: {
    x,
    y: -config.groundOffset,
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
  isCollected: false,
})
