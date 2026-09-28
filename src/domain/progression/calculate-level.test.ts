import { describe, expect, it } from 'vitest'

import { calculateLevel } from './calculate-level'

describe('calculateLevel', () => {
  const pointsPerLevel = 20

  it('starts at level 1', () => {
    expect(calculateLevel({ score: 0, pointsPerLevel })).toBe(1)
  })

  it('keeps level 1 below the first threshold', () => {
    expect(calculateLevel({ score: 1, pointsPerLevel })).toBe(1)
    expect(calculateLevel({ score: 19, pointsPerLevel })).toBe(1)
  })

  it('starts level 2 at 20 points', () => {
    expect(calculateLevel({ score: 20, pointsPerLevel })).toBe(2)
  })

  it('keeps level 2 until 39 points', () => {
    expect(calculateLevel({ score: 21, pointsPerLevel })).toBe(2)
    expect(calculateLevel({ score: 39, pointsPerLevel })).toBe(2)
  })

  it('starts level 3 at 40 points', () => {
    expect(calculateLevel({ score: 40, pointsPerLevel })).toBe(3)
  })

  it('supports higher scores deterministically', () => {
    expect(calculateLevel({ score: 99, pointsPerLevel })).toBe(5)
    expect(calculateLevel({ score: 100, pointsPerLevel })).toBe(6)
  })

  it('uses the configured threshold', () => {
    expect(calculateLevel({ score: 30, pointsPerLevel: 10 })).toBe(4)
  })
})
