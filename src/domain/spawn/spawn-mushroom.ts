import type { PowerUpConfig } from '../config/gameplay-config'
import type { PowerUp } from '../power-up/power-up'
import { createMushroom } from '../power-up/create-mushroom'
import type { Random } from '../random/random'
import { selectSpawnDistance } from './select-spawn-distance'
import { shouldSpawnPowerUp } from './should-spawn-power-up'
import type { SpawnState } from './spawn-state'

export interface SpawnMushroomParams {
  state: SpawnState
  powerUps: PowerUp[]
  random: Random
  powerUpChance: number
  mushroomConfig: PowerUpConfig
  spawnX: number
  mushroomId: string
  velocityX: number
  minSpawnDistance: number
  maxSpawnDistance: number
}

export interface SpawnMushroomResult {
  state: SpawnState
  powerUps: PowerUp[]
}

export const spawnMushroom = ({
  state,
  powerUps,
  random,
  powerUpChance,
  mushroomConfig,
  spawnX,
  mushroomId,
  velocityX,
  minSpawnDistance,
  maxSpawnDistance,
}: SpawnMushroomParams): SpawnMushroomResult => {
  if (state.distanceSinceLastSpawn < state.nextSpawnDistance) {
    return {
      state,
      powerUps,
    }
  }

  const nextState: SpawnState = {
    distanceSinceLastSpawn: 0,
    nextSpawnDistance: selectSpawnDistance(
      random,
      minSpawnDistance,
      maxSpawnDistance,
    ),
  }

  if (!shouldSpawnPowerUp(random, powerUpChance)) {
    return {
      state: nextState,
      powerUps,
    }
  }

  const mushroom = createMushroom({
    id: mushroomId,
    x: spawnX,
    config: mushroomConfig,
    velocityX,
  })

  return {
    state: nextState,
    powerUps: [...powerUps, mushroom],
  }
}
