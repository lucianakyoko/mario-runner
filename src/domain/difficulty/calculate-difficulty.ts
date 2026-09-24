import type { DifficultyConfig } from '../config/gameplay-config'
import type { Difficulty } from './difficulty'

export interface CalculateDifficultyParams {
  elapsedTime: number
  initialDifficulty: Difficulty
  config: DifficultyConfig
}

export const calculateDifficulty = ({
  elapsedTime,
  initialDifficulty,
  config,
}: CalculateDifficultyParams): Difficulty => {
  const progressionSteps = Math.floor(elapsedTime / config.progressionInterval)

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
