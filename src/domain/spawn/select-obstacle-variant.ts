import {
  OBSTACLE_VARIANT,
  type ObstacleVariant,
} from '../obstacle/obstacle-variant'
import type { ObstacleType } from '../obstacle/obstacle-type'

import { OBSTACLE_TYPE } from '../obstacle/obstacle-type'
import type { Random } from '../random/random'

const VARIANTS_BY_TYPE: Record<ObstacleType, readonly ObstacleVariant[]> = {
  [OBSTACLE_TYPE.GROUND_SMALL]: [
    OBSTACLE_VARIANT.MUNCHER,
    OBSTACLE_VARIANT.NIPPERPLANT,
    OBSTACLE_VARIANT.SPINY,
  ],
  [OBSTACLE_TYPE.GROUND_TALL]: [OBSTACLE_VARIANT.PTOOIE],
  [OBSTACLE_TYPE.AIR]: [OBSTACLE_VARIANT.CANNONBALL, OBSTACLE_VARIANT.HAMMER],
}

export const selectObstacleVariant = (
  random: Random,
  type: ObstacleType,
): ObstacleVariant => {
  const variants = VARIANTS_BY_TYPE[type]
  const index = random.nextInt(0, variants.length - 1)

  return variants[index]
}
