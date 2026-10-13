import { describe, expect, it } from 'vitest'

import type { Obstacle } from './obstacle'
import { OBSTACLE_TYPE } from './obstacle-type'
import { removeOffscreenObstacles } from './remove-offscreen-obstacles'

const createObstacle = (x: number): Obstacle => ({
  id: `obstacle-${x}`,
  type: OBSTACLE_TYPE.GROUND_SMALL,
  variant: 'MUNCHER',
  position: {
    x,
    y: 0,
  },
  size: {
    width: 32,
    height: 32,
  },
  collisionBounds: {
    offsetX: 0,
    offsetY: 0,
    width: 32,
    height: 32,
  },
  velocity: {
    x: -280,
    y: 0,
  },
})

describe('removeOffscreenObstacles', () => {
  it('keeps obstacles at or ahead of the camera left edge', () => {
    const obstacles = [createObstacle(110), createObstacle(80)]

    expect(removeOffscreenObstacles(obstacles, 100)).toEqual(obstacles)
  })

  it('removes obstacles completely behind the camera', () => {
    const visible = createObstacle(80)
    const offscreen = createObstacle(60)

    expect(removeOffscreenObstacles([visible, offscreen], 100)).toEqual([
      visible,
    ])
  })

  it('keeps an obstacle whose right edge touches the camera boundary', () => {
    const obstacle = createObstacle(68)

    expect(removeOffscreenObstacles([obstacle], 100)).toEqual([obstacle])
  })

  it('returns an empty collection when every obstacle is behind the camera', () => {
    expect(
      removeOffscreenObstacles([createObstacle(10), createObstacle(40)], 100),
    ).toEqual([])
  })

  it('does not mutate the original collection', () => {
    const obstacles = [createObstacle(10), createObstacle(120)]

    removeOffscreenObstacles(obstacles, 100)

    expect(obstacles).toHaveLength(2)
  })
})
