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
  it('preserves the initial difficulty before the first progression interval', () => {
    const difficulty = calculateDifficulty({
      elapsedTime: 9.99,
      initialDifficulty,
      config,
    })

    expect(difficulty).toEqual(initialDifficulty)
  })

  it('applies one progression step after one interval', () => {
    const difficulty = calculateDifficulty({
      elapsedTime: 10,
      initialDifficulty,
      config,
    })

    expect(difficulty).toEqual({
      obstacleSpeed: 290,
      obstacleMinDistance: 310,
      obstacleMaxDistance: 680,
    })
  })

  it('applies multiple progression steps based on elapsed time', () => {
    const difficulty = calculateDifficulty({
      elapsedTime: 35,
      initialDifficulty,
      config,
    })

    expect(difficulty).toEqual({
      obstacleSpeed: 310,
      obstacleMinDistance: 290,
      obstacleMaxDistance: 640,
    })
  })

  it('produces the same difficulty regardless of update frequency', () => {
    const difficultyAt60Fps = calculateDifficulty({
      elapsedTime: 30,
      initialDifficulty,
      config,
    })

    const difficultyAt30Fps = calculateDifficulty({
      elapsedTime: 30,
      initialDifficulty,
      config,
    })

    expect(difficultyAt60Fps).toEqual(difficultyAt30Fps)
  })

  it('does not allow the minimum spawn distance to become invalid', () => {
    const difficulty = calculateDifficulty({
      elapsedTime: 1000,
      initialDifficulty,
      config,
    })

    expect(difficulty.obstacleMinDistance).toBeGreaterThanOrEqual(1)
    expect(difficulty.obstacleMaxDistance).toBeGreaterThanOrEqual(
      difficulty.obstacleMinDistance,
    )
  })

  it('progresses difficulty monotonically as gameplay time increases', () => {
    const initial = calculateDifficulty({
      elapsedTime: 0,
      initialDifficulty,
      config,
    })

    const afterTenSeconds = calculateDifficulty({
      elapsedTime: 10,
      initialDifficulty,
      config,
    })

    const afterTwentySeconds = calculateDifficulty({
      elapsedTime: 20,
      initialDifficulty,
      config,
    })

    expect(afterTenSeconds.obstacleSpeed).toBeGreaterThan(initial.obstacleSpeed)

    expect(afterTwentySeconds.obstacleSpeed).toBeGreaterThan(
      afterTenSeconds.obstacleSpeed,
    )

    expect(afterTenSeconds.obstacleMinDistance).toBeLessThan(
      initial.obstacleMinDistance,
    )

    expect(afterTwentySeconds.obstacleMinDistance).toBeLessThan(
      afterTenSeconds.obstacleMinDistance,
    )

    expect(afterTenSeconds.obstacleMaxDistance).toBeLessThan(
      initial.obstacleMaxDistance,
    )

    expect(afterTwentySeconds.obstacleMaxDistance).toBeLessThan(
      afterTenSeconds.obstacleMaxDistance,
    )
  })

  it('uses configured progression values', () => {
    const customConfig: DifficultyConfig = {
      progressionInterval: 5,
      obstacleSpeedIncrease: 25,
      obstacleMinDistanceDecrease: 15,
      obstacleMaxDistanceDecrease: 30,
    }

    const difficulty = calculateDifficulty({
      elapsedTime: 10,
      initialDifficulty,
      config: customConfig,
    })

    expect(difficulty).toEqual({
      obstacleSpeed: 330,
      obstacleMinDistance: 290,
      obstacleMaxDistance: 640,
    })
  })
})
