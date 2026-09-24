import { describe, expect, it } from 'vitest'

import type { ObstacleConfigs } from '../config/gameplay-config'
import type { Difficulty } from '../difficulty/difficulty'
import { OBSTACLE_TYPE } from '../obstacle/obstacle-type'
import type { Obstacle } from '../obstacle/obstacle'
import type { Random } from '../random/random'
import { spawnObstacle } from './spawn-obstacle'
import type { SpawnState } from './spawn-state'

const obstacleConfigs: ObstacleConfigs = {
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

const difficulty: Difficulty = {
  obstacleSpeed: 280,
  obstacleMinDistance: 320,
  obstacleMaxDistance: 700,
}

const createState = (): SpawnState => ({
  distanceSinceLastSpawn: 300,
  nextSpawnDistance: 300,
})

const createRandom = (): Random => ({
  next: () => 0,
  nextInt: (min, max) => {
    if (min === 0 && max === 2) {
      return 0
    }

    return min
  },
})

describe('spawnObstacle', () => {
  it('does not spawn before reaching the required distance', () => {
    const state: SpawnState = {
      distanceSinceLastSpawn: 299,
      nextSpawnDistance: 300,
    }

    const result = spawnObstacle({
      state,
      obstacles: [],
      random: createRandom(),
      difficulty,
      obstacleConfigs,
      spawnX: 800,
      obstacleId: 'obstacle-1',
    })

    expect(result).toEqual({
      state,
      obstacles: [],
    })
  })

  it('creates and adds an obstacle when the required distance is reached', () => {
    const result = spawnObstacle({
      state: createState(),
      obstacles: [],
      random: createRandom(),
      difficulty,
      obstacleConfigs,
      spawnX: 800,
      obstacleId: 'obstacle-1',
    })

    expect(result.obstacles).toHaveLength(1)
    expect(result.obstacles[0]).toEqual({
      id: 'obstacle-1',
      type: OBSTACLE_TYPE.GROUND_SMALL,
      position: {
        x: 800,
        y: 0,
      },
      size: {
        width: 32,
        height: 32,
      },
      velocity: {
        x: -280,
        y: 0,
      },
    })
  })

  it('uses the difficulty to select the next spawn distance', () => {
    const result = spawnObstacle({
      state: createState(),
      obstacles: [],
      random: createRandom(),
      difficulty,
      obstacleConfigs,
      spawnX: 800,
      obstacleId: 'obstacle-1',
    })

    expect(result.state).toEqual({
      distanceSinceLastSpawn: 0,
      nextSpawnDistance: 320,
    })
  })

  it('uses the difficulty to determine obstacle speed', () => {
    const result = spawnObstacle({
      state: createState(),
      obstacles: [],
      random: createRandom(),
      difficulty: {
        ...difficulty,
        obstacleSpeed: 420,
      },
      obstacleConfigs,
      spawnX: 800,
      obstacleId: 'obstacle-1',
    })

    expect(result.obstacles[0].velocity.x).toBe(-420)
  })

  it('preserves existing obstacles', () => {
    const existingObstacle: Obstacle = {
      id: 'obstacle-existing',
      type: OBSTACLE_TYPE.GROUND_TALL,
      position: {
        x: 600,
        y: 0,
      },
      size: {
        width: 32,
        height: 48,
      },
      velocity: {
        x: -280,
        y: 0,
      },
    }

    const result = spawnObstacle({
      state: createState(),
      obstacles: [existingObstacle],
      random: createRandom(),
      difficulty,
      obstacleConfigs,
      spawnX: 800,
      obstacleId: 'obstacle-1',
    })

    expect(result.obstacles).toHaveLength(2)
    expect(result.obstacles[0]).toEqual(existingObstacle)
    expect(result.obstacles[1].id).toBe('obstacle-1')
  })
})
