export const OBSTACLE_TYPE = {
  GROUND_SMALL: 'GROUND_SMALL',
  GROUND_TALL: 'GROUND_TALL',
  AIR: 'AIR',
} as const

export type ObstacleType = (typeof OBSTACLE_TYPE)[keyof typeof OBSTACLE_TYPE]
