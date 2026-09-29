import { describe, expect, it } from 'vitest'

import type { Random } from '../random/random'
import { shouldSpawnPowerUp } from './should-spawn-power-up'

const createRandom = (value: number): Random => ({
  next: () => value,
  nextInt: () => 0,
})

describe('shouldSpawnPowerUp', () => {
  it('should spawn when the random value is below the configured chance', () => {
    const random = createRandom(0.04)

    expect(shouldSpawnPowerUp(random, 0.05)).toBe(true)
  })

  it('should not spawn when the random value is equal to the configured chance', () => {
    const random = createRandom(0.05)

    expect(shouldSpawnPowerUp(random, 0.05)).toBe(false)
  })

  it('should not spawn when the random value is above the configured chance', () => {
    const random = createRandom(0.06)

    expect(shouldSpawnPowerUp(random, 0.05)).toBe(false)
  })
})
