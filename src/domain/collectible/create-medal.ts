import type { CollectibleConfig } from '../config/gameplay-config'
import { collectibleTypes } from './collectible-type'
import type { Collectible } from './collectible'

export interface CreateMedalParams {
  id: string
  x: number
  config: CollectibleConfig
  velocityX: number
}

export const createMedal = ({
  id,
  x,
  config,
  velocityX,
}: CreateMedalParams): Collectible => ({
  id,
  type: collectibleTypes.MEDAL,
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
