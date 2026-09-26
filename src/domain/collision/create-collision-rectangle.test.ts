import { describe, expect, it } from 'vitest'
import { createCollisionRectangle } from './create-collision-rectangle'

describe('createCollisionRectangle', () => {
  it('creates a rectangle using the collision bounds dimensions', () => {
    const rectangle = createCollisionRectangle(
      {
        x: 100,
        y: 50,
      },
      {
        offsetX: 0,
        offsetY: 0,
        width: 24,
        height: 32,
      },
    )

    expect(rectangle).toEqual({
      x: 100,
      y: 50,
      width: 24,
      height: 32,
    })
  })

  it('applies collision bounds offsets to the entity position', () => {
    const rectangle = createCollisionRectangle(
      {
        x: 100,
        y: 50,
      },
      {
        offsetX: 4,
        offsetY: 6,
        width: 24,
        height: 28,
      },
    )

    expect(rectangle).toEqual({
      x: 104,
      y: 56,
      width: 24,
      height: 28,
    })
  })

  it('supports negative collision bounds offsets', () => {
    const rectangle = createCollisionRectangle(
      {
        x: 100,
        y: 50,
      },
      {
        offsetX: -4,
        offsetY: -6,
        width: 24,
        height: 28,
      },
    )

    expect(rectangle).toEqual({
      x: 96,
      y: 44,
      width: 24,
      height: 28,
    })
  })
})
