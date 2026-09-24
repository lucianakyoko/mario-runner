import { describe, expect, it } from 'vitest'

import type { Obstacle } from './obstacle'
import { OBSTACLE_TYPE } from './obstacle-type'
import { removeOffscreenObstacles } from './remove-offscreen-obstacles'

const createObstacle = (x: number): Obstacle => ({
  id: `obstacle-${x}`,
  type: OBSTACLE_TYPE.GROUND_SMALL,
  position: {
    x,
    y: 0,
  },
  size: {
    width: 32,
    height: 32,
  },
  velocity: {
    x: -280,
    y: 0,
  },
})

describe('removeOffscreenObstacles', () => {
  it('keeps obstacles that are still visible', () => {
    const obstacles = [createObstacle(10), createObstacle(-20)]

    const result = removeOffscreenObstacles(obstacles)

    expect(result).toEqual(obstacles)
  })

  it('removes obstacles that are completely outside the world', () => {
    const visible = createObstacle(40)
    const offscreen = createObstacle(-40)

    const result = removeOffscreenObstacles([visible, offscreen])

    expect(result).toEqual([visible])
  })

  it('returns an empty collection when every obstacle is offscreen', () => {
    const result = removeOffscreenObstacles([
      createObstacle(-50),
      createObstacle(-80),
    ])

    expect(result).toEqual([])
  })

  it('does not mutate the original collection', () => {
    const obstacles = [createObstacle(-40), createObstacle(20)]

    removeOffscreenObstacles(obstacles)

    expect(obstacles).toHaveLength(2)
  })
})
