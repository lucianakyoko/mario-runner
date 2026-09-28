import { describe, expect, it } from 'vitest'

import { addScore } from './add-score'
import type { Score } from './score'

describe('addScore', () => {
  it('adds points to the current score', () => {
    const score: Score = {
      value: 0,
    }

    expect(addScore(score, 1)).toEqual({
      value: 1,
    })
  })

  it('adds points to an existing score', () => {
    const score: Score = {
      value: 5,
    }

    expect(addScore(score, 2)).toEqual({
      value: 7,
    })
  })

  it('does not mutate the original score', () => {
    const score: Score = {
      value: 5,
    }

    const updatedScore = addScore(score, 2)

    expect(updatedScore).not.toBe(score)
    expect(score).toEqual({
      value: 5,
    })
  })
})
