import { describe, expect, it } from 'vitest'
import { OBSTACLE_TYPE } from './obstacle-type'
import type { Obstacle } from './obstacle'

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
  })

  it('represents an air obstacle', () => {
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
    }

    expect(firstObstacle.id).not.toBe(secondObstacle.id)
    expect(firstObstacle.type).toBe(secondObstacle.type)
  })
})
