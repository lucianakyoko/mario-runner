import { describe, expect, it } from 'vitest'

import { SeededRandom } from '../../infrastructure/random/seeded-random'
import type { ObstacleConfigs } from '../config/gameplay-config'
import type { Difficulty } from '../difficulty/difficulty'
import type { Obstacle } from '../obstacle/obstacle'
import { OBSTACLE_TYPE } from '../obstacle/obstacle-type'
import { spawnObstacle } from './spawn-obstacle'
import type { SpawnState } from './spawn-state'

const obstacleConfigs: ObstacleConfigs = {
  [OBSTACLE_TYPE.GROUND_SMALL]: {
    width: 32,
    height: 32,
    groundOffset: 0,
    speed: 280,
    collisionBounds: {
      offsetX: 2,
      offsetY: 2,
      width: 28,
      height: 30,
    },
  },
  [OBSTACLE_TYPE.GROUND_TALL]: {
    width: 32,
    height: 48,
    groundOffset: 0,
    speed: 280,
    collisionBounds: {
      offsetX: 2,
      offsetY: 2,
      width: 28,
      height: 46,
    },
  },
  [OBSTACLE_TYPE.AIR]: {
    width: 32,
    height: 24,
    groundOffset: 64,
    speed: 280,
    collisionBounds: {
      offsetX: 2,
      offsetY: 2,
      width: 28,
      height: 20,
    },
  },
}

const difficulty: Difficulty = {
  obstacleSpeed: 280,
  obstacleMinDistance: 320,
  obstacleMaxDistance: 700,
}

const spawn = (
  random: SeededRandom,
  state: SpawnState,
  obstacles: Obstacle[],
  id: string,
) =>
  spawnObstacle({
    state,
    obstacles,
    random,
    difficulty,
    obstacleConfigs,
    spawnX: 800,
    obstacleId: id,
  })

const generateSequence = (seed: number) => {
  const random = new SeededRandom(seed)

  let state: SpawnState = {
    distanceSinceLastSpawn: 320,
    nextSpawnDistance: 320,
  }

  let obstacles: Obstacle[] = []

  const sequence: Array<{
    type: Obstacle['type']
    variant: Obstacle['variant']
    nextSpawnDistance: number
  }> = []

  for (let index = 0; index < 10; index += 1) {
    const result = spawn(random, state, obstacles, `obstacle-${index}`)

    state = result.state
    obstacles = result.obstacles

    sequence.push({
      type: obstacles[index].type,
      variant: obstacles[index].variant,
      nextSpawnDistance: state.nextSpawnDistance,
    })

    state = {
      ...state,
      distanceSinceLastSpawn: state.nextSpawnDistance,
    }
  }

  return sequence
}

describe('spawnObstacle deterministic sequence', () => {
  it('produces the same types, variants and distances with the same seed', () => {
    const firstSequence = generateSequence(12345)
    const secondSequence = generateSequence(12345)

    expect(firstSequence).toEqual(secondSequence)
  })

  it('produces a different sequence with a different seed', () => {
    const firstSequence = generateSequence(12345)
    const secondSequence = generateSequence(67890)

    expect(firstSequence).not.toEqual(secondSequence)
  })
})
