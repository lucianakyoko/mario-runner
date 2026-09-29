import { describe, expect, it } from 'vitest'

import { defaultGameplayConfig } from '../config/default-gameplay-config'
import { SeededRandom } from '../../infrastructure/random/seeded-random'
import type { PowerUp } from '../power-up/power-up'
import type { SpawnState } from './spawn-state'
import { spawnMushroom } from './spawn-mushroom'
import { updateSpawnDistance } from './update-spawn-distance'

const createInitialState = (): SpawnState => ({
  distanceSinceLastSpawn: defaultGameplayConfig.spawn.powerUpMinDistance,
  nextSpawnDistance: defaultGameplayConfig.spawn.powerUpMinDistance,
})

interface SpawnSequence {
  ids: string[]
  distances: number[]
}

const generateSequence = (seed: number): SpawnSequence => {
  const random = new SeededRandom(seed)

  let state = createInitialState()
  let powerUps: PowerUp[] = []
  let nextMushroomId = 1

  const ids: string[] = []
  const distances: number[] = []

  for (let index = 0; index < 20; index += 1) {
    const result = spawnMushroom({
      state,
      powerUps,
      random,
      powerUpChance: defaultGameplayConfig.spawn.powerUpChance,
      mushroomConfig: defaultGameplayConfig.powerUp,
      spawnX: 600,
      mushroomId: `mushroom-${nextMushroomId}`,
      velocityX: -defaultGameplayConfig.powerUp.speed,
      minSpawnDistance: defaultGameplayConfig.spawn.powerUpMinDistance,
      maxSpawnDistance: defaultGameplayConfig.spawn.powerUpMaxDistance,
    })

    if (result.powerUps.length > powerUps.length) {
      const spawnedPowerUp = result.powerUps[result.powerUps.length - 1]

      ids.push(spawnedPowerUp.id)
      nextMushroomId += 1
    }

    distances.push(result.state.nextSpawnDistance)

    state = result.state
    powerUps = result.powerUps

    state = updateSpawnDistance(
      state,
      defaultGameplayConfig.spawn.powerUpMinDistance,
    )
  }

  return {
    ids,
    distances,
  }
}

describe('spawnMushroom deterministic sequence', () => {
  it('should reproduce the same spawn sequence with the same seed', () => {
    const firstSequence = generateSequence(12345)
    const secondSequence = generateSequence(12345)

    expect(secondSequence).toEqual(firstSequence)
  })

  it('should produce a different sequence with a different seed', () => {
    const firstSequence = generateSequence(12345)
    const secondSequence = generateSequence(54321)

    expect(secondSequence).not.toEqual(firstSequence)
  })
})
