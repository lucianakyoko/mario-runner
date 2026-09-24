import type { Random } from '../random/random'
import { OBSTACLE_TYPE, type ObstacleType } from '../obstacle/obstacle-type'

const OBSTACLE_TYPES: ObstacleType[] = [
  OBSTACLE_TYPE.GROUND_SMALL,
  OBSTACLE_TYPE.GROUND_TALL,
  OBSTACLE_TYPE.AIR,
]

export const selectObstacleType = (random: Random): ObstacleType => {
  const index = random.nextInt(0, OBSTACLE_TYPES.length - 1)

  return OBSTACLE_TYPES[index]
}
