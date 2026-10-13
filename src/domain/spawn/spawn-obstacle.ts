import type { ObstacleConfigs } from '../config/gameplay-config'
import type { Difficulty } from '../difficulty/difficulty'
import type { Obstacle } from '../obstacle/obstacle'
import { createObstacle } from '../obstacle/create-obstacle'
import type { Random } from '../random/random'
import { selectObstacleType } from './select-obstacle-type'
import { selectObstacleVariant } from './select-obstacle-variant'
import { selectSpawnDistance } from './select-spawn-distance'
import type { SpawnState } from './spawn-state'

export interface SpawnObstacleParams {
  state: SpawnState
  obstacles: Obstacle[]
  random: Random
  difficulty: Difficulty
  obstacleConfigs: ObstacleConfigs
  spawnX: number
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
  difficulty,
  obstacleConfigs,
  spawnX,
  obstacleId,
}: SpawnObstacleParams): SpawnObstacleResult => {
  if (state.distanceSinceLastSpawn < state.nextSpawnDistance) {
    return {
      state,
      obstacles,
    }
  }

  const type = selectObstacleType(random)
  const variant = selectObstacleVariant(random, type)
  const config = obstacleConfigs[type]

  const obstacle = createObstacle({
    id: obstacleId,
    type,
    variant,
    x: spawnX,
    config,
    velocityX: -difficulty.obstacleSpeed,
  })

  return {
    state: {
      distanceSinceLastSpawn: 0,
      nextSpawnDistance: selectSpawnDistance(
        random,
        difficulty.obstacleMinDistance,
        difficulty.obstacleMaxDistance,
      ),
    },
    obstacles: [...obstacles, obstacle],
  }
}
