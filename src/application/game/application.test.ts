import { describe, expect, it } from 'vitest'

import { defaultGameplayConfig } from '../../domain/config/default-gameplay-config'
import type { GameplayCommand } from '../../domain/input'
import type { Mario } from '../../domain/mario/mario'
import { marioLifeState } from '../../domain/mario/mario-life-state'
import type { Obstacle } from '../../domain/obstacle/obstacle'
import { OBSTACLE_TYPE } from '../../domain/obstacle/obstacle-type'
import type { Collectible } from '../../domain/collectible/collectible'
import { growMario } from '../../domain/mario/grow-mario'
import type { Scenario } from '../../domain/scenario/scenario'
import type { GameTime } from '../../domain/time'
import type { Input } from '../input'
import type {
  FrameCallback,
  FrameScheduler,
} from '../game-loop/frame-scheduler'
import { GameApplication, type GameEvent } from './application'
import { calculateLevel } from '../../domain/progression/calculate-level'
import { marioPowerState } from '../../domain/mario/mario-power-state'
import { musicTypes } from '../../domain/audio/music-type'

class FakeFrameScheduler implements FrameScheduler {
  private nextRequestId = 1
  private callbacks = new Map<number, FrameCallback>()

  request(callback: FrameCallback): number {
    const requestId = this.nextRequestId

    this.nextRequestId += 1
    this.callbacks.set(requestId, callback)

    return requestId
  }

  cancel(requestId: number): void {
    this.callbacks.delete(requestId)
  }

  runNext(timestamp: number): void {
    const firstEntry = this.callbacks.entries().next()

    if (firstEntry.done) {
      throw new Error('No scheduled frame available.')
    }

    const [requestId, callback] = firstEntry.value

    this.callbacks.delete(requestId)
    callback(timestamp)
  }

  get pendingFrames(): number {
    return this.callbacks.size
  }
}

class FakeInput implements Input {
  private readonly activeCommands = new Set<GameplayCommand>()

  isActive(command: GameplayCommand): boolean {
    return this.activeCommands.has(command)
  }

  activate(command: GameplayCommand): void {
    this.activeCommands.add(command)
  }

  deactivate(command: GameplayCommand): void {
    this.activeCommands.delete(command)
  }
}

const createMario = (positionY = 0): Mario => ({
  position: {
    x: 0,
    y: positionY,
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
  isGrounded: positionY === 0,
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

const createObstacle = (): Obstacle => ({
  id: 'obstacle-1',
  type: OBSTACLE_TYPE.GROUND_SMALL,
  variant: 'MUNCHER',
  position: {
    x: 400,
    y: 0,
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

const createApplication = (
  scheduler: FakeFrameScheduler,
  input: FakeInput = new FakeInput(),
  update: (gameTime: GameTime) => void = () => {},
  render: (gameTime: GameTime) => void = () => {},
  obstacles: Obstacle[] = [],
  coins: Collectible[] = [],
  mario: Mario = createMario(),
  onEvent: (event: GameEvent) => void = () => {},
): GameApplication =>
  new GameApplication(
    scheduler,
    mario,
    createScenario(),
    input,
    update,
    render,
    obstacles,
    coins,
    [],
    onEvent,
  )

describe('GameApplication', () => {
  it('starts in READY', () => {
    const scheduler = new FakeFrameScheduler()
    const application = createApplication(scheduler)

    expect(application.state).toBe('READY')
  })

  it('changes to RUNNING and starts the game loop', () => {
    const scheduler = new FakeFrameScheduler()
    const application = createApplication(scheduler)

    application.start()

    expect(application.state).toBe('RUNNING')
    expect(scheduler.pendingFrames).toBe(1)
  })

  it('does not start a second loop when start is called again', () => {
    const scheduler = new FakeFrameScheduler()
    const application = createApplication(scheduler)

    application.start()
    application.start()

    expect(application.state).toBe('RUNNING')
    expect(scheduler.pendingFrames).toBe(1)
  })

  it('changes to GAME_OVER when the session ends', () => {
    const scheduler = new FakeFrameScheduler()
    const application = createApplication(scheduler)

    application.start()
    application.gameOver()

    expect(application.state).toBe('GAME_OVER')
  })

  it('starts the session when jump is active in READY', () => {
    const scheduler = new FakeFrameScheduler()
    const input = new FakeInput()
    const application = createApplication(scheduler, input)

    input.activate('jump')

    scheduler.runNext(1000)

    expect(application.state).toBe('RUNNING')
    expect(scheduler.pendingFrames).toBe(1)
  })

  it('starts Mario jump when jump is active in RUNNING', () => {
    const scheduler = new FakeFrameScheduler()
    const input = new FakeInput()
    const application = createApplication(scheduler, input)

    application.start()
    input.activate('jump')

    scheduler.runNext(1000)

    expect(application.currentMario.movementState).toBe('JUMPING')
    expect(application.currentMario.isGrounded).toBe(false)
    expect(application.currentMario.velocity.y).toBe(
      -defaultGameplayConfig.physics.jumpForce,
    )
  })

  it('emits the jump event once when Mario starts a jump', () => {
    const scheduler = new FakeFrameScheduler()
    const input = new FakeInput()
    const events: string[] = []
    const application = createApplication(
      scheduler,
      input,
      undefined,
      undefined,
      [],
      [],
      createMario(),
      (event) => events.push(event),
    )

    application.start()
    input.activate('jump')

    scheduler.runNext(1000)
    scheduler.runNext(1250)

    expect(events).toEqual(['JUMP'])
  })

  it('updates Mario jump while the scenario is moving', () => {
    const scheduler = new FakeFrameScheduler()
    const input = new FakeInput()
    const application = createApplication(scheduler, input)

    application.start()
    input.activate('jump')

    scheduler.runNext(1000)

    const jumpForce = defaultGameplayConfig.physics.jumpForce
    const gravity = defaultGameplayConfig.physics.gravity
    const deltaTime = 0.25

    scheduler.runNext(1250)

    expect(application.currentMario.position.y).toBe(
      (-jumpForce + gravity * deltaTime) * deltaTime,
    )
    expect(application.currentMario.velocity.y).toBe(
      -jumpForce + gravity * deltaTime,
    )
    expect(application.currentMario.isGrounded).toBe(false)
    expect(application.currentMario.movementState).toBe('JUMPING')
    expect(application.currentScenario.position.x).toBe(
      defaultGameplayConfig.scenario.speed * deltaTime,
    )
  })

  it('starts Mario crouch when crouch is active in RUNNING', () => {
    const scheduler = new FakeFrameScheduler()
    const input = new FakeInput()
    const application = createApplication(scheduler, input)

    application.start()
    input.activate('crouch')

    scheduler.runNext(1000)

    expect(application.currentMario.movementState).toBe('CROUCHING')
  })

  it('keeps Mario grounded while crouching and the scenario is moving', () => {
    const scheduler = new FakeFrameScheduler()
    const input = new FakeInput()
    const application = createApplication(scheduler, input)

    application.start()
    input.activate('crouch')

    scheduler.runNext(1000)
    scheduler.runNext(1250)

    expect(application.currentMario.movementState).toBe('CROUCHING')
    expect(application.currentMario.position.y).toBe(
      defaultGameplayConfig.physics.groundY,
    )
    expect(application.currentMario.isGrounded).toBe(true)
    expect(application.currentMario.velocity.y).toBe(0)
    expect(application.currentScenario.position.x).toBe(
      defaultGameplayConfig.scenario.speed * 0.25,
    )
  })

  it('keeps grounded Mario at the ground while running', () => {
    const scheduler = new FakeFrameScheduler()
    const application = createApplication(scheduler)

    application.start()

    scheduler.runNext(1000)
    scheduler.runNext(1500)

    expect(application.currentMario.position.y).toBe(
      defaultGameplayConfig.physics.groundY,
    )
    expect(application.currentMario.velocity.y).toBe(0)
    expect(application.currentMario.isGrounded).toBe(true)
  })

  it('moves Mario independently while the scenario is moving', () => {
    const scheduler = new FakeFrameScheduler()
    const application = createApplication(scheduler)

    application.start()

    scheduler.runNext(1000)
    scheduler.runNext(1250)

    expect(application.currentMario.position.x).toBe(
      defaultGameplayConfig.movement.initialSpeed * 0.25,
    )
    expect(application.currentScenario.position.x).toBe(
      defaultGameplayConfig.scenario.speed * 0.25,
    )
  })

  it('updates obstacles while RUNNING', () => {
    const scheduler = new FakeFrameScheduler()
    const obstacle = createObstacle()
    const application = createApplication(
      scheduler,
      new FakeInput(),
      () => {},
      () => {},
      [obstacle],
    )

    application.start()

    scheduler.runNext(1000)
    scheduler.runNext(1250)

    expect(application.currentObstacles).toEqual([
      {
        ...obstacle,
        position: {
          x: 330,
          y: 0,
        },
      },
    ])
  })

  it('spawns obstacles while RUNNING', () => {
    const scheduler = new FakeFrameScheduler()
    const application = createApplication(scheduler)

    application.start()

    scheduler.runNext(1000)
    scheduler.runNext(2000)
    scheduler.runNext(3000)

    expect(application.currentObstacles).toHaveLength(1)
    expect(application.currentObstacles[0]).toMatchObject({
      id: 'obstacle-1',
      position: {
        x: defaultGameplayConfig.viewport.width * 0.75,
      },
    })
  })

  it('uses the seeded random sequence when spawning collectibles', () => {
    const scheduler = new FakeFrameScheduler()
    const application = createApplication(scheduler)

    application.start()

    scheduler.runNext(1000)
    scheduler.runNext(2000)
    scheduler.runNext(3000)

    expect(application.currentCoins).toEqual([])
  })

  it('completes the obstacle lifecycle during gameplay', () => {
    const scheduler = new FakeFrameScheduler()

    const obstacle: Obstacle = {
      id: 'old-obstacle',
      type: OBSTACLE_TYPE.GROUND_SMALL,
      variant: 'MUNCHER',
      position: {
        x: -40,
        y: 0,
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
    }

    const application = createApplication(
      scheduler,
      new FakeInput(),
      () => {},
      () => {},
      [obstacle],
    )

    application.start()

    scheduler.runNext(1000)
    scheduler.runNext(2250)

    expect(application.currentObstacles).toHaveLength(1)

    expect(application.currentObstacles[0].id).not.toBe('old-obstacle')
    expect(application.currentObstacles[0].position.x).toBe(250)
  })

  it('does not spawn obstacles while READY', () => {
    const scheduler = new FakeFrameScheduler()
    const application = createApplication(scheduler)

    scheduler.runNext(1000)
    scheduler.runNext(2000)

    expect(application.state).toBe('READY')
    expect(application.currentObstacles).toEqual([])
  })

  it('does not spawn obstacles after GAME_OVER', () => {
    const scheduler = new FakeFrameScheduler()
    const application = createApplication(scheduler)

    application.start()
    scheduler.runNext(1000)

    application.gameOver()

    scheduler.runNext(2000)
    scheduler.runNext(3000)

    expect(application.state).toBe('GAME_OVER')
    expect(application.currentObstacles).toEqual([])
  })

  it('does not update obstacles while READY', () => {
    const scheduler = new FakeFrameScheduler()
    const obstacle = createObstacle()
    const application = createApplication(
      scheduler,
      new FakeInput(),
      () => {},
      () => {},
      [obstacle],
    )

    const obstaclesBeforeFrame = structuredClone(application.currentObstacles)

    scheduler.runNext(1000)

    expect(application.currentObstacles).toEqual(obstaclesBeforeFrame)
  })

  it('does not update obstacles after GAME_OVER', () => {
    const scheduler = new FakeFrameScheduler()
    const obstacle = createObstacle()
    const application = createApplication(
      scheduler,
      new FakeInput(),
      () => {},
      () => {},
      [obstacle],
    )

    application.start()
    scheduler.runNext(1000)

    const obstaclesAtGameOver = structuredClone(application.currentObstacles)

    application.gameOver()
    scheduler.runNext(1250)

    expect(application.currentObstacles).toEqual(obstaclesAtGameOver)
  })

  it('updates and renders while RUNNING', () => {
    const scheduler = new FakeFrameScheduler()
    const gameTimes: GameTime[] = []
    let renderCount = 0
    const application = createApplication(
      scheduler,
      new FakeInput(),
      (gameTime) => {
        gameTimes.push(gameTime)
      },
      () => {
        renderCount += 1
      },
    )

    application.start()

    scheduler.runNext(1000)
    scheduler.runNext(1250)

    expect(gameTimes).toEqual([
      {
        deltaTime: 0,
        elapsedTime: 0,
      },
      {
        deltaTime: 0.25,
        elapsedTime: 0.25,
      },
    ])
    expect(renderCount).toBe(2)
  })

  it('renders the updated scenario state while RUNNING', () => {
    const scheduler = new FakeFrameScheduler()
    let renderedScenarioX: number | undefined

    const application = createApplication(
      scheduler,
      new FakeInput(),
      () => {},
      () => {
        renderedScenarioX = application.currentScenario.position.x
      },
    )

    application.start()

    scheduler.runNext(1000)
    scheduler.runNext(1250)

    expect(renderedScenarioX).toBe(defaultGameplayConfig.scenario.speed * 0.25)
  })

  it('stops updating after game over', () => {
    const scheduler = new FakeFrameScheduler()
    let updateCount = 0
    let renderCount = 0
    const application = createApplication(
      scheduler,
      new FakeInput(),
      () => {
        updateCount += 1
      },
      () => {
        renderCount += 1
      },
    )

    application.start()
    scheduler.runNext(1000)

    application.gameOver()
    scheduler.runNext(1250)

    expect(application.state).toBe('GAME_OVER')
    expect(updateCount).toBe(1)
    expect(renderCount).toBe(2)
  })

  it('restarts from GAME_OVER to READY', () => {
    const scheduler = new FakeFrameScheduler()
    const application = createApplication(scheduler)

    application.start()
    application.gameOver()
    application.restart()

    expect(application.state).toBe('READY')
  })

  it('returns to READY without starting a new loop when restarting', () => {
    const scheduler = new FakeFrameScheduler()
    const application = createApplication(scheduler)

    application.start()
    application.gameOver()
    application.restart()

    expect(application.state).toBe('READY')
    expect(scheduler.pendingFrames).toBe(1)
  })

  it('completes the full session lifecycle', () => {
    const scheduler = new FakeFrameScheduler()
    const application = createApplication(scheduler)

    expect(application.state).toBe('READY')

    application.start()

    expect(application.state).toBe('RUNNING')

    application.gameOver()

    expect(application.state).toBe('GAME_OVER')

    application.restart()

    expect(application.state).toBe('READY')
  })

  it('resets the scenario to the initial state when restarting', () => {
    const scheduler = new FakeFrameScheduler()
    const application = createApplication(scheduler)

    application.start()
    scheduler.runNext(1000)

    application.gameOver()
    application.restart()

    expect(application.state).toBe('READY')
    expect(application.currentScenario).toEqual(createScenario())
  })

  it('resets Mario to the initial state when restarting', () => {
    const scheduler = new FakeFrameScheduler()
    const application = createApplication(scheduler)

    application.start()
    scheduler.runNext(1000)

    application.gameOver()
    application.restart()

    expect(application.state).toBe('READY')
    expect(application.currentMario).toEqual(createMario())
  })

  it('resets score and level when restarting', () => {
    const scheduler = new FakeFrameScheduler()
    const application = createApplication(scheduler)

    application.start()

    application.gameOver()
    application.restart()

    expect(application.currentScore.value).toBe(0)
    expect(application.currentLevel).toBe(
      calculateLevel({
        score: 0,
        pointsPerLevel: defaultGameplayConfig.progression.pointsPerLevel,
      }),
    )
  })

  it('resets spawn state, entity ids, and random sequence when restarting', () => {
    const scheduler = new FakeFrameScheduler()
    const application = createApplication(scheduler)

    application.start()

    scheduler.runNext(1000)
    scheduler.runNext(2000)

    expect(application.currentObstacles).toEqual([])

    application.gameOver()
    application.restart()
    application.start()

    scheduler.runNext(3000)

    expect(application.currentObstacles).toEqual([])

    scheduler.runNext(5000)

    expect(application.currentObstacles).toHaveLength(1)
    expect(application.currentObstacles[0]).toMatchObject({
      id: 'obstacle-1',
      type: 'GROUND_TALL',
    })
  })

  it('clears all collision state when restarting', () => {
    const scheduler = new FakeFrameScheduler()

    const coin: Collectible = {
      id: 'coin-1',
      type: 'coin',
      position: {
        x: 0,
        y: 0,
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
        x: 0,
        y: 0,
      },
      isCollected: false,
    }

    const application = createApplication(
      scheduler,
      new FakeInput(),
      () => {},
      () => {},
      [],
      [coin],
    )

    application.start()
    scheduler.runNext(1000)

    expect(application.currentCollectibleCollisions).toEqual([coin])

    application.gameOver()
    application.restart()

    expect(application.currentCollision).toEqual({
      hasCollision: false,
    })
    expect(application.currentCollectibleCollisions).toEqual([])
    expect(application.currentPowerUpCollisions).toEqual([])
  })

  it('fully resets gameplay state when restarting after progress', () => {
    const scheduler = new FakeFrameScheduler()

    const obstacle = createObstacle()

    const coin: Collectible = {
      id: 'coin-1',
      type: 'coin',
      position: {
        x: 0,
        y: 0,
      },
      size: {
        width: 24,
        height: 24,
      },
      collisionBounds: {
        offsetX: 0,
        offsetY: 0,
        width: 24,
        height: 24,
      },
      velocity: {
        x: -280,
        y: 0,
      },
      isCollected: false,
    }

    const application = createApplication(
      scheduler,
      new FakeInput(),
      () => {},
      () => {},
      [obstacle],
      [coin],
    )

    application.start()
    scheduler.runNext(1000)

    expect(application.currentScore.value).toBe(1)
    expect(application.currentCoins).toEqual([])

    application.gameOver()
    application.restart()

    expect(application.state).toBe('READY')
    expect(application.currentMario).toEqual(createMario())
    expect(application.currentScenario).toEqual(createScenario())
    expect(application.currentScore.value).toBe(0)
    expect(application.currentLevel).toBe(
      calculateLevel({
        score: 0,
        pointsPerLevel: defaultGameplayConfig.progression.pointsPerLevel,
      }),
    )
    expect(application.currentObstacles).toEqual([])
    expect(application.currentCoins).toEqual([])
    expect(application.currentCollision).toEqual({
      hasCollision: false,
    })
    expect(application.currentCollectibleCollisions).toEqual([])
    expect(application.currentPowerUpCollisions).toEqual([])
  })

  it('does not start the session when crouch is active in READY', () => {
    const scheduler = new FakeFrameScheduler()
    const input = new FakeInput()
    const application = createApplication(scheduler, input)

    input.activate('crouch')

    scheduler.runNext(1000)

    expect(application.state).toBe('READY')
    expect(application.currentMario.movementState).toBe('RUNNING')
  })

  it('restarts the session when jump is active in GAME_OVER', () => {
    const scheduler = new FakeFrameScheduler()
    const input = new FakeInput()
    const application = createApplication(scheduler, input)

    application.start()
    application.gameOver()

    input.activate('jump')

    scheduler.runNext(1000)

    expect(application.state).toBe('READY')
    expect(application.currentMario.movementState).toBe('RUNNING')
    expect(application.currentMario.isGrounded).toBe(true)
  })

  it('does not update the scenario while READY', () => {
    const scheduler = new FakeFrameScheduler()
    const application = createApplication(scheduler)

    const scenarioBeforeFrame = structuredClone(application.currentScenario)

    scheduler.runNext(1000)

    expect(application.currentScenario).toEqual(scenarioBeforeFrame)
  })

  it('updates the scenario while RUNNING', () => {
    const scheduler = new FakeFrameScheduler()
    const application = createApplication(scheduler)

    application.start()
    scheduler.runNext(1000)
    scheduler.runNext(1250)

    expect(application.currentScenario.position.x).toBe(
      defaultGameplayConfig.scenario.speed * 0.25,
    )
  })

  it('does not update the scenario after GAME_OVER', () => {
    const scheduler = new FakeFrameScheduler()
    const application = createApplication(scheduler)

    application.start()
    scheduler.runNext(1000)

    const scenarioAtGameOver = structuredClone(application.currentScenario)

    application.gameOver()
    scheduler.runNext(1250)

    expect(application.currentScenario).toEqual(scenarioAtGameOver)
  })

  it('detects collision between Mario and an active obstacle', () => {
    const scheduler = new FakeFrameScheduler()

    const obstacle: Obstacle = {
      id: 'obstacle-1',
      type: OBSTACLE_TYPE.GROUND_SMALL,
      variant: 'MUNCHER',
      position: {
        x: 0,
        y: 0,
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
        x: 0,
        y: 0,
      },
    }

    const application = createApplication(
      scheduler,
      new FakeInput(),
      () => {},
      () => {},
      [obstacle],
    )

    application.start()
    scheduler.runNext(1000)

    expect(application.currentCollision).toEqual({
      hasCollision: false,
    })
  })

  it('ends the game when normal Mario collides with an air obstacle', () => {
    const scheduler = new FakeFrameScheduler()

    const airConfig = defaultGameplayConfig.obstacles[OBSTACLE_TYPE.AIR]

    const obstacle: Obstacle = {
      id: 'air-obstacle-1',
      type: OBSTACLE_TYPE.AIR,
      variant: 'CANNONBALL',
      position: {
        x: 0,
        y: -airConfig.groundOffset,
      },
      size: {
        width: airConfig.width,
        height: airConfig.height,
      },
      collisionBounds: airConfig.collisionBounds,
      velocity: {
        x: 0,
        y: 0,
      },
    }

    const application = createApplication(
      scheduler,
      new FakeInput(),
      () => {},
      () => {},
      [obstacle],
      [],
      createMario(-airConfig.groundOffset),
    )

    application.start()
    scheduler.runNext(16)

    expect(application.currentMario.lifeState).toBe(marioLifeState.DEAD)
    expect(application.state).toBe('GAME_OVER')
  })

  it('does not detect collision when obstacles do not overlap Mario', () => {
    const scheduler = new FakeFrameScheduler()

    const obstacle: Obstacle = {
      id: 'obstacle-1',
      type: OBSTACLE_TYPE.GROUND_SMALL,
      variant: 'MUNCHER',
      position: {
        x: 500,
        y: 0,
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
        x: 0,
        y: 0,
      },
    }

    const application = createApplication(
      scheduler,
      new FakeInput(),
      () => {},
      () => {},
      [obstacle],
    )

    application.start()
    scheduler.runNext(1000)

    expect(application.currentCollision).toEqual({
      hasCollision: false,
    })
    expect(application.state).toBe('RUNNING')
  })

  it('collects a collectible when Mario overlaps it', () => {
    const scheduler = new FakeFrameScheduler()

    const coin: Collectible = {
      id: 'coin-1',
      type: 'coin',
      position: {
        x: 0,
        y: 0,
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
        x: 0,
        y: 0,
      },
      isCollected: false,
    }

    const application = createApplication(
      scheduler,
      new FakeInput(),
      () => {},
      () => {},
      [],
      [coin],
    )

    application.start()
    scheduler.runNext(1000)

    expect(application.currentCollectibleCollisions).toEqual([coin])
    expect(application.currentCoins).toEqual([])
  })

  it('updates the score after collecting a coin', () => {
    const scheduler = new FakeFrameScheduler()

    const coin: Collectible = {
      id: 'coin-1',
      type: 'coin',
      position: { x: 0, y: 0 },
      size: { width: 24, height: 24 },
      collisionBounds: {
        offsetX: 2,
        offsetY: 2,
        width: 20,
        height: 20,
      },
      velocity: { x: 0, y: 0 },
      isCollected: false,
    }

    const application = createApplication(
      scheduler,
      new FakeInput(),
      () => {},
      () => {},
      [],
      [coin],
    )

    application.start()
    scheduler.runNext(1000)

    expect(application.currentScore.value).toBe(1)
    expect(application.currentLevel).toBe(1)
    expect(application.currentCoins).toEqual([])
  })

  it('updates the level when the score reaches 20 points', () => {
    const scheduler = new FakeFrameScheduler()

    const coins: Collectible[] = Array.from({ length: 20 }, (_, index) => ({
      id: `coin-${index + 1}`,
      type: 'coin',
      position: { x: 0, y: 0 },
      size: { width: 24, height: 24 },
      collisionBounds: {
        offsetX: 2,
        offsetY: 2,
        width: 20,
        height: 20,
      },
      velocity: { x: 0, y: 0 },
      isCollected: false,
    }))

    const application = createApplication(
      scheduler,
      new FakeInput(),
      () => {},
      () => {},
      [],
      coins,
    )

    application.start()
    scheduler.runNext(1000)

    expect(application.currentScore.value).toBe(20)
    expect(application.currentLevel).toBe(2)
    expect(application.currentCoins).toEqual([])
  })

  it('changes to GAME_OVER when normal Mario collides with an obstacle', () => {
    const scheduler = new FakeFrameScheduler()

    const obstacle: Obstacle = {
      id: 'obstacle-1',
      type: OBSTACLE_TYPE.GROUND_SMALL,
      variant: 'MUNCHER',
      position: {
        x: 0,
        y: 0,
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
        x: 0,
        y: 0,
      },
    }

    const application = createApplication(
      scheduler,
      new FakeInput(),
      () => {},
      () => {},
      [obstacle],
    )

    application.start()
    scheduler.runNext(1000)

    expect(application.currentMario.lifeState).toBe(marioLifeState.DEAD)
    expect(application.state).toBe('GAME_OVER')
  })

  it('emits the death event when normal Mario collides with an obstacle', () => {
    const scheduler = new FakeFrameScheduler()

    const obstacle: Obstacle = {
      id: 'obstacle-1',
      type: OBSTACLE_TYPE.GROUND_SMALL,
      variant: 'MUNCHER',
      position: {
        x: 0,
        y: 0,
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
        x: 0,
        y: 0,
      },
    }

    const events: GameEvent[] = []

    const application = createApplication(
      scheduler,
      new FakeInput(),
      undefined,
      undefined,
      [obstacle],
      [],
      createMario(),
      (event) => events.push(event),
    )

    application.start()
    scheduler.runNext(1000)

    expect(application.currentMario.lifeState).toBe(marioLifeState.DEAD)
    expect(application.state).toBe('GAME_OVER')
    expect(events).toEqual(['DEATH'])
  })

  it('removes Mario power after colliding with an obstacle', () => {
    const scheduler = new FakeFrameScheduler()

    const obstacle: Obstacle = {
      id: 'obstacle-1',
      type: OBSTACLE_TYPE.GROUND_SMALL,
      variant: 'MUNCHER',
      position: {
        x: 0,
        y: 0,
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
        x: 0,
        y: 0,
      },
    }

    const application = new GameApplication(
      scheduler,
      growMario(createMario(), {
        width: defaultGameplayConfig.mario.powered.width,
        height: defaultGameplayConfig.mario.powered.height,
        collisionBounds: defaultGameplayConfig.mario.powered.collisionBounds,
      }),
      createScenario(),
      new FakeInput(),
      () => {},
      () => {},
      [obstacle],
    )

    application.start()
    scheduler.runNext(1000)

    expect(application.currentMario.powerState).toBe('NORMAL')
    expect(application.currentMario.lifeState).toBe(marioLifeState.ALIVE)
    expect(application.state).toBe('RUNNING')
  })

  it('keeps the session running after Mario loses power', () => {
    const scheduler = new FakeFrameScheduler()

    const obstacle: Obstacle = {
      id: 'obstacle-1',
      type: OBSTACLE_TYPE.GROUND_SMALL,
      variant: 'MUNCHER',
      position: {
        x: 0,
        y: 0,
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
    }

    const application = new GameApplication(
      scheduler,
      growMario(createMario(), {
        width: defaultGameplayConfig.mario.powered.width,
        height: defaultGameplayConfig.mario.powered.height,
        collisionBounds: defaultGameplayConfig.mario.powered.collisionBounds,
      }),
      createScenario(),
      new FakeInput(),
      () => {},
      () => {},
      [obstacle],
    )

    application.start()
    scheduler.runNext(1000)

    expect(application.currentMario.powerState).toBe('NORMAL')
    expect(application.currentMario.lifeState).toBe(marioLifeState.ALIVE)
    expect(application.state).toBe('RUNNING')
  })

  it('continues running after Mario loses power from an obstacle collision', () => {
    const scheduler = new FakeFrameScheduler()

    const obstacle: Obstacle = {
      id: 'obstacle-1',
      type: OBSTACLE_TYPE.GROUND_SMALL,
      variant: 'MUNCHER',
      position: { x: 0, y: 0 },
      size: { width: 32, height: 32 },
      collisionBounds: {
        offsetX: 0,
        offsetY: 0,
        width: 32,
        height: 32,
      },
      velocity: { x: 0, y: 0 },
    }

    const application = new GameApplication(
      scheduler,
      growMario(createMario(), {
        width: defaultGameplayConfig.mario.powered.width,
        height: defaultGameplayConfig.mario.powered.height,
        collisionBounds: defaultGameplayConfig.mario.powered.collisionBounds,
      }),
      createScenario(),
      new FakeInput(),
      () => {},
      () => {},
      [obstacle],
    )

    application.start()

    scheduler.runNext(1000)

    expect(application.currentMario.powerState).toBe('NORMAL')
    expect(application.currentMario.lifeState).toBe(marioLifeState.ALIVE)
    expect(application.state).toBe('RUNNING')

    const positionAfterLoss = application.currentMario.position.x

    scheduler.runNext(2000)

    expect(application.state).toBe('RUNNING')
    expect(application.currentMario.powerState).toBe('NORMAL')
    expect(application.currentMario.position.x).toBeGreaterThan(
      positionAfterLoss,
    )
  })

  it('removes power from powered Mario without ending the game', () => {
    const scheduler = new FakeFrameScheduler()

    const obstacle: Obstacle = {
      id: 'obstacle-1',
      type: OBSTACLE_TYPE.GROUND_SMALL,
      variant: 'MUNCHER',
      position: { x: 0, y: 0 },
      size: { width: 32, height: 32 },
      collisionBounds: {
        offsetX: 0,
        offsetY: 0,
        width: 32,
        height: 32,
      },
      velocity: { x: 0, y: 0 },
    }

    const poweredMario = growMario(createMario(), {
      width: defaultGameplayConfig.mario.powered.width,
      height: defaultGameplayConfig.mario.powered.height,
      collisionBounds: defaultGameplayConfig.mario.powered.collisionBounds,
    })

    const application = new GameApplication(
      scheduler,
      poweredMario,
      createScenario(),
      new FakeInput(),
      () => {},
      () => {},
      [obstacle],
    )

    expect(application.currentMario.powerState).toBe('POWERED')

    application.start()
    scheduler.runNext(1000)

    expect(application.currentMario.powerState).toBe('NORMAL')
    expect(application.currentMario.lifeState).toBe(marioLifeState.ALIVE)
    expect(application.state).toBe('RUNNING')
  })

  it('does not immediately kill Mario after losing power to the same obstacle', () => {
    const scheduler = new FakeFrameScheduler()

    const obstacle: Obstacle = {
      id: 'obstacle-1',
      type: OBSTACLE_TYPE.GROUND_SMALL,
      variant: 'MUNCHER',
      position: { x: 0, y: 0 },
      size: { width: 32, height: 32 },
      collisionBounds: {
        offsetX: 0,
        offsetY: 0,
        width: 32,
        height: 32,
      },
      velocity: { x: 0, y: 0 },
    }

    const poweredMario = growMario(
      {
        ...createMario(),
        velocity: {
          x: 0,
          y: 0,
        },
      },
      {
        width: defaultGameplayConfig.mario.powered.width,
        height: defaultGameplayConfig.mario.powered.height,
        collisionBounds: defaultGameplayConfig.mario.powered.collisionBounds,
      },
    )

    const application = new GameApplication(
      scheduler,
      poweredMario,
      createScenario(),
      new FakeInput(),
      () => {},
      () => {},
      [obstacle],
    )

    application.start()

    scheduler.runNext(1000)

    expect(application.currentMario.powerState).toBe('NORMAL')
    expect(application.currentMario.lifeState).toBe(marioLifeState.ALIVE)
    expect(application.state).toBe('RUNNING')

    scheduler.runNext(1016)

    expect(application.currentMario.powerState).toBe('NORMAL')
    expect(application.currentMario.lifeState).toBe(marioLifeState.ALIVE)
    expect(application.state).toBe('RUNNING')
  })

  it('kills normal Mario after an obstacle collision', () => {
    const scheduler = new FakeFrameScheduler()

    const obstacle: Obstacle = {
      id: 'obstacle-1',
      type: OBSTACLE_TYPE.GROUND_SMALL,
      variant: 'MUNCHER',
      position: { x: 0, y: 0 },
      size: { width: 32, height: 32 },
      collisionBounds: {
        offsetX: 0,
        offsetY: 0,
        width: 32,
        height: 32,
      },
      velocity: { x: 0, y: 0 },
    }

    const application = new GameApplication(
      scheduler,
      createMario(),
      createScenario(),
      new FakeInput(),
      () => {},
      () => {},
      [obstacle],
    )

    application.start()
    scheduler.runNext(1000)

    expect(application.currentMario.lifeState).toBe(marioLifeState.DEAD)
    expect(application.state).toBe('GAME_OVER')
  })

  it('stops the gameplay update when normal Mario causes game over', () => {
    const scheduler = new FakeFrameScheduler()
    let updateCount = 0

    const obstacle: Obstacle = {
      id: 'obstacle-1',
      type: OBSTACLE_TYPE.GROUND_SMALL,
      variant: 'MUNCHER',
      position: {
        x: 0,
        y: 0,
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
        x: 0,
        y: 0,
      },
    }

    const application = createApplication(
      scheduler,
      new FakeInput(),
      () => {
        updateCount += 1
      },
      () => {},
      [obstacle],
    )

    application.start()
    scheduler.runNext(1000)

    expect(application.currentMario.lifeState).toBe(marioLifeState.DEAD)
    expect(application.state).toBe('GAME_OVER')
    expect(updateCount).toBe(0)
  })

  it('completes the fatal collision flow for normal Mario', () => {
    const scheduler = new FakeFrameScheduler()

    const obstacle: Obstacle = {
      id: 'obstacle-1',
      type: OBSTACLE_TYPE.GROUND_SMALL,
      variant: 'MUNCHER',
      position: { x: 0, y: 0 },
      size: { width: 32, height: 32 },
      collisionBounds: {
        offsetX: 0,
        offsetY: 0,
        width: 32,
        height: 32,
      },
      velocity: { x: 0, y: 0 },
    }

    let updateCount = 0

    const application = new GameApplication(
      scheduler,
      createMario(),
      createScenario(),
      new FakeInput(),
      () => {
        updateCount += 1
      },
      () => {},
      [obstacle],
    )

    expect(application.state).toBe('READY')
    expect(application.currentMario.lifeState).toBe(marioLifeState.ALIVE)

    application.start()

    expect(application.state).toBe('RUNNING')

    scheduler.runNext(1000)

    expect(application.currentMario.lifeState).toBe(marioLifeState.DEAD)
    expect(application.state).toBe('GAME_OVER')
    expect(updateCount).toBe(0)

    scheduler.runNext(2000)

    expect(application.state).toBe('GAME_OVER')
    expect(application.currentMario.lifeState).toBe(marioLifeState.DEAD)
    expect(updateCount).toBe(0)
  })

  it('completes the fatal collision flow after losing the power-up', () => {
    const scheduler = new FakeFrameScheduler()

    const firstObstacle: Obstacle = {
      id: 'obstacle-1',
      type: OBSTACLE_TYPE.GROUND_SMALL,
      variant: 'MUNCHER',
      position: {
        x: 0,
        y: 0,
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
        x: 0,
        y: 0,
      },
    }

    const secondObstacle: Obstacle = {
      id: 'obstacle-2',
      type: OBSTACLE_TYPE.GROUND_SMALL,
      variant: 'MUNCHER',
      position: {
        x: 280,
        y: 0,
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
        x: 0,
        y: 0,
      },
    }

    const poweredMario = growMario(createMario(), {
      width: defaultGameplayConfig.mario.powered.width,
      height: defaultGameplayConfig.mario.powered.height,
      collisionBounds: defaultGameplayConfig.mario.powered.collisionBounds,
    })

    const application = new GameApplication(
      scheduler,
      poweredMario,
      createScenario(),
      new FakeInput(),
      () => {},
      () => {},
      [firstObstacle, secondObstacle],
    )

    expect(application.state).toBe('READY')
    expect(application.currentMario.lifeState).toBe(marioLifeState.ALIVE)
    expect(application.currentMario.powerState).toBe(marioPowerState.POWERED)

    application.start()

    expect(application.state).toBe('RUNNING')

    scheduler.runNext(1000)

    expect(application.currentMario.lifeState).toBe(marioLifeState.ALIVE)
    expect(application.currentMario.powerState).toBe(marioPowerState.NORMAL)
    expect(application.state).toBe('RUNNING')

    scheduler.runNext(2000)

    expect(application.currentMario.lifeState).toBe(marioLifeState.DEAD)
    expect(application.currentMario.powerState).toBe(marioPowerState.NORMAL)
    expect(application.state).toBe('GAME_OVER')

    scheduler.runNext(3000)

    expect(application.currentMario.lifeState).toBe(marioLifeState.DEAD)
    expect(application.currentMario.powerState).toBe(marioPowerState.NORMAL)
    expect(application.state).toBe('GAME_OVER')
  })

  it('keeps the game over state stable after a fatal collision', () => {
    const scheduler = new FakeFrameScheduler()

    const obstacle: Obstacle = {
      id: 'obstacle-1',
      type: OBSTACLE_TYPE.GROUND_SMALL,
      variant: 'MUNCHER',
      position: {
        x: 0,
        y: 0,
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
        x: 0,
        y: 0,
      },
    }

    let updateCount = 0
    let renderCount = 0

    const application = new GameApplication(
      scheduler,
      createMario(),
      createScenario(),
      new FakeInput(),
      () => {
        updateCount += 1
      },
      () => {
        renderCount += 1
      },
      [obstacle],
    )

    application.start()

    expect(application.state).toBe('RUNNING')

    scheduler.runNext(1000)

    expect(application.currentMario.lifeState).toBe(marioLifeState.DEAD)
    expect(application.state).toBe('GAME_OVER')
    expect(updateCount).toBe(0)
    expect(renderCount).toBe(1)

    scheduler.runNext(2000)
    scheduler.runNext(3000)

    expect(application.state).toBe('GAME_OVER')
    expect(application.currentMario.lifeState).toBe(marioLifeState.DEAD)
    expect(updateCount).toBe(0)
    expect(renderCount).toBe(3)
  })

  it('restarts the game from Game Over with a clean initial state', () => {
    const scheduler = new FakeFrameScheduler()

    const obstacle: Obstacle = {
      id: 'obstacle-1',
      type: OBSTACLE_TYPE.GROUND_SMALL,
      variant: 'MUNCHER',
      position: {
        x: 0,
        y: 0,
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
        x: 0,
        y: 0,
      },
    }

    const application = new GameApplication(
      scheduler,
      createMario(),
      createScenario(),
      new FakeInput(),
      () => {},
      () => {},
      [obstacle],
    )

    application.start()
    scheduler.runNext(1000)

    expect(application.state).toBe('GAME_OVER')
    expect(application.currentMario.lifeState).toBe(marioLifeState.DEAD)

    application.restart()

    expect(application.state).toBe('READY')
    expect(application.currentMario.lifeState).toBe(marioLifeState.ALIVE)
    expect(application.currentMario.powerState).toBe(marioPowerState.NORMAL)
    expect(application.currentMario.position).toEqual({
      x: 0,
      y: 0,
    })
    expect(application.currentMario.velocity).toEqual({
      x: 280,
      y: 0,
    })
    expect(application.currentScore.value).toBe(0)
    expect(application.currentLevel).toBe(1)
    expect(application.currentObstacles).toEqual([])
    expect(application.currentCoins).toEqual([])
    expect(application.currentPowerUps).toEqual([])
    expect(application.currentCollision).toEqual({
      hasCollision: false,
    })
    expect(application.currentCollectibleCollisions).toEqual([])
    expect(application.currentPowerUpCollisions).toEqual([])
  })

  it('starts a new independent match after restarting from Game Over', () => {
    const scheduler = new FakeFrameScheduler()

    const obstacle: Obstacle = {
      id: 'obstacle-1',
      type: OBSTACLE_TYPE.GROUND_SMALL,
      variant: 'MUNCHER',
      position: {
        x: 1000,
        y: 0,
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
        x: 0,
        y: 0,
      },
    }

    let updateCount = 0

    const application = new GameApplication(
      scheduler,
      createMario(),
      createScenario(),
      new FakeInput(),
      () => {
        updateCount += 1
      },
      () => {},
      [obstacle],
    )

    application.start()

    expect(application.state).toBe('RUNNING')

    scheduler.runNext(1000)

    expect(application.state).toBe('RUNNING')
    expect(updateCount).toBe(1)

    application.gameOver()

    expect(application.state).toBe('GAME_OVER')

    application.restart()

    expect(application.state).toBe('READY')
    expect(application.currentMario.lifeState).toBe(marioLifeState.ALIVE)
    expect(application.currentMario.powerState).toBe(marioPowerState.NORMAL)

    application.start()

    expect(application.state).toBe('RUNNING')

    scheduler.runNext(2000)

    expect(application.state).toBe('RUNNING')
    expect(application.currentMario.lifeState).toBe(marioLifeState.ALIVE)
    expect(application.currentMario.powerState).toBe(marioPowerState.NORMAL)
    expect(updateCount).toBe(2)
  })

  it('reproduces the same obstacle type after restarting', () => {
    const scheduler = new FakeFrameScheduler()

    const application = createApplication(scheduler)

    application.start()

    scheduler.runNext(1000)
    scheduler.runNext(2000)
    scheduler.runNext(3000)

    expect(application.currentObstacles).toHaveLength(1)

    const firstObstacle = application.currentObstacles[0]

    application.gameOver()
    application.restart()
    application.start()

    scheduler.runNext(4000)
    scheduler.runNext(5000)
    scheduler.runNext(6000)

    expect(application.currentObstacles).toHaveLength(1)

    const secondObstacle = application.currentObstacles[0]

    expect(secondObstacle.id).toBe('obstacle-1')
    expect(secondObstacle.type).toBe(firstObstacle.type)
    expect(secondObstacle.size).toEqual(firstObstacle.size)
    expect(secondObstacle.collisionBounds).toEqual(
      firstObstacle.collisionBounds,
    )
    expect(secondObstacle.velocity).toEqual(firstObstacle.velocity)
  })

  it('emits the lose-power event when powered Mario collides with an obstacle', () => {
    const scheduler = new FakeFrameScheduler()
    const obstacle: Obstacle = {
      id: 'obstacle-1',
      type: OBSTACLE_TYPE.GROUND_SMALL,
      variant: 'MUNCHER',
      position: {
        x: 0,
        y: 0,
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
        x: 0,
        y: 0,
      },
    }

    const poweredMario = growMario(createMario(), {
      width: defaultGameplayConfig.mario.powered.width,
      height: defaultGameplayConfig.mario.powered.height,
      collisionBounds: defaultGameplayConfig.mario.powered.collisionBounds,
    })

    const events: GameEvent[] = []

    const application = createApplication(
      scheduler,
      new FakeInput(),
      undefined,
      undefined,
      [obstacle],
      [],
      poweredMario,
      (event) => events.push(event),
    )

    application.start()
    scheduler.runNext(1000)

    expect(application.currentMario.powerState).toBe(marioPowerState.NORMAL)
    expect(application.currentMario.lifeState).toBe(marioLifeState.ALIVE)
    expect(events).toEqual(['LOSE_POWER'])
  })
})
