export interface CalculateLevelParams {
  score: number
  pointsPerLevel: number
}

export const calculateLevel = ({
  score,
  pointsPerLevel,
}: CalculateLevelParams): number => Math.floor(score / pointsPerLevel) + 1
