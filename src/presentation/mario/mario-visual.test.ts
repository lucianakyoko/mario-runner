import { describe, expect, it } from 'vitest'

import {
  createAnimatedMarioVisual,
  createMarioVisual,
  createMarioVisualForState,
} from './mario-visual'

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
      animationFrame: 0,
    })
  })

  it('supports a big Mario visual representation', () => {
    const visual = createMarioVisual('BIG', 'RUNNING', 32, 64, 0, 0)

    expect(visual).toEqual({
      variant: 'BIG',
      width: 32,
      height: 64,
      offsetX: 0,
      offsetY: 0,
      movementState: 'RUNNING',
      animationFrame: 0,
    })
  })

  it('supports a dead Mario visual representation', () => {
    const visual = createMarioVisual('DEAD', 'RUNNING', 32, 48, 0, 0)

    expect(visual).toEqual({
      variant: 'DEAD',
      width: 32,
      height: 48,
      offsetX: 0,
      offsetY: 0,
      movementState: 'RUNNING',
      animationFrame: 0,
    })
  })

  it('preserves the movement state', () => {
    const visual = createMarioVisual('SMALL', 'CROUCHING', 32, 48, 0, 0)

    expect(visual.movementState).toBe('CROUCHING')
  })
})

describe('createMarioVisualForState', () => {
  it('creates the small running representation', () => {
    const visual = createMarioVisualForState('SMALL', 'RUNNING')

    expect(visual).toEqual({
      variant: 'SMALL',
      width: 32,
      height: 48,
      offsetX: 0,
      offsetY: 0,
      movementState: 'RUNNING',
      animationFrame: 0,
    })
  })

  it('creates the big running representation', () => {
    const visual = createMarioVisualForState('BIG', 'RUNNING')

    expect(visual).toEqual({
      variant: 'BIG',
      width: 32,
      height: 64,
      offsetX: 0,
      offsetY: 0,
      movementState: 'RUNNING',
      animationFrame: 0,
    })
  })

  it('preserves the dead variant in the running representation', () => {
    const visual = createMarioVisualForState('DEAD', 'RUNNING')

    expect(visual).toEqual({
      variant: 'DEAD',
      width: 32,
      height: 48,
      offsetX: 0,
      offsetY: 0,
      movementState: 'RUNNING',
      animationFrame: 0,
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
      animationFrame: 0,
    })
  })

  it('creates the big jumping representation', () => {
    const visual = createMarioVisualForState('BIG', 'JUMPING')

    expect(visual).toEqual({
      variant: 'BIG',
      width: 34,
      height: 64,
      offsetX: -1,
      offsetY: 0,
      movementState: 'JUMPING',
      animationFrame: 0,
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
      animationFrame: 0,
    })
  })

  it('creates the big falling representation', () => {
    const visual = createMarioVisualForState('BIG', 'FALLING')

    expect(visual).toEqual({
      variant: 'BIG',
      width: 30,
      height: 62,
      offsetX: 1,
      offsetY: 2,
      movementState: 'FALLING',
      animationFrame: 0,
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
      animationFrame: 0,
    })
  })

  it('creates the big crouching representation', () => {
    const visual = createMarioVisualForState('BIG', 'CROUCHING')

    expect(visual).toEqual({
      variant: 'BIG',
      width: 36,
      height: 48,
      offsetX: -2,
      offsetY: 0,
      movementState: 'CROUCHING',
      animationFrame: 0,
    })
  })
})

describe('createAnimatedMarioVisual', () => {
  it('uses the first small running frame at the beginning', () => {
    const visual = createAnimatedMarioVisual('SMALL', 'RUNNING', 0, 0.1)

    expect(visual).toEqual({
      variant: 'SMALL',
      width: 32,
      height: 48,
      offsetX: 0,
      offsetY: 0,
      movementState: 'RUNNING',
      animationFrame: 0,
    })
  })

  it('uses the first big running frame at the beginning', () => {
    const visual = createAnimatedMarioVisual('BIG', 'RUNNING', 0, 0.1)

    expect(visual).toEqual({
      variant: 'BIG',
      width: 32,
      height: 64,
      offsetX: 0,
      offsetY: 0,
      movementState: 'RUNNING',
      animationFrame: 0,
    })
  })

  it('switches to the second small running frame after one frame duration', () => {
    const visual = createAnimatedMarioVisual('SMALL', 'RUNNING', 0.1, 0.1)

    expect(visual).toEqual({
      variant: 'SMALL',
      width: 34,
      height: 46,
      offsetX: -1,
      offsetY: 2,
      movementState: 'RUNNING',
      animationFrame: 1,
    })
  })

  it('switches big Mario frames without changing its geometry', () => {
    const firstFrame = createAnimatedMarioVisual('BIG', 'RUNNING', 0, 0.1)
    const secondFrame = createAnimatedMarioVisual('BIG', 'RUNNING', 0.1, 0.1)

    expect(firstFrame.animationFrame).toBe(0)
    expect(secondFrame.animationFrame).toBe(1)

    expect(secondFrame).toMatchObject({
      variant: 'BIG',
      width: 32,
      height: 64,
      offsetX: 0,
      offsetY: 0,
      movementState: 'RUNNING',
    })
  })

  it('loops back to the first small running frame', () => {
    const visual = createAnimatedMarioVisual('SMALL', 'RUNNING', 0.2, 0.1)

    expect(visual).toEqual({
      variant: 'SMALL',
      width: 32,
      height: 48,
      offsetX: 0,
      offsetY: 0,
      movementState: 'RUNNING',
      animationFrame: 0,
    })
  })

  it('does not animate non-running states', () => {
    const visual = createAnimatedMarioVisual('SMALL', 'JUMPING', 0.5, 0.1)

    expect(visual).toEqual({
      variant: 'SMALL',
      width: 34,
      height: 48,
      offsetX: -1,
      offsetY: 0,
      movementState: 'JUMPING',
      animationFrame: 0,
    })
  })
})
