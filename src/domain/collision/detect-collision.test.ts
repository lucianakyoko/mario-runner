import { describe, expect, it } from 'vitest'
import { detectCollision } from './detect-collision'
import type { Collidable } from './collidable'

const createTestEntity = (
  x: number,
  y: number,
  width: number,
  height: number,
): Collidable => ({
  getCollisionBounds: () => ({
    x,
    y,
    width,
    height,
  }),
})

describe('detectCollision', () => {
  it('detects a collision between two collidable entities', () => {
    const first = createTestEntity(0, 0, 32, 32)
    const second = createTestEntity(24, 0, 32, 32)

    expect(detectCollision(first, second)).toEqual({
      hasCollision: true,
    })
  })

  it('returns no collision when collidable entities do not overlap', () => {
    const first = createTestEntity(0, 0, 32, 32)
    const second = createTestEntity(40, 0, 32, 32)

    expect(detectCollision(first, second)).toEqual({
      hasCollision: false,
    })
  })

  it('respects the edge behavior defined by the AABB detector', () => {
    const first = createTestEntity(0, 0, 32, 32)
    const second = createTestEntity(32, 0, 32, 32)

    expect(detectCollision(first, second)).toEqual({
      hasCollision: false,
    })
  })

  it('works with different fictitious entity shapes', () => {
    const first = createTestEntity(10, 20, 48, 24)
    const second = createTestEntity(30, 30, 16, 16)

    expect(detectCollision(first, second)).toEqual({
      hasCollision: true,
    })
  })
})
