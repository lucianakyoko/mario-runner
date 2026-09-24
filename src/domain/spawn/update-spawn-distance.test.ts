import { describe, expect, it } from 'vitest'

import { updateSpawnDistance } from './update-spawn-distance'

describe('updateSpawnDistance', () => {
  it('adds the traveled distance to the current spawn distance', () => {
    const state = {
      distanceSinceLastSpawn: 100,
      nextSpawnDistance: 300,
    }

    const updatedState = updateSpawnDistance(state, 75)

    expect(updatedState).toEqual({
      distanceSinceLastSpawn: 175,
      nextSpawnDistance: 300,
    })
  })

  it('preserves the original state', () => {
    const state = {
      distanceSinceLastSpawn: 100,
      nextSpawnDistance: 300,
    }

    updateSpawnDistance(state, 75)

    expect(state).toEqual({
      distanceSinceLastSpawn: 100,
      nextSpawnDistance: 300,
    })
  })

  it('handles zero traveled distance', () => {
    const state = {
      distanceSinceLastSpawn: 100,
      nextSpawnDistance: 300,
    }

    const updatedState = updateSpawnDistance(state, 0)

    expect(updatedState).toEqual(state)
  })
})
