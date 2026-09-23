import { describe, expect, it, vi } from 'vitest'

import type { Mario } from '../../domain/mario/mario'
import { GameRenderer } from './game-renderer'
import { CanvasSurface } from './canvas-surface'
import type { MarioVisual } from '../mario/mario-visual'

const createMario = (): Mario => ({
  position: {
    x: 120,
    y: 40,
  },
  velocity: {
    x: 280,
    y: -680,
  },
  size: {
    width: 32,
    height: 48,
  },
  movementState: 'JUMPING',
  isGrounded: false,
})

const createMarioVisual = (): MarioVisual => ({
  variant: 'SMALL',
  width: 34,
  height: 48,
  offsetX: -1,
  offsetY: 0,
  movementState: 'JUMPING',
})

const createSurface = (): CanvasSurface => {
  const context = {
    clearRect: vi.fn(),
    fillText: vi.fn(),
    fillRect: vi.fn(),
  } as unknown as CanvasRenderingContext2D

  const canvas = {
    width: 800,
    height: 300,
  } as HTMLCanvasElement

  return {
    element: canvas,
    context,
  }
}

describe('GameRenderer', () => {
  it('renders Mario without changing its state', () => {
    const surface = createSurface()
    const renderer = new GameRenderer(surface)
    const mario = createMario()
    const marioBeforeRender = structuredClone(mario)
    const marioVisual = createMarioVisual()

    renderer.render('RUNNING', mario, marioVisual)

    expect(mario).toEqual(marioBeforeRender)
  })

  it('renders using Mario position without changing it', () => {
    const surface = createSurface()
    const renderer = new GameRenderer(surface)
    const mario = createMario()
    const positionBeforeRender = { ...mario.position }
    const marioVisual = createMarioVisual()

    renderer.render('RUNNING', mario, marioVisual)

    expect(mario.position).toEqual(positionBeforeRender)
  })

  it('renders using Mario velocity without changing it', () => {
    const surface = createSurface()
    const renderer = new GameRenderer(surface)
    const mario = createMario()
    const velocityBeforeRender = { ...mario.velocity }
    const marioVisual = createMarioVisual()

    renderer.render('RUNNING', mario, marioVisual)

    expect(mario.velocity).toEqual(velocityBeforeRender)
  })

  it('renders without changing Mario movement state', () => {
    const surface = createSurface()
    const renderer = new GameRenderer(surface)
    const mario = createMario()
    const movementStateBeforeRender = mario.movementState
    const marioVisual = createMarioVisual()

    renderer.render('RUNNING', mario, marioVisual)

    expect(mario.movementState).toBe(movementStateBeforeRender)
  })

  it('renders without changing Mario grounded state', () => {
    const surface = createSurface()
    const renderer = new GameRenderer(surface)
    const mario = createMario()
    const groundedStateBeforeRender = mario.isGrounded
    const marioVisual = createMarioVisual()

    renderer.render('RUNNING', mario, marioVisual)

    expect(mario.isGrounded).toBe(groundedStateBeforeRender)
  })

  it('does not update Mario when rendering', () => {
    const surface = createSurface()
    const renderer = new GameRenderer(surface)
    const mario = createMario()
    const marioVisual = createMarioVisual()
    const marioReference = mario

    renderer.render('RUNNING', mario, marioVisual)

    expect(mario).toBe(marioReference)
  })
})
