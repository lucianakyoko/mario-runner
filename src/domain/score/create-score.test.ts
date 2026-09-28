import { describe, expect, it } from 'vitest'

import { createScore } from './create-score'

describe('createScore', () => {
  it('creates a score with zero points', () => {
    expect(createScore()).toEqual({
      value: 0,
    })
  })
})
