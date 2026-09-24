import { describe, expect, it } from 'vitest'

import { createObstacle } from './create-obstacle'
import { OBSTACLE_TYPE } from '../obstacle/obstacle-type'

describe('createObstacle', () => {
  it('creates a ground obstacle from its configuration', () => {
    const obstacle = createObstacle({
      id: 'obstacle-1',
      type: OBSTACLE_TYPE.GROUND_SMALL,
      x: 800,
      config: {
        width: 32,
        height: 32,
        groundOffset: 0,
        speed: 280,
      },
      velocityX: -280,
    })

    expect(obstacle).toEqual({
      id: 'obstacle-1',
      type: OBSTACLE_TYPE.GROUND_SMALL,
      position: {
        x: 800,
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
  })

  it('uses the configured ground offset for the vertical position', () => {
    const obstacle = createObstacle({
      id: 'obstacle-2',
      type: OBSTACLE_TYPE.AIR,
      x: 900,
      config: {
        width: 32,
        height: 24,
        groundOffset: 64,
        speed: 280,
      },
      velocityX: -280,
    })

    expect(obstacle.position).toEqual({
      x: 900,
      y: 64,
    })
  })

  it('uses the configured dimensions', () => {
    const obstacle = createObstacle({
      id: 'obstacle-3',
      type: OBSTACLE_TYPE.GROUND_TALL,
      x: 1000,
      config: {
        width: 32,
        height: 48,
        groundOffset: 0,
        speed: 280,
      },
      velocityX: -300,
    })

    expect(obstacle.size).toEqual({
      width: 32,
      height: 48,
    })
  })

  it('uses the provided horizontal velocity', () => {
    const obstacle = createObstacle({
      id: 'obstacle-4',
      type: OBSTACLE_TYPE.GROUND_SMALL,
      x: 800,
      config: {
        width: 32,
        height: 32,
        groundOffset: 0,
        speed: 280,
      },
      velocityX: -320,
    })

    expect(obstacle.velocity).toEqual({
      x: -320,
      y: 0,
    })
  })
})
