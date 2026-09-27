export const collectibleTypes = {
  COIN: 'coin',
  MEDAL: 'medal',
} as const

export type CollectibleType =
  (typeof collectibleTypes)[keyof typeof collectibleTypes]
