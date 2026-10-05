export const effectTypes = {
  JUMP: 'jump',
  COIN: 'coin',
  MEDAL: 'medal',
  POWER_UP: 'power-up',
  GROW: 'grow',
  LOSE_POWER: 'lose-power',
  DEATH: 'death',
  GAME_OVER: 'game-over',
} as const

export type EffectType = (typeof effectTypes)[keyof typeof effectTypes]
