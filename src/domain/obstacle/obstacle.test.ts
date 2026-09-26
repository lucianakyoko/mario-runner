import { describe, expect, it } from 'vitest'

import { OBSTACLE_TYPE } from './obstacle-type'
import type { Obstacle } from './obstacle'
import { getObstacleCollisionBounds } from './obstacle'

describe('Obstacle', () => {
  it('represents a small ground obstacle', () => {
    const obstacle: Obstacle = {
      id: 'obstacle-1',
      type: OBSTACLE_TYPE.GROUND_SMALL,
      position: {
        x: 400,
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
    }

    expect(obstacle).toEqual({
      id: 'obstacle-1',
      type: OBSTACLE_TYPE.GROUND_SMALL,
      position: {
        x: 400,
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

  it('represents a tall ground obstacle', () => {
    const obstacle: Obstacle = {
      id: 'obstacle-2',
      type: OBSTACLE_TYPE.GROUND_TALL,
      position: {
        x: 600,
        y: 0,
      },
      size: {
        width: 32,
        height: 48,
      },
      collisionBounds: {
        offsetX: 2,
        offsetY: 2,
        width: 28,
        height: 46,
      },
      velocity: {
        x: -280,
        y: 0,
      },
    }

    expect(obstacle.type).toBe(OBSTACLE_TYPE.GROUND_TALL)
    expect(obstacle.position).toEqual({
      x: 600,
      y: 0,
    })
    expect(obstacle.size).toEqual({
      width: 32,
      height: 48,
    })
    expect(obstacle.collisionBounds).toEqual({
      offsetX: 2,
      offsetY: 2,
      width: 28,
      height: 46,
    })
    expect(obstacle.velocity).toEqual({
      x: -280,
      y: 0,
    })
  })

  it('represents an air obstacle with independent vertical movement', () => {
    const obstacle: Obstacle = {
      id: 'obstacle-3',
      type: OBSTACLE_TYPE.AIR,
      position: {
        x: 800,
        y: 64,
      },
      size: {
        width: 32,
        height: 24,
      },
      collisionBounds: {
        offsetX: 2,
        offsetY: 2,
        width: 28,
        height: 20,
      },
      velocity: {
        x: -280,
        y: 40,
      },
    }

    expect(obstacle.type).toBe(OBSTACLE_TYPE.AIR)
    expect(obstacle.position).toEqual({
      x: 800,
      y: 64,
    })
    expect(obstacle.size).toEqual({
      width: 32,
      height: 24,
    })
    expect(obstacle.collisionBounds).toEqual({
      offsetX: 2,
      offsetY: 2,
      width: 28,
      height: 20,
    })
    expect(obstacle.velocity).toEqual({
      x: -280,
      y: 40,
    })
  })

  it('keeps obstacle identity independent from its type', () => {
    const firstObstacle: Obstacle = {
      id: 'obstacle-1',
      type: OBSTACLE_TYPE.GROUND_SMALL,
      position: {
        x: 400,
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
    }

    const secondObstacle: Obstacle = {
      id: 'obstacle-2',
      type: OBSTACLE_TYPE.GROUND_SMALL,
      position: {
        x: 600,
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
    }

    expect(firstObstacle.id).not.toBe(secondObstacle.id)
    expect(firstObstacle.type).toBe(secondObstacle.type)
  })
})

describe('getObstacleCollisionBounds', () => {
  it('creates collision bounds from obstacle position and configured bounds', () => {
    const obstacle: Obstacle = {
      id: 'obstacle-1',
      type: OBSTACLE_TYPE.GROUND_SMALL,
      position: {
        x: 100,
        y: 200,
      },
      size: {
        width: 40,
        height: 48,
      },
      collisionBounds: {
        offsetX: 4,
        offsetY: 6,
        width: 28,
        height: 34,
      },
      velocity: {
        x: -280,
        y: 0,
      },
    }

    expect(getObstacleCollisionBounds(obstacle)).toEqual({
      x: 104,
      y: 206,
      width: 28,
      height: 34,
    })
  })

  it('follows obstacle position without depending on visual dimensions', () => {
    const obstacle: Obstacle = {
      id: 'obstacle-1',
      type: OBSTACLE_TYPE.GROUND_TALL,
      position: {
        x: 100,
        y: 200,
      },
      size: {
        width: 64,
        height: 80,
      },
      collisionBounds: {
        offsetX: 3,
        offsetY: 5,
        width: 24,
        height: 40,
      },
      velocity: {
        x: -280,
        y: 0,
      },
    }

    obstacle.position.x = 180
    obstacle.position.y = 140

    expect(getObstacleCollisionBounds(obstacle)).toEqual({
      x: 183,
      y: 145,
      width: 24,
      height: 40,
    })

    expect(obstacle.size).toEqual({
      width: 64,
      height: 80,
    })
  })

  it('keeps collision bounds independent from the obstacle visual area', () => {
    const obstacle: Obstacle = {
      id: 'obstacle-1',
      type: OBSTACLE_TYPE.AIR,
      position: {
        x: 300,
        y: 120,
      },
      size: {
        width: 96,
        height: 64,
      },
      collisionBounds: {
        offsetX: 8,
        offsetY: 4,
        width: 32,
        height: 20,
      },
      velocity: {
        x: -280,
        y: 0,
      },
    }

    expect(getObstacleCollisionBounds(obstacle)).toEqual({
      x: 308,
      y: 124,
      width: 32,
      height: 20,
    })
  })
})
