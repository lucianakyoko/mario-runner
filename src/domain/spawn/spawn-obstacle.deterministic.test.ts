import { describe, expect, it } from 'vitest'

import { OBSTACLE_TYPE } from '../obstacle/obstacle-type'
import type { Obstacle } from '../obstacle/obstacle'
import { SeededRandom } from '../../infrastructure/random/seeded-random'
import { spawnObstacle } from './spawn-obstacle'
import type { SpawnState } from './spawn-state'

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
    minDistance: 320,
    maxDistance: 700,
    obstacleConfigs,
    spawnX: 800,
    velocityX: -280,
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
    nextSpawnDistance: number
  }> = []

  for (let index = 0; index < 10; index += 1) {
    const result = spawn(random, state, obstacles, `obstacle-${index}`)

    state = result.state
    obstacles = result.obstacles

    sequence.push({
      type: obstacles[index].type,
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
  it('produces the same sequence with the same seed', () => {
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
