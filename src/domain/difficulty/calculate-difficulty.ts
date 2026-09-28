import type { DifficultyConfig } from '../config/gameplay-config'
import type { Difficulty } from './difficulty'

export interface CalculateDifficultyParams {
  level: number
  initialDifficulty: Difficulty
  config: DifficultyConfig
}

export const calculateDifficulty = ({
  level,
  initialDifficulty,
  config,
}: CalculateDifficultyParams): Difficulty => {
  const progressionSteps = Math.max(0, level - 1)

  return {
    obstacleSpeed:
      initialDifficulty.obstacleSpeed +
      progressionSteps * config.obstacleSpeedIncrease,
    obstacleMinDistance: Math.max(
      1,
      initialDifficulty.obstacleMinDistance -
        progressionSteps * config.obstacleMinDistanceDecrease,
    ),
    obstacleMaxDistance: Math.max(
      initialDifficulty.obstacleMinDistance,
      initialDifficulty.obstacleMaxDistance -
        progressionSteps * config.obstacleMaxDistanceDecrease,
    ),
  }
}
