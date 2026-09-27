import type { CollectibleConfig } from '../config/gameplay-config'
import type { Collectible } from '../collectible/collectible'
import {
  collectibleTypes,
  type CollectibleType,
} from '../collectible/collectible-type'
import { createCoin } from '../collectible/create-coin'
import { createMedal } from '../collectible/create-medal'
import type { Random } from '../random/random'
import type { SpawnState } from './spawn-state'

export interface SpawnCollectibleParams {
  state: SpawnState
  collectibles: Collectible[]
  random: Random
  collectibleChance: number
  coinSpawnWeight: number
  medalSpawnWeight: number
  coinConfig: CollectibleConfig
  medalConfig: CollectibleConfig
  spawnX: number
  collectibleIds: Record<CollectibleType, string>
  velocityX: number
}

export interface SpawnCollectibleResult {
  collectibles: Collectible[]
}

const selectCollectibleType = (
  randomValue: number,
  coinSpawnWeight: number,
  medalSpawnWeight: number,
): CollectibleType => {
  const totalWeight = coinSpawnWeight + medalSpawnWeight

  if (totalWeight <= 0) {
    return collectibleTypes.COIN
  }

  const normalizedCoinWeight = coinSpawnWeight / totalWeight

  return randomValue < normalizedCoinWeight
    ? collectibleTypes.COIN
    : collectibleTypes.MEDAL
}

export const spawnCollectible = ({
  state,
  collectibles,
  random,
  collectibleChance,
  coinSpawnWeight,
  medalSpawnWeight,
  coinConfig,
  medalConfig,
  spawnX,
  collectibleIds,
  velocityX,
}: SpawnCollectibleParams): SpawnCollectibleResult => {
  if (state.distanceSinceLastSpawn < state.nextSpawnDistance) {
    return {
      collectibles,
    }
  }

  if (random.next() >= collectibleChance) {
    return {
      collectibles,
    }
  }

  const type = selectCollectibleType(
    random.next(),
    coinSpawnWeight,
    medalSpawnWeight,
  )

  const collectible =
    type === collectibleTypes.COIN
      ? createCoin({
          id: collectibleIds[type],
          x: spawnX,
          config: coinConfig,
          velocityX,
        })
      : createMedal({
          id: collectibleIds[type],
          x: spawnX,
          config: medalConfig,
          velocityX,
        })

  return {
    collectibles: [...collectibles, collectible],
  }
}
