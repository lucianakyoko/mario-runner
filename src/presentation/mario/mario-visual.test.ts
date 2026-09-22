import { describe, expect, it } from 'vitest'

import { createMarioVisual } from './mario-visual'

describe('createMarioVisual', () => {
  it('creates a small Mario visual representation', () => {
    const visual = createMarioVisual('SMALL', 'RUNNING', 32, 48, 0, 0)

    expect(visual).toEqual({
      variant: 'SMALL',
      width: 32,
      height: 48,
      offsetX: 0,
      offsetY: 0,
      movementState: 'RUNNING',
    })
  })

  it('supports a big Mario visual representation', () => {
    const visual = createMarioVisual('BIG', 'RUNNING', 32, 64, 0, -16)

    expect(visual).toEqual({
      variant: 'BIG',
      width: 32,
      height: 64,
      offsetX: 0,
      offsetY: -16,
      movementState: 'RUNNING',
    })
  })

  it('preserves the movement state', () => {
    const visual = createMarioVisual('SMALL', 'CROUCHING', 32, 48, 0, 0)

    expect(visual.movementState).toBe('CROUCHING')
  })
})
