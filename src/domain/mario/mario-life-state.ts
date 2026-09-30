export const marioLifeState = {
  ALIVE: 'ALIVE',
  DEAD: 'DEAD',
} as const

export type MarioLifeState =
  (typeof marioLifeState)[keyof typeof marioLifeState]
