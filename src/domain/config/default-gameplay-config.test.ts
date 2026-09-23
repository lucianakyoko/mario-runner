import { describe, expect, it } from 'vitest'

import { defaultGameplayConfig } from './default-gameplay-config'

describe('default gameplay configuration', () => {
  it('defines the expected scoring and progression values', () => {
    expect(defaultGameplayConfig.scoring.coinPoints).toBe(1)
    expect(defaultGameplayConfig.scoring.medalPoints).toBe(2)
    expect(defaultGameplayConfig.progression.pointsPerLevel).toBe(20)
  })

  it('defines the expected scenario values', () => {
    expect(defaultGameplayConfig.scenario.speed).toBe(280)
    expect(defaultGameplayConfig.scenario.background.id).toBe('default')
  })

  it('defines the ground position through physics configuration', () => {
    expect(defaultGameplayConfig.physics.groundY).toBe(0)
  })
})
