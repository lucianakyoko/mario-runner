export const POWER_UP_TYPE = {
  MUSHROOM: 'mushroom',
} as const

export type PowerUpType = (typeof POWER_UP_TYPE)[keyof typeof POWER_UP_TYPE]
