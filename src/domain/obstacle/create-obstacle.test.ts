import { describe, expect, it } from 'vitest'
import { defaultGameplayConfig } from '../config/default-gameplay-config'
import { OBSTACLE_TYPE } from './obstacle-type'
import { createObstacle } from './create-obstacle'

describe('createObstacle', () => {
  it('creates a ground obstacle from its configuration', () => {
    const obstacle = createObstacle({
      id: 'obstacle-1',
      type: OBSTACLE_TYPE.GROUND_SMALL,
      x: 800,
      config: defaultGameplayConfig.obstacles.GROUND_SMALL,
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
      collisionBounds: {
        offsetX: 2,
        offsetY: 2,
        width: 28,
        height: 30,
      },
      velocity: {
        x: -280,
        y: 0,
      },
    })
  })

  it('uses the configured ground offset for the vertical position', () => {
    const obstacle = createObstacle({
      id: 'obstacle-1',
      type: OBSTACLE_TYPE.GROUND_SMALL,
      x: 800,
      config: {
        ...defaultGameplayConfig.obstacles.GROUND_SMALL,
        groundOffset: 12,
      },
      velocityX: -280,
    })

    expect(obstacle.position.y).toBe(12)
  })

  it('uses the configured dimensions', () => {
    const obstacle = createObstacle({
      id: 'obstacle-1',
      type: OBSTACLE_TYPE.GROUND_SMALL,
      x: 800,
      config: {
        ...defaultGameplayConfig.obstacles.GROUND_SMALL,
        width: 40,
        height: 48,
      },
      velocityX: -280,
    })

    expect(obstacle.size).toEqual({
      width: 40,
      height: 48,
    })
  })

  it('keeps collision bounds independent from visual dimensions', () => {
    const obstacle = createObstacle({
      id: 'obstacle-1',
      type: OBSTACLE_TYPE.GROUND_SMALL,
      x: 800,
      config: {
        ...defaultGameplayConfig.obstacles.GROUND_SMALL,
        width: 40,
        height: 48,
        collisionBounds: {
          offsetX: 4,
          offsetY: 6,
          width: 28,
          height: 34,
        },
      },
      velocityX: -280,
    })

    expect(obstacle.size).toEqual({
      width: 40,
      height: 48,
    })

    expect(obstacle.collisionBounds).toEqual({
      offsetX: 4,
      offsetY: 6,
      width: 28,
      height: 34,
    })
  })

  it('uses the provided horizontal velocity', () => {
    const obstacle = createObstacle({
      id: 'obstacle-1',
      type: OBSTACLE_TYPE.GROUND_SMALL,
      x: 800,
      config: defaultGameplayConfig.obstacles.GROUND_SMALL,
      velocityX: -320,
    })

    expect(obstacle.velocity).toEqual({
      x: -320,
      y: 0,
    })
  })
})
