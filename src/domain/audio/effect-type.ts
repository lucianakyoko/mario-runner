export const effectTypes = {
  JUMP: 'jump',
  COIN: 'coin',
  MEDAL: 'medal',
  POWER_UP: 'power-up',
  LOSE_POWER: 'lose-power',
  DEATH: 'death',
  CANNON_FIRE: 'cannon-fire',
} as const

export type EffectType = (typeof effectTypes)[keyof typeof effectTypes]
