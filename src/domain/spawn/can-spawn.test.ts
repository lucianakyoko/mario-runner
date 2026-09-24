import { describe, expect, it } from 'vitest'

import { canSpawn } from './can-spawn'

describe('canSpawn', () => {
  it('returns false before reaching the next spawn distance', () => {
    expect(
      canSpawn({
        distanceSinceLastSpawn: 299,
        nextSpawnDistance: 300,
      }),
    ).toBe(false)
  })

  it('returns true when the next spawn distance is reached', () => {
    expect(
      canSpawn({
        distanceSinceLastSpawn: 300,
        nextSpawnDistance: 300,
      }),
    ).toBe(true)
  })

  it('returns true when the traveled distance exceeds the next spawn distance', () => {
    expect(
      canSpawn({
        distanceSinceLastSpawn: 350,
        nextSpawnDistance: 300,
      }),
    ).toBe(true)
  })
})
