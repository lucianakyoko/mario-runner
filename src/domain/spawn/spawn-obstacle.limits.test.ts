import { describe, expect, it } from 'vitest'

import { SeededRandom } from '../../infrastructure/random/seeded-random'
import type { Obstacle } from '../obstacle/obstacle'
import { OBSTACLE_TYPE } from '../obstacle/obstacle-type'
import { spawnObstacle } from './spawn-obstacle'
import type { SpawnState } from './spawn-state'

const MIN_DISTANCE = 320
const MAX_DISTANCE = 700

const obstacleConfigs = {
  [OBSTACLE_TYPE.GROUND_SMALL]: {
    width: 32,
    height: 32,
    groundOffset: 0,
    speed: 280,
  },
  [OBSTACLE_TYPE.GROUND_TALL]: {
    width: 32,
    height: 48,
    groundOffset: 0,
    speed: 280,
  },
  [OBSTACLE_TYPE.AIR]: {
    width: 32,
    height: 24,
    groundOffset: 64,
    speed: 280,
  },
}

describe('spawnObstacle distance limits', () => {
  it('keeps every selected spawn distance within the configured limits', () => {
    const random = new SeededRandom(12345)

    let state: SpawnState = {
      distanceSinceLastSpawn: MIN_DISTANCE,
      nextSpawnDistance: MIN_DISTANCE,
    }

    let obstacles: Obstacle[] = []

    for (let index = 0; index < 100; index += 1) {
      const result = spawnObstacle({
        state,
        obstacles,
        random,
        minDistance: MIN_DISTANCE,
        maxDistance: MAX_DISTANCE,
        obstacleConfigs,
        spawnX: 800,
        velocityX: -280,
        obstacleId: `obstacle-${index}`,
      })

      state = result.state
      obstacles = result.obstacles

      expect(state.nextSpawnDistance).toBeGreaterThanOrEqual(MIN_DISTANCE)

      expect(state.nextSpawnDistance).toBeLessThanOrEqual(MAX_DISTANCE)

      state = {
        ...state,
        distanceSinceLastSpawn: state.nextSpawnDistance,
      }
    }
  })
})
