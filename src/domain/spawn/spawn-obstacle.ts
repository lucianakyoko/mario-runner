import type { ObstacleConfig } from '../config/gameplay-config'
import type { Obstacle } from '../obstacle/obstacle'
import { createObstacle } from '../obstacle/create-obstacle'
import type { Random } from '../random/random'
import { selectObstacleType } from './select-obstacle-type'
import { selectSpawnDistance } from './select-spawn-distance'
import type { SpawnState } from './spawn-state'

export interface SpawnObstacleParams {
  state: SpawnState
  obstacles: Obstacle[]
  random: Random
  minDistance: number
  maxDistance: number
  obstacleConfigs: Record<Obstacle['type'], ObstacleConfig>
  spawnX: number
  velocityX: number
  obstacleId: string
}

export interface SpawnObstacleResult {
  state: SpawnState
  obstacles: Obstacle[]
}

export const spawnObstacle = ({
  state,
  obstacles,
  random,
  minDistance,
  maxDistance,
  obstacleConfigs,
  spawnX,
  velocityX,
  obstacleId,
}: SpawnObstacleParams): SpawnObstacleResult => {
  if (state.distanceSinceLastSpawn < state.nextSpawnDistance) {
    return {
      state,
      obstacles,
    }
  }

  const type = selectObstacleType(random)
  const config = obstacleConfigs[type]

  const obstacle = createObstacle({
    id: obstacleId,
    type,
    x: spawnX,
    config,
    velocityX,
  })

  return {
    state: {
      distanceSinceLastSpawn: 0,
      nextSpawnDistance: selectSpawnDistance(random, minDistance, maxDistance),
    },
    obstacles: [...obstacles, obstacle],
  }
}
