import { describe, expect, it, vi } from 'vitest'

import type { Mario } from '../../domain/mario/mario'
import type { Scenario } from '../../domain/scenario/scenario'
import { CanvasSurface } from './canvas-surface'
import { GameRenderer } from './game-renderer'
import type { MarioVisual } from '../mario/mario-visual'
import { defaultGameplayConfig } from '../../domain/config/default-gameplay-config'

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

const createScenario = (): Scenario => ({
  id: 'default',
  background: {
    id: 'default',
  },
  ground: {
    y: 0,
  },
  position: {
    x: 0,
  },
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
    fillStyle: '',
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
  it('renders the scenario background', () => {
    const surface = createSurface()
    const renderer = new GameRenderer(surface)
    const scenario = createScenario()
    const mario = createMario()
    const marioVisual = createMarioVisual()

    renderer.render('RUNNING', scenario, mario, marioVisual)

    expect(surface.context.fillRect).toHaveBeenCalledWith(0, 0, 800, 300)
  })

  it('renders the ground according to the scenario position', () => {
    const surface = createSurface()
    const renderer = new GameRenderer(surface)
    const scenario = createScenario()
    const mario = createMario()
    const marioVisual = createMarioVisual()

    scenario.ground.y = 20

    renderer.render('RUNNING', scenario, mario, marioVisual)

    expect(surface.context.fillRect).toHaveBeenCalledWith(0, 280, 800, 32)
  })

  it('renders the ground using the current scenario data', () => {
    const surface = createSurface()
    const renderer = new GameRenderer(surface)
    const scenario = createScenario()
    const mario = createMario()
    const marioVisual = createMarioVisual()

    scenario.ground.y = 40

    renderer.render('RUNNING', scenario, mario, marioVisual)

    expect(surface.context.fillRect).toHaveBeenCalledWith(0, 260, 800, 32)
  })

  it('renders Mario with the expected visual dimensions', () => {
    const surface = createSurface()
    const renderer = new GameRenderer(surface)
    const scenario = createScenario()
    const mario = createMario()
    const marioVisual = createMarioVisual()

    renderer.render('RUNNING', scenario, mario, marioVisual)

    expect(surface.context.fillRect).toHaveBeenCalledWith(
      199,
      292,
      marioVisual.width,
      marioVisual.height,
    )
  })

  it('preserves Mario rendering when the scenario changes', () => {
    const surface = createSurface()
    const renderer = new GameRenderer(surface)
    const scenario = createScenario()
    const mario = createMario()
    const marioVisual = createMarioVisual()

    scenario.ground.y = 40

    renderer.render('RUNNING', scenario, mario, marioVisual)

    expect(surface.context.fillRect).toHaveBeenCalledWith(
      199,
      292,
      marioVisual.width,
      marioVisual.height,
    )
  })

  it('preserves Mario visual position when the scenario moves', () => {
    const surface = createSurface()
    const renderer = new GameRenderer(surface)
    const scenario = createScenario()
    const mario = createMario()
    const marioVisual = createMarioVisual()

    scenario.position.x = 70

    renderer.render('RUNNING', scenario, mario, marioVisual)

    expect(surface.context.fillRect).toHaveBeenNthCalledWith(
      3,
      199,
      292,
      marioVisual.width,
      marioVisual.height,
    )
  })
  it('renders Mario without changing its state', () => {
    const surface = createSurface()
    const renderer = new GameRenderer(surface)
    const scenario = createScenario()
    const mario = createMario()
    const marioBeforeRender = structuredClone(mario)
    const marioVisual = createMarioVisual()

    renderer.render('RUNNING', scenario, mario, marioVisual)

    expect(mario).toEqual(marioBeforeRender)
  })

  it('renders using Mario position without changing it', () => {
    const surface = createSurface()
    const renderer = new GameRenderer(surface)
    const scenario = createScenario()
    const mario = createMario()
    const positionBeforeRender = { ...mario.position }
    const marioVisual = createMarioVisual()

    renderer.render('RUNNING', scenario, mario, marioVisual)

    expect(mario.position).toEqual(positionBeforeRender)
  })

  it('renders using Mario velocity without changing it', () => {
    const surface = createSurface()
    const renderer = new GameRenderer(surface)
    const scenario = createScenario()
    const mario = createMario()
    const velocityBeforeRender = { ...mario.velocity }
    const marioVisual = createMarioVisual()

    renderer.render('RUNNING', scenario, mario, marioVisual)

    expect(mario.velocity).toEqual(velocityBeforeRender)
  })

  it('renders without changing Mario movement state', () => {
    const surface = createSurface()
    const renderer = new GameRenderer(surface)
    const scenario = createScenario()
    const mario = createMario()
    const movementStateBeforeRender = mario.movementState
    const marioVisual = createMarioVisual()

    renderer.render('RUNNING', scenario, mario, marioVisual)

    expect(mario.movementState).toBe(movementStateBeforeRender)
  })

  it('renders without changing Mario grounded state', () => {
    const surface = createSurface()
    const renderer = new GameRenderer(surface)
    const scenario = createScenario()
    const mario = createMario()
    const groundedStateBeforeRender = mario.isGrounded
    const marioVisual = createMarioVisual()

    renderer.render('RUNNING', scenario, mario, marioVisual)

    expect(mario.isGrounded).toBe(groundedStateBeforeRender)
  })

  it('does not update Mario when rendering', () => {
    const surface = createSurface()
    const renderer = new GameRenderer(surface)
    const scenario = createScenario()
    const mario = createMario()
    const marioVisual = createMarioVisual()
    const marioReference = mario

    renderer.render('RUNNING', scenario, mario, marioVisual)

    expect(mario).toBe(marioReference)
  })

  it('renders the scene in the expected order', () => {
    const surface = createSurface()
    const renderer = new GameRenderer(surface)
    const scenario = createScenario()
    const mario = createMario()
    const marioVisual = createMarioVisual()

    renderer.render('RUNNING', scenario, mario, marioVisual)

    expect(surface.context.fillRect).toHaveBeenNthCalledWith(1, 0, 0, 800, 300)

    expect(surface.context.fillRect).toHaveBeenNthCalledWith(2, 0, 300, 800, 32)

    expect(surface.context.fillRect).toHaveBeenNthCalledWith(
      3,
      199,
      292,
      marioVisual.width,
      marioVisual.height,
    )
  })
  it('does not update the scenario when rendering', () => {
    const surface = createSurface()
    const renderer = new GameRenderer(surface)
    const scenario = createScenario()
    const scenarioBeforeRender = structuredClone(scenario)
    const mario = createMario()
    const marioVisual = createMarioVisual()

    renderer.render('RUNNING', scenario, mario, marioVisual)

    expect(scenario).toEqual(scenarioBeforeRender)
  })

  it('aligns the visual ground with the configured Mario ground', () => {
    const surface = createSurface()
    const renderer = new GameRenderer(surface)
    const scenario = createScenario()
    const mario = createMario()
    const marioVisual = createMarioVisual()

    scenario.ground.y = defaultGameplayConfig.physics.groundY

    renderer.render('RUNNING', scenario, mario, marioVisual)

    expect(surface.context.fillRect).toHaveBeenNthCalledWith(
      2,
      0,
      surface.element.height - defaultGameplayConfig.physics.groundY,
      800,
      32,
    )
  })
})
