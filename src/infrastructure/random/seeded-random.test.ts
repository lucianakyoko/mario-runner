import { describe, expect, it } from 'vitest'

import { SeededRandom } from './seeded-random'

describe('SeededRandom', () => {
  it('generates values between zero inclusive and one exclusive', () => {
    const random = new SeededRandom(123)

    for (let index = 0; index < 100; index += 1) {
      const value = random.next()

      expect(value).toBeGreaterThanOrEqual(0)
      expect(value).toBeLessThan(1)
    }
  })

  it('generates integers within the inclusive range', () => {
    const random = new SeededRandom(123)

    for (let index = 0; index < 100; index += 1) {
      const value = random.nextInt(2, 5)

      expect(value).toBeGreaterThanOrEqual(2)
      expect(value).toBeLessThanOrEqual(5)
      expect(Number.isInteger(value)).toBe(true)
    }
  })

  it('generates a single value when the range has the same minimum and maximum', () => {
    const random = new SeededRandom(123)

    expect(random.nextInt(7, 7)).toBe(7)
  })

  it('generates the same sequence for the same seed', () => {
    const firstRandom = new SeededRandom(123)
    const secondRandom = new SeededRandom(123)

    const firstSequence = Array.from({ length: 10 }, () => firstRandom.next())

    const secondSequence = Array.from({ length: 10 }, () => secondRandom.next())

    expect(firstSequence).toEqual(secondSequence)
  })

  it('generates the same integer sequence for the same seed', () => {
    const firstRandom = new SeededRandom(123)
    const secondRandom = new SeededRandom(123)

    const firstSequence = Array.from({ length: 10 }, () =>
      firstRandom.nextInt(1, 10),
    )

    const secondSequence = Array.from({ length: 10 }, () =>
      secondRandom.nextInt(1, 10),
    )

    expect(firstSequence).toEqual(secondSequence)
  })

  it('can generate different sequences for different seeds', () => {
    const firstRandom = new SeededRandom(123)
    const secondRandom = new SeededRandom(456)

    const firstSequence = Array.from({ length: 10 }, () => firstRandom.next())

    const secondSequence = Array.from({ length: 10 }, () => secondRandom.next())

    expect(firstSequence).not.toEqual(secondSequence)
  })

  it('resets the sequence to the initial seed', () => {
    const random = new SeededRandom(123)

    const firstSequence = Array.from({ length: 10 }, () => random.next())

    random.reset()

    const secondSequence = Array.from({ length: 10 }, () => random.next())

    expect(secondSequence).toEqual(firstSequence)
  })
})
