import { describe, expect, it } from 'vitest'

import { OBSTACLE_TYPE } from './obstacle-type'
import type { Obstacle } from './obstacle'
import { getObstacleCollisionBounds } from './obstacle'

describe('Obstacle', () => {
  it('represents a small ground obstacle', () => {
    const obstacle: Obstacle = {
      id: 'obstacle-1',
      type: OBSTACLE_TYPE.GROUND_SMALL,
      variant: 'MUNCHER',
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
      variant: 'MUNCHER',
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

    expect(getObstacleCollisionBounds(obstacle)).toEqual({
      x: 402,
      y: -30,
      width: 28,
      height: 30,
    })
  })

  it('represents a tall ground obstacle', () => {
    const obstacle: Obstacle = {
      id: 'obstacle-2',
      type: OBSTACLE_TYPE.GROUND_TALL,
      variant: 'PTOOIE',
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
      variant: 'CANNONBALL',
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

    expect(getObstacleCollisionBounds(obstacle)).toEqual({
      x: 802,
      y: 58,
      width: 28,
      height: 20,
    })
  })

  it('keeps obstacle identity independent from its type', () => {
    const firstObstacle: Obstacle = {
      id: 'obstacle-1',
      type: OBSTACLE_TYPE.GROUND_SMALL,
      variant: 'MUNCHER',
      position: { x: 400, y: 0 },
      size: { width: 32, height: 32 },
      collisionBounds: {
        offsetX: 2,
        offsetY: 2,
        width: 28,
        height: 30,
      },
      velocity: { x: -280, y: 0 },
    }

    const secondObstacle: Obstacle = {
      ...firstObstacle,
      id: 'obstacle-2',
    }

    expect(firstObstacle.id).not.toBe(secondObstacle.id)
    expect(firstObstacle.type).toBe(secondObstacle.type)
  })
})
