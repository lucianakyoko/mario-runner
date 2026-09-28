import { describe, expect, it } from 'vitest'

import type { CollectibleConfig } from '../config/gameplay-config'
import type { Random } from '../random/random'
import { collectibleTypes } from '../collectible/collectible-type'
import { spawnCollectible } from './spawn-collectible'
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

const medalConfig: CollectibleConfig = {
  width: 32,
  height: 32,
  groundOffset: 64,
  speed: 280,
  collisionBounds: {
    offsetX: 4,
    offsetY: 3,
    width: 24,
    height: 26,
  },
}

const createState = (): SpawnState => ({
  distanceSinceLastSpawn: 300,
  nextSpawnDistance: 300,
})

const createRandom = (values: number[]): Random => {
  let index = 0

  return {
    next: () => values[index++] ?? 0,
    nextInt: (min) => min,
  }
}

const createParams = (
  random: Random,
  collectibles: Parameters<typeof spawnCollectible>[0]['collectibles'] = [],
) => ({
  state: createState(),
  collectibles,
  random,
  collectibleChance: 0.25,
  coinSpawnWeight: 0.8,
  medalSpawnWeight: 0.2,
  coinConfig,
  medalConfig,
  spawnX: 800,
  collectibleIds: {
    [collectibleTypes.COIN]: 'coin-1',
    [collectibleTypes.MEDAL]: 'medal-1',
  },
  velocityX: -280,
  minSpawnDistance: 300,
  maxSpawnDistance: 500,
})

describe('spawnCollectible', () => {
  it('does not spawn before reaching the required distance', () => {
    const state: SpawnState = {
      distanceSinceLastSpawn: 299,
      nextSpawnDistance: 300,
    }

    const result = spawnCollectible({
      ...createParams(createRandom([0])),
      state,
    })

    expect(result.state).toEqual(state)
    expect(result.collectibles).toEqual([])
  })

  it('resets the spawn state when the collectible chance is not reached', () => {
    const result = spawnCollectible(createParams(createRandom([0.25, 0.9])))

    expect(result.state.distanceSinceLastSpawn).toBe(0)
    expect(result.state.nextSpawnDistance).toBeGreaterThanOrEqual(300)
    expect(result.state.nextSpawnDistance).toBeLessThanOrEqual(500)
    expect(result.collectibles).toEqual([])
  })

  it('spawns a medal when the type selection falls outside the coin weight', () => {
    const result = spawnCollectible(createParams(createRandom([0.1, 0.8])))

    expect(result.state.distanceSinceLastSpawn).toBe(0)
    expect(result.state.nextSpawnDistance).toBeGreaterThanOrEqual(300)
    expect(result.state.nextSpawnDistance).toBeLessThanOrEqual(500)

    expect(result.collectibles).toEqual([
      {
        id: 'medal-1',
        type: collectibleTypes.MEDAL,
        position: { x: 800, y: -64 },
        size: { width: 32, height: 32 },
        collisionBounds: { offsetX: 4, offsetY: 3, width: 24, height: 26 },
        velocity: { x: -280, y: 0 },
        isCollected: false,
      },
    ])
  })

  it('preserves existing collectibles when spawning a medal', () => {
    const existingCoin = {
      id: 'coin-existing',
      type: collectibleTypes.COIN,
      position: { x: 600, y: 48 },
      size: { width: 24, height: 24 },
      collisionBounds: { offsetX: 2, offsetY: 2, width: 20, height: 20 },
      velocity: { x: -280, y: 0 },
      isCollected: false,
    }

    const result = spawnCollectible(
      createParams(createRandom([0.1, 0.8]), [existingCoin]),
    )

    expect(result.state.distanceSinceLastSpawn).toBe(0)
    expect(result.collectibles).toHaveLength(2)
    expect(result.collectibles[0]).toEqual(existingCoin)
    expect(result.collectibles[1]).toEqual({
      id: 'medal-1',
      type: collectibleTypes.MEDAL,
      position: { x: 800, y: -64 },
      size: { width: 32, height: 32 },
      collisionBounds: { offsetX: 4, offsetY: 3, width: 24, height: 26 },
      velocity: { x: -280, y: 0 },
      isCollected: false,
    })
  })
})
