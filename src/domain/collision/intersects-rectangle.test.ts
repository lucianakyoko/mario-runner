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
})
