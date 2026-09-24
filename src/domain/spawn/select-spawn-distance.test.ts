import { describe, expect, it } from 'vitest'

import type { Random } from '../random/random'
import { selectSpawnDistance } from './select-spawn-distance'

describe('selectSpawnDistance', () => {
  it('selects a distance using the configured range', () => {
    const random: Random = {
      next: () => 0.5,
      nextInt: () => 500,
    }

    const distance = selectSpawnDistance(random, 320, 700)

    expect(distance).toBe(500)
  })

  it('passes the configured limits to the random generator', () => {
    let receivedMin: number | undefined
    let receivedMax: number | undefined

    const random: Random = {
      next: () => 0,
      nextInt: (min, max) => {
        receivedMin = min
        receivedMax = max

        return min
      },
    }

    selectSpawnDistance(random, 320, 700)

    expect(receivedMin).toBe(320)
    expect(receivedMax).toBe(700)
  })
})
