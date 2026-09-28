import { describe, expect, it } from 'vitest'

import type { DifficultyConfig } from '../config/gameplay-config'
import type { Difficulty } from './difficulty'
import { calculateDifficulty } from './calculate-difficulty'

const config: DifficultyConfig = {
  progressionInterval: 10,
  obstacleSpeedIncrease: 10,
  obstacleMinDistanceDecrease: 10,
  obstacleMaxDistanceDecrease: 20,
}

const initialDifficulty: Difficulty = {
  obstacleSpeed: 280,
  obstacleMinDistance: 320,
  obstacleMaxDistance: 700,
}

describe('calculateDifficulty', () => {
  it('preserves the initial difficulty at level 1', () => {
    expect(
      calculateDifficulty({
        level: 1,
        initialDifficulty,
        config,
      }),
    ).toEqual(initialDifficulty)
  })

  it('applies one progression step at level 2', () => {
    expect(
      calculateDifficulty({
        level: 2,
        initialDifficulty,
        config,
      }),
    ).toEqual({
      obstacleSpeed: 290,
      obstacleMinDistance: 310,
      obstacleMaxDistance: 680,
    })
  })

  it('applies multiple progression steps', () => {
    expect(
      calculateDifficulty({
        level: 4,
        initialDifficulty,
        config,
      }),
    ).toEqual({
      obstacleSpeed: 310,
      obstacleMinDistance: 290,
      obstacleMaxDistance: 640,
    })
  })

  it('produces the same result for the same level', () => {
    const first = calculateDifficulty({
      level: 3,
      initialDifficulty,
      config,
    })

    const second = calculateDifficulty({
      level: 3,
      initialDifficulty,
      config,
    })

    expect(first).toEqual(second)
  })

  it('does not allow invalid spawn distances', () => {
    const difficulty = calculateDifficulty({
      level: 999,
      initialDifficulty,
      config,
    })

    expect(difficulty.obstacleMinDistance).toBeGreaterThanOrEqual(1)
    expect(difficulty.obstacleMaxDistance).toBeGreaterThanOrEqual(
      difficulty.obstacleMinDistance,
    )
  })

  it('progresses monotonically with level', () => {
    const level1 = calculateDifficulty({
      level: 1,
      initialDifficulty,
      config,
    })

    const level2 = calculateDifficulty({
      level: 2,
      initialDifficulty,
      config,
    })

    const level3 = calculateDifficulty({
      level: 3,
      initialDifficulty,
      config,
    })

    expect(level2.obstacleSpeed).toBeGreaterThan(level1.obstacleSpeed)
    expect(level3.obstacleSpeed).toBeGreaterThan(level2.obstacleSpeed)

    expect(level2.obstacleMinDistance).toBeLessThan(level1.obstacleMinDistance)
    expect(level3.obstacleMinDistance).toBeLessThan(level2.obstacleMinDistance)

    expect(level2.obstacleMaxDistance).toBeLessThan(level1.obstacleMaxDistance)
    expect(level3.obstacleMaxDistance).toBeLessThan(level2.obstacleMaxDistance)
  })

  it('uses the configured progression values', () => {
    const customConfig: DifficultyConfig = {
      progressionInterval: 5,
      obstacleSpeedIncrease: 25,
      obstacleMinDistanceDecrease: 15,
      obstacleMaxDistanceDecrease: 30,
    }

    expect(
      calculateDifficulty({
        level: 3,
        initialDifficulty,
        config: customConfig,
      }),
    ).toEqual({
      obstacleSpeed: 330,
      obstacleMinDistance: 290,
      obstacleMaxDistance: 640,
    })
  })
})
