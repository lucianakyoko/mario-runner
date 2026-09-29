import { describe, expect, it } from 'vitest'

import type { PowerUpConfig } from '../config/gameplay-config'
import type { PowerUp } from '../power-up/power-up'
import type { Random } from '../random/random'
import type { SpawnState } from './spawn-state'
import { spawnMushroom } from './spawn-mushroom'

const mushroomConfig: PowerUpConfig = {
  width: 32,
  height: 32,
  groundOffset: 0,
  speed: 280,
  collisionBounds: {
    offsetX: 2,
    offsetY: 2,
    width: 28,
    height: 28,
  },
}

const createState = (): SpawnState => ({
  distanceSinceLastSpawn: 300,
  nextSpawnDistance: 300,
})

const createRandom = (value: number): Random => ({
  next: () => value,
  nextInt: (min) => min,
})

describe('spawnMushroom', () => {
  it('should create a mushroom with the provided id', () => {
    const result = spawnMushroom({
      state: createState(),
      powerUps: [],
      random: createRandom(0),
      powerUpChance: 0.05,
      mushroomConfig,
      spawnX: 600,
      mushroomId: 'mushroom-1',
      velocityX: -280,
      minSpawnDistance: 320,
      maxSpawnDistance: 700,
    })

    expect(result.powerUps).toHaveLength(1)
    expect(result.powerUps[0].id).toBe('mushroom-1')
  })

  it('should preserve existing power-ups and add the new mushroom', () => {
    const existingMushroom: PowerUp = {
      id: 'mushroom-1',
      type: 'mushroom',
      position: {
        x: 400,
        y: 0,
      },
      size: {
        width: 32,
        height: 32,
      },
      collisionBounds: {
        offsetX: 2,
        offsetY: 2,
        width: 28,
        height: 28,
      },
      velocity: {
        x: -280,
        y: 0,
      },
      isCollected: false,
    }

    const result = spawnMushroom({
      state: createState(),
      powerUps: [existingMushroom],
      random: createRandom(0),
      powerUpChance: 0.05,
      mushroomConfig,
      spawnX: 600,
      mushroomId: 'mushroom-2',
      velocityX: -280,
      minSpawnDistance: 320,
      maxSpawnDistance: 700,
    })

    expect(result.powerUps).toHaveLength(2)
    expect(result.powerUps.map((powerUp) => powerUp.id)).toEqual([
      'mushroom-1',
      'mushroom-2',
    ])
  })
})
