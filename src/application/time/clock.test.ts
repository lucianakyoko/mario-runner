import { describe, expect, it } from 'vitest'

import { Clock } from './clock'

describe('Clock', () => {
  it('returns zero deltaTime and elapsedTime on the first tick', () => {
    const clock = new Clock()

    expect(clock.tick(1000)).toEqual({
      deltaTime: 0,
      elapsedTime: 0,
    })
  })

  it('calculates deltaTime in seconds from consecutive timestamps', () => {
    const clock = new Clock()

    clock.tick(1000)

    expect(clock.tick(1250)).toEqual({
      deltaTime: 0.25,
      elapsedTime: 0.25,
    })
  })

  it('accumulates elapsedTime across ticks', () => {
    const clock = new Clock()

    clock.tick(1000)

    expect(clock.tick(1500)).toEqual({
      deltaTime: 0.5,
      elapsedTime: 0.5,
    })

    expect(clock.tick(2300)).toEqual({
      deltaTime: 0.8,
      elapsedTime: 1.3,
    })
  })
})
