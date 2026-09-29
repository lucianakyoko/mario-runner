import { describe, expect, it } from 'vitest'

import { defaultGameplayConfig } from './default-gameplay-config'

describe('defaultGameplayConfig power-up spawn', () => {
  it('should expose the mushroom spawn configuration', () => {
    expect(defaultGameplayConfig.spawn.powerUpChance).toBe(0.05)
    expect(defaultGameplayConfig.spawn.powerUpMinDistance).toBe(320)
    expect(defaultGameplayConfig.spawn.powerUpMaxDistance).toBe(700)
  })
})
