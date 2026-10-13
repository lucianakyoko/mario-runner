import { describe, expect, it } from 'vitest'

import type { Obstacle } from './obstacle'
import { OBSTACLE_TYPE } from './obstacle-type'
import { updateObstaclesMovement } from './update-obstacles-movement'

const createObstacles = (): Obstacle[] => [
  {
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
      offsetX: 0,
      offsetY: 0,
      width: 32,
      height: 32,
    },
    velocity: {
      x: -280,
      y: 0,
    },
  },
  {
    id: 'obstacle-2',
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
      offsetX: 0,
      offsetY: 0,
      width: 32,
      height: 24,
    },
    velocity: {
      x: -250,
      y: 40,
    },
  },
]

describe('updateObstaclesMovement', () => {
  it('updates every obstacle according to elapsed time', () => {
    const obstacles = createObstacles()

    const updatedObstacles = updateObstaclesMovement(obstacles, 0.5)

    expect(updatedObstacles).toEqual([
      {
        ...obstacles[0],
        position: {
          x: 260,
          y: 0,
        },
      },
      {
        ...obstacles[1],
        position: {
          x: 675,
          y: 84,
        },
      },
    ])
  })

  it('scales displacement proportionally to deltaTime', () => {
    const obstacles = createObstacles()

    const updatedWithQuarterSecond = updateObstaclesMovement(obstacles, 0.25)
    const updatedWithHalfSecond = updateObstaclesMovement(obstacles, 0.5)

    expect(updatedWithQuarterSecond[0].position).toEqual({
      x: 330,
      y: 0,
    })

    expect(updatedWithHalfSecond[0].position).toEqual({
      x: 260,
      y: 0,
    })

    expect(updatedWithHalfSecond[0].position.x - obstacles[0].position.x).toBe(
      2 * (updatedWithQuarterSecond[0].position.x - obstacles[0].position.x),
    )
  })

  it('preserves the original obstacle collection', () => {
    const obstacles = createObstacles()

    updateObstaclesMovement(obstacles, 0.5)

    expect(obstacles).toEqual(createObstacles())
  })

  it('returns an empty collection when there are no obstacles', () => {
    expect(updateObstaclesMovement([], 0.5)).toEqual([])
  })

  it('preserves each obstacle independent movement', () => {
    const obstacles = createObstacles()

    const updatedObstacles = updateObstaclesMovement(obstacles, 0.5)

    expect(updatedObstacles[0].position).toEqual({
      x: 260,
      y: 0,
    })

    expect(updatedObstacles[1].position).toEqual({
      x: 675,
      y: 84,
    })
  })
})
