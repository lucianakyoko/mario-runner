import { describe, expect, it } from 'vitest'

import type { Obstacle } from './obstacle'
import { OBSTACLE_TYPE } from './obstacle-type'
import { updateObstacleMovement } from './update-obstacle-movement'

const createObstacle = (): Obstacle => ({
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
  velocity: {
    x: -280,
    y: 0,
  },
})

describe('updateObstacleMovement', () => {
  it('moves an obstacle according to elapsed time', () => {
    const obstacle = createObstacle()

    const updatedObstacle = updateObstacleMovement(obstacle, 0.5)

    expect(updatedObstacle.position).toEqual({
      x: 260,
      y: 0,
    })
  })

  it('applies vertical velocity independently from horizontal velocity', () => {
    const obstacle: Obstacle = {
      ...createObstacle(),
      velocity: {
        x: -280,
        y: 40,
      },
    }

    const updatedObstacle = updateObstacleMovement(obstacle, 0.5)

    expect(updatedObstacle.position).toEqual({
      x: 260,
      y: 20,
    })
  })

  it('preserves the original obstacle state', () => {
    const obstacle = createObstacle()

    updateObstacleMovement(obstacle, 0.5)

    expect(obstacle.position).toEqual({
      x: 400,
      y: 0,
    })
  })

  it('preserves non-movement obstacle data', () => {
    const obstacle = createObstacle()

    const updatedObstacle = updateObstacleMovement(obstacle, 0.5)

    expect(updatedObstacle.id).toBe(obstacle.id)
    expect(updatedObstacle.type).toBe(obstacle.type)
    expect(updatedObstacle.size).toEqual(obstacle.size)
    expect(updatedObstacle.velocity).toEqual(obstacle.velocity)
  })

  it('produces the same displacement at different frame rates', () => {
    const sixtyFpsDeltaTime = 1 / 60
    const thirtyFpsDeltaTime = 1 / 30

    let obstacleAtSixtyFps = createObstacle()
    let obstacleAtThirtyFps = createObstacle()

    for (let frame = 0; frame < 60; frame += 1) {
      obstacleAtSixtyFps = updateObstacleMovement(
        obstacleAtSixtyFps,
        sixtyFpsDeltaTime,
      )
    }

    for (let frame = 0; frame < 30; frame += 1) {
      obstacleAtThirtyFps = updateObstacleMovement(
        obstacleAtThirtyFps,
        thirtyFpsDeltaTime,
      )
    }

    expect(obstacleAtSixtyFps.position.x).toBeCloseTo(
      obstacleAtThirtyFps.position.x,
    )
    expect(obstacleAtSixtyFps.position.y).toBeCloseTo(
      obstacleAtThirtyFps.position.y,
    )
  })
})
