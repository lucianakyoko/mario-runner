import type { Score } from './score'

export const addScore = (score: Score, points: number): Score => ({
  value: score.value + points,
})
