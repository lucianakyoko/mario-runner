import type { Random } from '../random/random'

export const shouldSpawnPowerUp = (
  random: Random,
  spawnChance: number,
): boolean => random.next() < spawnChance
