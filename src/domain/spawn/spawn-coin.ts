import type { CollectibleConfig } from '../config/gameplay-config'
import type { Collectible } from '../collectible/collectible'
import { createCoin } from '../collectible/create-coin'
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
}

export interface SpawnCoinResult {
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
}: SpawnCoinParams): SpawnCoinResult => {
  if (state.distanceSinceLastSpawn < state.nextSpawnDistance) {
    return {
      coins,
    }
  }

  if (random.next() >= collectibleChance) {
    return {
      coins,
    }
  }

  const coin = createCoin({
    id: coinId,
    x: spawnX,
    config: coinConfig,
    velocityX,
  })

  return {
    coins: [...coins, coin],
  }
}
