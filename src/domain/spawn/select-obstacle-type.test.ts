import { describe, expect, it } from 'vitest'

import type { Random } from '../random/random'
import { OBSTACLE_TYPE } from '../obstacle/obstacle-type'
import { selectObstacleType } from './select-obstacle-type'

describe('selectObstacleType', () => {
  it('selects the first obstacle type when the random index is zero', () => {
    const random: Random = {
      next: () => 0,
      nextInt: () => 0,
    }

    expect(selectObstacleType(random)).toBe(OBSTACLE_TYPE.GROUND_SMALL)
  })

  it('selects the second obstacle type when the random index is one', () => {
    const random: Random = {
      next: () => 0,
      nextInt: () => 1,
    }

    expect(selectObstacleType(random)).toBe(OBSTACLE_TYPE.GROUND_TALL)
  })

  it('selects the air obstacle when the random index is two', () => {
    const random: Random = {
      next: () => 0,
      nextInt: () => 2,
    }

    expect(selectObstacleType(random)).toBe(OBSTACLE_TYPE.AIR)
  })

  it('requests an index within the available obstacle types', () => {
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

    selectObstacleType(random)

    expect(receivedMin).toBe(0)
    expect(receivedMax).toBe(2)
  })
})
