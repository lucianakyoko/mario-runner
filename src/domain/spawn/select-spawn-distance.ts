import type { Random } from '../random/random'

export const selectSpawnDistance = (
  random: Random,
  minDistance: number,
  maxDistance: number,
): number => random.nextInt(minDistance, maxDistance)
