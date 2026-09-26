import { describe, expect, it } from 'vitest'
import { intersectsRectangle } from './intersects-rectangle'

describe('intersectsRectangle', () => {
  it('does not consider rectangles colliding when they only touch horizontally', () => {
    const first = {
      x: 0,
      y: 0,
      width: 32,
      height: 32,
    }

    const second = {
      x: 32,
      y: 0,
      width: 32,
      height: 32,
    }

    expect(intersectsRectangle(first, second)).toBe(false)
  })

  it('does not consider rectangles colliding when they only touch vertically', () => {
    const first = {
      x: 0,
      y: 0,
      width: 32,
      height: 32,
    }

    const second = {
      x: 0,
      y: 32,
      width: 32,
      height: 32,
    }

    expect(intersectsRectangle(first, second)).toBe(false)
  })

  it('does not consider rectangles colliding when they only touch at a corner', () => {
    const first = {
      x: 0,
      y: 0,
      width: 32,
      height: 32,
    }

    const second = {
      x: 32,
      y: 32,
      width: 32,
      height: 32,
    }

    expect(intersectsRectangle(first, second)).toBe(false)
  })

  it('considers rectangles colliding when they overlap by a positive area', () => {
    const first = {
      x: 0,
      y: 0,
      width: 32,
      height: 32,
    }

    const second = {
      x: 31,
      y: 0,
      width: 32,
      height: 32,
    }

    expect(intersectsRectangle(first, second)).toBe(true)
  })
})
