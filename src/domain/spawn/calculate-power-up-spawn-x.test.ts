import { describe, expect, it } from 'vitest'

import { calculatePowerUpSpawnX } from './calculate-power-up-spawn-x'

describe('calculatePowerUpSpawnX', () => {
  it('keeps the default spawn position when no obstacle was spawned', () => {
    expect(calculatePowerUpSpawnX(600, false, 64)).toBe(600)
  })

  it('moves the power-up ahead of a newly spawned obstacle', () => {
    expect(calculatePowerUpSpawnX(600, true, 64)).toBe(664)
  })

  it('uses the configured obstacle clearance', () => {
    expect(calculatePowerUpSpawnX(600, true, 96)).toBe(696)
  })
})
