import type { CollectibleConfig } from '../config/gameplay-config'
import { collectibleTypes } from './collectible-type'
import type { Collectible } from './collectible'

export interface CreateCoinParams {
  id: string
  x: number
  config: CollectibleConfig
  velocityX: number
}

export const createCoin = ({
  id,
  x,
  config,
  velocityX,
}: CreateCoinParams): Collectible => ({
  id,
  type: collectibleTypes.COIN,
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
  isCollected: false,
})
