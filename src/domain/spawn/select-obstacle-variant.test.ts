import { describe, expect, it } from 'vitest'

import type { Random } from '../random/random'
import { OBSTACLE_TYPE } from '../obstacle/obstacle-type'
import { OBSTACLE_VARIANT } from '../obstacle/obstacle-variant'
import { selectObstacleVariant } from './select-obstacle-variant'

describe('selectObstacleVariant', () => {
  it('selects a small ground obstacle variant using the random index', () => {
    const random: Random = {
      next: () => 0,
      nextInt: () => 1,
    }

    expect(selectObstacleVariant(random, OBSTACLE_TYPE.GROUND_SMALL)).toBe(
      OBSTACLE_VARIANT.NIPPERPLANT,
    )
  })

  it('selects the tall ground obstacle variant', () => {
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

    expect(selectObstacleVariant(random, OBSTACLE_TYPE.GROUND_TALL)).toBe(
      OBSTACLE_VARIANT.PTOOIE,
    )

    expect(receivedMin).toBe(0)
    expect(receivedMax).toBe(0)
  })

  it('selects the second air obstacle variant when the random index is one', () => {
    const random: Random = {
      next: () => 0,
      nextInt: () => 1,
    }

    expect(selectObstacleVariant(random, OBSTACLE_TYPE.AIR)).toBe(
      OBSTACLE_VARIANT.HAMMER,
    )
  })

  it('requests an index within the available small ground variants', () => {
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

    selectObstacleVariant(random, OBSTACLE_TYPE.GROUND_SMALL)

    expect(receivedMin).toBe(0)
    expect(receivedMax).toBe(2)
  })

  it('requests an index within the available air variants', () => {
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

    selectObstacleVariant(random, OBSTACLE_TYPE.AIR)

    expect(receivedMin).toBe(0)
    expect(receivedMax).toBe(1)
  })
})
