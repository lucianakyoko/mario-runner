import { describe, expect, it } from 'vitest'

import { Clock } from './clock'

describe('Clock', () => {
  it('returns zero deltaTime and elapsedTime on the first tick', () => {
    const clock = new Clock(() => 1000)

    expect(clock.tick()).toEqual({
      deltaTime: 0,
      elapsedTime: 0,
    })
  })

  it('calculates deltaTime in seconds from consecutive timestamps', () => {
    const timestamps = [1000, 1250]
    let index = 0

    const clock = new Clock(() => timestamps[index++] ?? 0)

    clock.tick()

    expect(clock.tick()).toEqual({
      deltaTime: 0.25,
      elapsedTime: 0.25,
    })
  })

  it('accumulates elapsedTime across ticks', () => {
    const timestamps = [1000, 1500, 2300]
    let index = 0

    const clock = new Clock(() => timestamps[index++] ?? 0)

    clock.tick()

    expect(clock.tick()).toEqual({
      deltaTime: 0.5,
      elapsedTime: 0.5,
    })

    expect(clock.tick()).toEqual({
      deltaTime: 0.8,
      elapsedTime: 1.3,
    })
  })
})
