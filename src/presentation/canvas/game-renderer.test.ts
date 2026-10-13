import { describe, expect, it, vi } from 'vitest'

import type { Collectible } from '../../domain/collectible/collectible'
import { defaultGameplayConfig } from '../../domain/config/default-gameplay-config'
import { marioLifeState } from '../../domain/mario/mario-life-state'
import type { Mario } from '../../domain/mario/mario'
import type { Obstacle } from '../../domain/obstacle/obstacle'
import { OBSTACLE_TYPE } from '../../domain/obstacle/obstacle-type'
import type { PowerUp } from '../../domain/power-up/power-up'
import { POWER_UP_TYPE } from '../../domain/power-up/power-up-type'
import type { Scenario } from '../../domain/scenario/scenario'
import type { MarioVisual } from '../mario/mario-visual'
import { CanvasSurface } from './canvas-surface'
import { GameRenderer } from './game-renderer'
import { musicTypes } from '../../domain/audio/music-type'
import { OBSTACLE_VARIANT } from '../obstacle/obstacle-sprite-catalog'

const createMario = (): Mario => ({
  position: {
    x: 0,
    y: 0,
  },
  velocity: {
    x: 280,
    y: 0,
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
  movementState: 'RUNNING',
  powerState: 'NORMAL',
  lifeState: marioLifeState.ALIVE,
  isGrounded: true,
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
  music: musicTypes.DEFAULT,
})

const createMarioVisual = (): MarioVisual => ({
  variant: 'SMALL',
  width: 34,
  height: 48,
  offsetX: -1,
  offsetY: 0,
  movementState: 'JUMPING',
  animationFrame: 0,
})

const createBigMarioVisual = (): MarioVisual => ({
  variant: 'BIG',
  width: 34,
  height: 64,
  offsetX: -1,
  offsetY: 0,
  movementState: 'JUMPING',
  animationFrame: 0,
})

const createObstacle = (
  type: Obstacle['type'],
  x: number,
  y = 0,
): Obstacle => ({
  id: `${type}-${x}`,
  type,
  variant:
    type === OBSTACLE_TYPE.GROUND_TALL
      ? OBSTACLE_VARIANT.PTOOIE
      : type === OBSTACLE_TYPE.AIR
        ? OBSTACLE_VARIANT.CANNONBALL
        : OBSTACLE_VARIANT.MUNCHER,
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

const createPowerUp = (x: number, y = 0): PowerUp => ({
  id: `mushroom-${x}`,
  type: POWER_UP_TYPE.MUSHROOM,
  position: {
    x,
    y,
  },
  size: {
    width: defaultGameplayConfig.powerUp.width,
    height: defaultGameplayConfig.powerUp.height,
  },
  collisionBounds: {
    offsetX: 2,
    offsetY: 2,
    width: 28,
    height: 28,
  },
  velocity: {
    x: -280,
    y: 0,
  },
  isCollected: false,
})

const createSurface = (): CanvasSurface => {
  const context = {
    clearRect: vi.fn(),
    drawImage: vi.fn(),
    fillText: vi.fn(),
    fillRect: vi.fn(),
    fillStyle: '',
    font: '',
    textAlign: 'left',
    textBaseline: 'top',
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

const createCoin = (x: number, y = -48): Collectible => ({
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

    expect(surface.context.fillRect).toHaveBeenCalledWith(0, 264, 800, 16)
  })

  it('renders the ground sprite repeatedly across the canvas', () => {
    const originalImage = globalThis.Image

    class MockImage {
      complete = true
      naturalWidth = 16
      naturalHeight = 16
      src = ''

      addEventListener(): void {}
      removeEventListener(): void {}
    }

    vi.stubGlobal('Image', MockImage)

    try {
      const surface = createSurface()
      const renderer = new GameRenderer(surface)

      renderer.render(
        'RUNNING',
        createScenario(),
        createMario(),
        createMarioVisual(),
      )

      expect(surface.context.drawImage).toHaveBeenCalledWith(
        expect.objectContaining({
          src: '/sprites/environments/ground-1-middle.png',
        }),
        0,
        0,
        16,
        16,
        expect.any(Number),
        expect.any(Number),
        16,
        16,
      )
    } finally {
      vi.stubGlobal('Image', originalImage)
    }
  })

  it('renders the ground using the current scenario data', () => {
    const surface = createSurface()
    const renderer = new GameRenderer(surface)
    const scenario = createScenario()
    const mario = createMario()
    const marioVisual = createMarioVisual()

    scenario.ground.y = 40

    renderer.render('RUNNING', scenario, mario, marioVisual)

    expect(surface.context.fillRect).toHaveBeenCalledWith(0, 244, 800, 16)
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
      236,
      marioVisual.width,
      marioVisual.height,
    )
  })

  it('renders powered Mario using the provided big visual dimensions', () => {
    const surface = createSurface()
    const renderer = new GameRenderer(surface)
    const scenario = createScenario()
    const mario = createMario()
    const marioVisual = createBigMarioVisual()

    mario.powerState = 'POWERED'

    renderer.render('RUNNING', scenario, mario, marioVisual)

    expect(surface.context.fillRect).toHaveBeenCalledWith(
      199,
      220,
      marioVisual.width,
      marioVisual.height,
    )
  })

  it('renders Mario using visual dimensions independently from collision bounds', () => {
    const surface = createSurface()
    const renderer = new GameRenderer(surface)
    const scenario = createScenario()
    const mario = createMario()
    const marioVisual = createBigMarioVisual()

    mario.powerState = 'POWERED'
    mario.collisionBounds = {
      offsetX: 4,
      offsetY: 6,
      width: 24,
      height: 52,
    }

    renderer.render('RUNNING', scenario, mario, marioVisual)

    expect(surface.context.fillRect).toHaveBeenCalledWith(199, 220, 34, 64)
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
      196,
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
      236,
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

    expect(surface.context.fillRect).toHaveBeenNthCalledWith(2, 0, 284, 800, 16)

    expect(surface.context.fillRect).toHaveBeenNthCalledWith(
      3,
      199,
      236,
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
      surface.element.height - defaultGameplayConfig.physics.groundY - 16,
      800,
      16,
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

    expect(surface.context.fillRect).toHaveBeenCalledWith(400, 252, 32, 32)
  })

  it('renders a tall ground obstacle using its visual dimensions', () => {
    const surface = createSurface()
    const renderer = new GameRenderer(surface)
    const scenario = createScenario()
    const mario = createMario()
    const marioVisual = createMarioVisual()
    const obstacle = createObstacle(OBSTACLE_TYPE.GROUND_TALL, 200)

    renderer.render('RUNNING', scenario, mario, marioVisual, [obstacle])

    expect(surface.context.fillRect).toHaveBeenCalledWith(400, 236, 32, 48)
  })

  it('renders ground obstacles according to their world position', () => {
    const surface = createSurface()
    const renderer = new GameRenderer(surface)
    const scenario = createScenario()
    const mario = createMario()
    const marioVisual = createMarioVisual()
    const obstacle = createObstacle(OBSTACLE_TYPE.GROUND_SMALL, 300)

    renderer.render('RUNNING', scenario, mario, marioVisual, [obstacle])

    expect(surface.context.fillRect).toHaveBeenCalledWith(500, 252, 32, 32)
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

  it('renders the obstacle animation frame according to elapsed time', () => {
    const originalImage = globalThis.Image

    class MockImage {
      complete = true
      naturalWidth = 112
      naturalHeight = 16
      src = ''

      addEventListener(): void {}
      removeEventListener(): void {}
    }

    vi.stubGlobal('Image', MockImage)

    try {
      const surface = createSurface()
      const renderer = new GameRenderer(surface)
      const scenario = createScenario()
      const mario = createMario()
      const marioVisual = createMarioVisual()
      const obstacle = createObstacle(OBSTACLE_TYPE.AIR, 200, -64)

      obstacle.variant = OBSTACLE_VARIANT.HAMMER

      renderer.render(
        'RUNNING',
        scenario,
        mario,
        marioVisual,
        [obstacle],
        [],
        [],
        0,
        1,
        0.25,
      )

      expect(surface.context.drawImage).toHaveBeenCalledWith(
        expect.objectContaining({
          src: '/sprites/obstacles/hammer.png',
        }),
        32,
        0,
        16,
        16,
        400,
        212,
        32,
        24,
      )
    } finally {
      vi.stubGlobal('Image', originalImage)
    }
  })

  it('renders an air obstacle at its configured vertical position', () => {
    const surface = createSurface()
    const renderer = new GameRenderer(surface)
    const scenario = createScenario()
    const mario = createMario()
    const marioVisual = createMarioVisual()
    const obstacle = createObstacle(OBSTACLE_TYPE.AIR, 200, -64)

    renderer.render('RUNNING', scenario, mario, marioVisual, [obstacle])

    expect(surface.context.fillRect).toHaveBeenCalledWith(400, 212, 32, 24)
  })

  it('renders a coin according to its world position and size', () => {
    const surface = createSurface()
    const renderer = new GameRenderer(surface)
    const scenario = createScenario()
    const mario = createMario()
    const marioVisual = createMarioVisual()
    const coin = createCoin(200)

    renderer.render('RUNNING', scenario, mario, marioVisual, [], [coin])

    expect(surface.context.fillRect).toHaveBeenCalledWith(400, 228, 24, 24)
  })

  it('renders a mushroom according to its world position and visual size', () => {
    const surface = createSurface()
    const renderer = new GameRenderer(surface)
    const scenario = createScenario()
    const mario = createMario()
    const marioVisual = createMarioVisual()
    const mushroom = createPowerUp(200)

    renderer.render('RUNNING', scenario, mario, marioVisual, [], [], [mushroom])

    expect(surface.context.fillRect).toHaveBeenCalledWith(
      400,
      252,
      mushroom.size.width,
      mushroom.size.height,
    )
  })

  it('does not change power-ups when rendering', () => {
    const surface = createSurface()
    const renderer = new GameRenderer(surface)
    const scenario = createScenario()
    const mario = createMario()
    const marioVisual = createMarioVisual()
    const powerUps = [createPowerUp(200)]
    const powerUpsBeforeRender = structuredClone(powerUps)

    renderer.render('RUNNING', scenario, mario, marioVisual, [], [], powerUps)

    expect(powerUps).toEqual(powerUpsBeforeRender)
  })

  it('renders power-ups between collectibles and Mario', () => {
    const surface = createSurface()
    const renderer = new GameRenderer(surface)
    const scenario = createScenario()
    const mario = createMario()
    const marioVisual = createMarioVisual()
    const coin = createCoin(200)
    const mushroom = createPowerUp(250)

    renderer.render(
      'RUNNING',
      scenario,
      mario,
      marioVisual,
      [],
      [coin],
      [mushroom],
    )

    expect(surface.context.fillRect).toHaveBeenNthCalledWith(1, 0, 0, 800, 300)

    expect(surface.context.fillRect).toHaveBeenNthCalledWith(2, 0, 284, 800, 16)

    expect(surface.context.fillRect).toHaveBeenNthCalledWith(
      3,
      400,
      228,
      24,
      24,
    )

    expect(surface.context.fillRect).toHaveBeenNthCalledWith(
      4,
      450,
      252,
      mushroom.size.width,
      mushroom.size.height,
    )

    expect(surface.context.fillRect).toHaveBeenNthCalledWith(
      5,
      199,
      236,
      marioVisual.width,
      marioVisual.height,
    )
  })

  it('renders obstacles between the ground and collectibles', () => {
    const surface = createSurface()
    const renderer = new GameRenderer(surface)
    const scenario = createScenario()
    const mario = createMario()
    const marioVisual = createMarioVisual()
    const obstacle = createObstacle(OBSTACLE_TYPE.GROUND_SMALL, 200)

    renderer.render('RUNNING', scenario, mario, marioVisual, [obstacle], [], [])

    expect(surface.context.fillRect).toHaveBeenNthCalledWith(1, 0, 0, 800, 300)

    expect(surface.context.fillRect).toHaveBeenNthCalledWith(2, 0, 284, 800, 16)

    expect(surface.context.fillRect).toHaveBeenNthCalledWith(
      3,
      400,
      252,
      32,
      32,
    )

    expect(surface.context.fillRect).toHaveBeenNthCalledWith(
      4,
      199,
      236,
      marioVisual.width,
      marioVisual.height,
    )
  })

  it('renders Game Over feedback when the game state is GAME_OVER', () => {
    const surface = createSurface()
    const renderer = new GameRenderer(surface)
    const scenario = createScenario()
    const mario = createMario()
    const marioVisual = createMarioVisual()

    renderer.render('GAME_OVER', scenario, mario, marioVisual)

    expect(surface.context.fillText).toHaveBeenCalledWith('GAME OVER', 400, 134)
    expect(surface.context.fillText).toHaveBeenCalledWith(
      'PRESS RESTART',
      400,
      174,
    )
  })

  it('does not render Game Over feedback while the game is running', () => {
    const surface = createSurface()
    const renderer = new GameRenderer(surface)
    const scenario = createScenario()
    const mario = createMario()
    const marioVisual = createMarioVisual()

    renderer.render('RUNNING', scenario, mario, marioVisual)

    expect(surface.context.fillText).not.toHaveBeenCalledWith(
      'GAME OVER',
      400,
      134,
    )
    expect(surface.context.fillText).not.toHaveBeenCalledWith(
      'PRESS RESTART',
      400,
      174,
    )
  })

  it('uses the resolved game state instead of Mario life state for Game Over feedback', () => {
    const surface = createSurface()
    const renderer = new GameRenderer(surface)
    const scenario = createScenario()
    const mario = createMario()
    const marioVisual = createMarioVisual()

    mario.lifeState = marioLifeState.DEAD

    renderer.render('RUNNING', scenario, mario, marioVisual)

    expect(surface.context.fillText).not.toHaveBeenCalledWith(
      'GAME OVER',
      400,
      134,
    )
  })

  it('renders obstacles between the ground and Mario', () => {
    const surface = createSurface()
    const renderer = new GameRenderer(surface)
    const scenario = createScenario()
    const mario = createMario()
    const marioVisual = createMarioVisual()
    const obstacle = createObstacle(OBSTACLE_TYPE.GROUND_SMALL, 200)

    renderer.render('RUNNING', scenario, mario, marioVisual, [obstacle], [], [])

    expect(surface.context.fillRect).toHaveBeenNthCalledWith(1, 0, 0, 800, 300)

    expect(surface.context.fillRect).toHaveBeenNthCalledWith(2, 0, 284, 800, 16)

    expect(surface.context.fillRect).toHaveBeenNthCalledWith(
      3,
      400,
      252,
      32,
      32,
    )

    expect(surface.context.fillRect).toHaveBeenNthCalledWith(
      4,
      199,
      236,
      marioVisual.width,
      marioVisual.height,
    )
  })
})
