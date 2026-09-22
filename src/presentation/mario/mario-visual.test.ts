import { describe, expect, it } from 'vitest'

import { createMarioVisual, createMarioVisualForState } from './mario-visual'

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

describe('createMarioVisualForState', () => {
  it('creates the running representation', () => {
    const visual = createMarioVisualForState('SMALL', 'RUNNING')

    expect(visual).toEqual({
      variant: 'SMALL',
      width: 32,
      height: 48,
      offsetX: 0,
      offsetY: 0,
      movementState: 'RUNNING',
    })
  })

  it('creates a distinct jumping representation', () => {
    const visual = createMarioVisualForState('SMALL', 'JUMPING')

    expect(visual).toEqual({
      variant: 'SMALL',
      width: 34,
      height: 48,
      offsetX: -1,
      offsetY: 0,
      movementState: 'JUMPING',
    })
  })

  it('creates a distinct falling representation', () => {
    const visual = createMarioVisualForState('SMALL', 'FALLING')

    expect(visual).toEqual({
      variant: 'SMALL',
      width: 30,
      height: 46,
      offsetX: 1,
      offsetY: 2,
      movementState: 'FALLING',
    })
  })

  it('creates a lower crouching representation', () => {
    const visual = createMarioVisualForState('SMALL', 'CROUCHING')

    expect(visual).toEqual({
      variant: 'SMALL',
      width: 36,
      height: 32,
      offsetX: -2,
      offsetY: 0,
      movementState: 'CROUCHING',
    })
  })

  it('preserves the big Mario variant across movement states', () => {
    const visual = createMarioVisualForState('BIG', 'CROUCHING')

    expect(visual.variant).toBe('BIG')
    expect(visual.movementState).toBe('CROUCHING')
    expect(visual.width).toBe(36)
    expect(visual.height).toBe(32)
  })
})
