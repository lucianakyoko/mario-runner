import { describe, expect, it } from 'vitest'

import { createGameOverVisual } from './game-over-visual'

describe('createGameOverVisual', () => {
  it('creates the Game Over visual representation', () => {
    expect(createGameOverVisual()).toEqual({
      title: 'GAME OVER',
      instruction: 'PRESS RESTART',
    })
  })
})
