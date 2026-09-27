import { describe, expect, it, vi } from 'vitest'

import { defaultGameplayConfig } from '../../domain/config/default-gameplay-config'
import type { Mario } from '../../domain/mario/mario'
import type { Obstacle } from '../../domain/obstacle/obstacle'
import { OBSTACLE_TYPE } from '../../domain/obstacle/obstacle-type'
import type { Scenario } from '../../domain/scenario/scenario'
import type { MarioVisual } from '../mario/mario-visual'
import { CanvasSurface } from './canvas-surface'
import { GameRenderer } from './game-renderer'
import type { Collectible } from '../../domain/collectible/collectible'

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
  collisionBounds: {
    offsetX: 0,
    offsetY: 0,
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

const createObstacle = (
  type: Obstacle['type'],
  x: number,
  y = 0,
): Obstacle => ({
  id: `${type}-${x}`,
  type,
  position: {
    x,
    y,
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

const createCoin = (x: number, y = 48): Collectible => ({
  id: `coin-${x}`,
  type: 'coin',
  position: {
    x,
    y,
  },
  size: {
    width: 24,
    height: 24,
  },
  collisionBounds: {
    offsetX: 2,
    offsetY: 2,
    width: 20,
    height: 20,
  },
  velocity: {
    x: -280,
    y: 0,
  },
  isCollected: false,
})

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

  it('renders Mario according to the current scenario ground', () => {
    const surface = createSurface()
    const renderer = new GameRenderer(surface)
    const scenario = createScenario()
    const mario = createMario()
    const marioVisual = createMarioVisual()

    scenario.ground.y = 40

    renderer.render('RUNNING', scenario, mario, marioVisual)

    expect(surface.context.fillRect).toHaveBeenCalledWith(
      199,
      252,
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

  it('renders a small ground obstacle using its visual dimensions', () => {
    const surface = createSurface()
    const renderer = new GameRenderer(surface)
    const scenario = createScenario()
    const mario = createMario()
    const marioVisual = createMarioVisual()
    const obstacle = createObstacle(OBSTACLE_TYPE.GROUND_SMALL, 200)

    renderer.render('RUNNING', scenario, mario, marioVisual, [obstacle])

    expect(surface.context.fillRect).toHaveBeenCalledWith(280, 268, 32, 32)
  })

  it('renders a tall ground obstacle using its visual dimensions', () => {
    const surface = createSurface()
    const renderer = new GameRenderer(surface)
    const scenario = createScenario()
    const mario = createMario()
    const marioVisual = createMarioVisual()
    const obstacle = createObstacle(OBSTACLE_TYPE.GROUND_TALL, 200)

    renderer.render('RUNNING', scenario, mario, marioVisual, [obstacle])

    expect(surface.context.fillRect).toHaveBeenCalledWith(280, 252, 32, 48)
  })

  it('renders ground obstacles according to their world position', () => {
    const surface = createSurface()
    const renderer = new GameRenderer(surface)
    const scenario = createScenario()
    const mario = createMario()
    const marioVisual = createMarioVisual()
    const obstacle = createObstacle(OBSTACLE_TYPE.GROUND_SMALL, 300)

    renderer.render('RUNNING', scenario, mario, marioVisual, [obstacle])

    expect(surface.context.fillRect).toHaveBeenCalledWith(380, 268, 32, 32)
  })

  it('does not change obstacles when rendering', () => {
    const surface = createSurface()
    const renderer = new GameRenderer(surface)
    const scenario = createScenario()
    const mario = createMario()
    const marioVisual = createMarioVisual()
    const obstacles = [
      createObstacle(OBSTACLE_TYPE.GROUND_SMALL, 200),
      createObstacle(OBSTACLE_TYPE.GROUND_TALL, 300),
    ]
    const obstaclesBeforeRender = structuredClone(obstacles)

    renderer.render('RUNNING', scenario, mario, marioVisual, obstacles)

    expect(obstacles).toEqual(obstaclesBeforeRender)
  })

  it('renders an air obstacle at its configured vertical position', () => {
    const surface = createSurface()
    const renderer = new GameRenderer(surface)
    const scenario = createScenario()
    const mario = createMario()
    const marioVisual = createMarioVisual()
    const obstacle = createObstacle(OBSTACLE_TYPE.AIR, 200, 64)

    renderer.render('RUNNING', scenario, mario, marioVisual, [obstacle])

    expect(surface.context.fillRect).toHaveBeenCalledWith(280, 212, 32, 24)
  })

  it('renders a coin according to its world position and size', () => {
    const surface = createSurface()
    const renderer = new GameRenderer(surface)
    const scenario = createScenario()
    const mario = createMario()
    const marioVisual = createMarioVisual()
    const coin = createCoin(200)

    renderer.render('RUNNING', scenario, mario, marioVisual, [], [coin])

    expect(surface.context.fillRect).toHaveBeenCalledWith(280, 228, 24, 24)
  })

  it('renders obstacles between the ground and Mario', () => {
    const surface = createSurface()
    const renderer = new GameRenderer(surface)
    const scenario = createScenario()
    const mario = createMario()
    const marioVisual = createMarioVisual()
    const obstacle = createObstacle(OBSTACLE_TYPE.GROUND_SMALL, 200)

    renderer.render('RUNNING', scenario, mario, marioVisual, [obstacle])

    expect(surface.context.fillRect).toHaveBeenNthCalledWith(1, 0, 0, 800, 300)

    expect(surface.context.fillRect).toHaveBeenNthCalledWith(2, 0, 300, 800, 32)

    expect(surface.context.fillRect).toHaveBeenNthCalledWith(
      3,
      280,
      268,
      32,
      32,
    )

    expect(surface.context.fillRect).toHaveBeenNthCalledWith(
      4,
      199,
      292,
      marioVisual.width,
      marioVisual.height,
    )
  })
})
