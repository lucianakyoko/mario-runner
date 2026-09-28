import { describe, expect, it } from 'vitest'

import type { CollectibleConfig } from '../config/gameplay-config'
import type { Random } from '../random/random'
import { spawnCoin } from './spawn-coin'
import type { SpawnState } from './spawn-state'

const coinConfig: CollectibleConfig = {
  width: 24,
  height: 24,
  groundOffset: 48,
  speed: 280,
  collisionBounds: {
    offsetX: 2,
    offsetY: 2,
    width: 20,
    height: 20,
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

describe('spawnCoin', () => {
  it('does not spawn before reaching the required distance', () => {
    const state: SpawnState = {
      distanceSinceLastSpawn: 299,
      nextSpawnDistance: 300,
    }

    const result = spawnCoin({
      state,
      coins: [],
      random: createRandom(0),
      collectibleChance: 0.25,
      coinConfig,
      spawnX: 800,
      coinId: 'coin-1',
      velocityX: -280,
      minSpawnDistance: 300,
      maxSpawnDistance: 500,
    })

    expect(result.state).toEqual(state)
    expect(result.coins).toEqual([])
  })

  it('does not spawn when the collectible chance is not reached', () => {
    const result = spawnCoin({
      state: createState(),
      coins: [],
      random: createRandom(0.25),
      collectibleChance: 0.25,
      coinConfig,
      spawnX: 800,
      coinId: 'coin-1',
      velocityX: -280,
      minSpawnDistance: 300,
      maxSpawnDistance: 500,
    })

    expect(result.state.distanceSinceLastSpawn).toBe(0)
    expect(result.coins).toEqual([])
  })

  it('creates a coin when the spawn distance and chance are reached', () => {
    const result = spawnCoin({
      state: createState(),
      coins: [],
      random: createRandom(0.1),
      collectibleChance: 0.25,
      coinConfig,
      spawnX: 800,
      coinId: 'coin-1',
      velocityX: -280,
      minSpawnDistance: 300,
      maxSpawnDistance: 500,
    })

    expect(result.state.distanceSinceLastSpawn).toBe(0)

    expect(result.coins).toEqual([
      {
        id: 'coin-1',
        type: 'coin',
        position: {
          x: 800,
          y: -48,
        },
        size: {
          width: 24,
          height: 24,
        },
        collisionBounds: {
          offsetX: 2,
          offsetY: 2,
          width: 20,
          height: 20,
        },
        velocity: {
          x: -280,
          y: 0,
        },
        isCollected: false,
      },
    ])
  })

  it('preserves existing coins', () => {
    const existingCoin = {
      id: 'coin-existing',
      type: 'coin' as const,
      position: {
        x: 600,
        y: 48,
      },
      size: {
        width: 24,
        height: 24,
      },
      collisionBounds: {
        offsetX: 2,
        offsetY: 2,
        width: 20,
        height: 20,
      },
      velocity: {
        x: -280,
        y: 0,
      },
      isCollected: false,
    }

    const result = spawnCoin({
      state: createState(),
      coins: [existingCoin],
      random: createRandom(0.1),
      collectibleChance: 0.25,
      coinConfig,
      spawnX: 800,
      coinId: 'coin-2',
      velocityX: -280,
      minSpawnDistance: 300,
      maxSpawnDistance: 500,
    })

    expect(result.state.distanceSinceLastSpawn).toBe(0)
    expect(result.coins).toHaveLength(2)
    expect(result.coins[0]).toEqual(existingCoin)
    expect(result.coins[1].id).toBe('coin-2')
  })
})
