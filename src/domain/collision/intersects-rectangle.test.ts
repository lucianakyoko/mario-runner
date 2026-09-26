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

  it('considers rectangles colliding when they overlap horizontally', () => {
    const first = {
      x: 0,
      y: 0,
      width: 32,
      height: 32,
    }

    const second = {
      x: 24,
      y: 0,
      width: 32,
      height: 32,
    }

    expect(intersectsRectangle(first, second)).toBe(true)
  })

  it('considers rectangles colliding when they overlap vertically', () => {
    const first = {
      x: 0,
      y: 0,
      width: 32,
      height: 32,
    }

    const second = {
      x: 0,
      y: 24,
      width: 32,
      height: 32,
    }

    expect(intersectsRectangle(first, second)).toBe(true)
  })

  it('considers rectangles colliding when one is completely inside the other', () => {
    const first = {
      x: 0,
      y: 0,
      width: 64,
      height: 64,
    }

    const second = {
      x: 16,
      y: 16,
      width: 16,
      height: 16,
    }

    expect(intersectsRectangle(first, second)).toBe(true)
  })

  it('does not consider rectangles colliding when they are separated horizontally', () => {
    const first = {
      x: 0,
      y: 0,
      width: 32,
      height: 32,
    }

    const second = {
      x: 40,
      y: 0,
      width: 32,
      height: 32,
    }

    expect(intersectsRectangle(first, second)).toBe(false)
  })

  it('does not consider rectangles colliding when they are separated vertically', () => {
    const first = {
      x: 0,
      y: 0,
      width: 32,
      height: 32,
    }

    const second = {
      x: 0,
      y: 40,
      width: 32,
      height: 32,
    }

    expect(intersectsRectangle(first, second)).toBe(false)
  })

  it('does not consider rectangles colliding when they are separated on both axes', () => {
    const first = {
      x: 0,
      y: 0,
      width: 32,
      height: 32,
    }

    const second = {
      x: 40,
      y: 40,
      width: 32,
      height: 32,
    }

    expect(intersectsRectangle(first, second)).toBe(false)
  })

  it('considers rectangles colliding when they have the same position and dimensions', () => {
    const first = {
      x: 100,
      y: 50,
      width: 1,
      height: 1,
    }

    const second = {
      x: 100,
      y: 50,
      width: 1,
      height: 1,
    }

    expect(intersectsRectangle(first, second)).toBe(true)
  })

  it('considers minimum positive-size rectangles colliding when they overlap', () => {
    const first = {
      x: 0,
      y: 0,
      width: 1,
      height: 1,
    }

    const second = {
      x: 0.5,
      y: 0.5,
      width: 1,
      height: 1,
    }

    expect(intersectsRectangle(first, second)).toBe(true)
  })

  it('does not consider minimum positive-size rectangles colliding when they only touch', () => {
    const first = {
      x: 0,
      y: 0,
      width: 1,
      height: 1,
    }

    const second = {
      x: 1,
      y: 0,
      width: 1,
      height: 1,
    }

    expect(intersectsRectangle(first, second)).toBe(false)
  })

  it('does not consider rectangles colliding when their positive-size edges are separated by a small distance', () => {
    const first = {
      x: 0,
      y: 0,
      width: 32,
      height: 32,
    }

    const second = {
      x: 32.001,
      y: 0,
      width: 32,
      height: 32,
    }

    expect(intersectsRectangle(first, second)).toBe(false)
  })

  it('produces the same result regardless of rectangle order', () => {
    const first = {
      x: 10,
      y: 20,
      width: 30,
      height: 40,
    }

    const second = {
      x: 25,
      y: 35,
      width: 20,
      height: 10,
    }

    expect(intersectsRectangle(first, second)).toBe(
      intersectsRectangle(second, first),
    )
  })
})
