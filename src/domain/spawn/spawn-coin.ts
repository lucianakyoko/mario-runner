import type { CollectibleConfig } from '../config/gameplay-config'
import type { Collectible } from '../collectible/collectible'
import { collectibleTypes } from '../collectible/collectible-type'
import { spawnCollectible } from './spawn-collectible'
import type { Random } from '../random/random'
import type { SpawnState } from './spawn-state'

export interface SpawnCoinParams {
  state: SpawnState
  coins: Collectible[]
  random: Random
  collectibleChance: number
  coinConfig: CollectibleConfig
  spawnX: number
  coinId: string
  velocityX: number
  minSpawnDistance: number
  maxSpawnDistance: number
}

export interface SpawnCoinResult {
  state: SpawnState
  coins: Collectible[]
}

export const spawnCoin = ({
  state,
  coins,
  random,
  collectibleChance,
  coinConfig,
  spawnX,
  coinId,
  velocityX,
  minSpawnDistance,
  maxSpawnDistance,
}: SpawnCoinParams): SpawnCoinResult => {
  const result = spawnCollectible({
    state,
    collectibles: coins,
    random,
    collectibleChance,
    coinSpawnWeight: 1,
    medalSpawnWeight: 0,
    coinConfig,
    medalConfig: coinConfig,
    spawnX,
    collectibleIds: {
      [collectibleTypes.COIN]: coinId,
      [collectibleTypes.MEDAL]: coinId,
    },
    velocityX,
    minSpawnDistance,
    maxSpawnDistance,
  })

  return {
    state: result.state,
    coins: result.collectibles,
  }
}
