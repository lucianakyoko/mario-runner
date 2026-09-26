import { describe, expect, it } from 'vitest'

import { defaultGameplayConfig } from '../../domain/config/default-gameplay-config'
import type { GameplayCommand } from '../../domain/input'
import type { Mario } from '../../domain/mario/mario'
import type { Obstacle } from '../../domain/obstacle/obstacle'
import { OBSTACLE_TYPE } from '../../domain/obstacle/obstacle-type'
import type { Scenario } from '../../domain/scenario/scenario'
import type { GameTime } from '../../domain/time'
import type { Input } from '../input'
import type {
  FrameCallback,
  FrameScheduler,
} from '../game-loop/frame-scheduler'
import { GameApplication } from './application'

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
})

const createObstacle = (): Obstacle => ({
  id: 'obstacle-1',
  type: OBSTACLE_TYPE.GROUND_SMALL,
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
): GameApplication =>
  new GameApplication(
    scheduler,
    createMario(),
    createScenario(),
    input,
    update,
    render,
    obstacles,
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

  it('completes the obstacle lifecycle during gameplay', () => {
    const scheduler = new FakeFrameScheduler()

    const obstacle: Obstacle = {
      id: 'old-obstacle',
      type: OBSTACLE_TYPE.GROUND_SMALL,
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

  it('does not start the session when crouch is active in READY', () => {
    const scheduler = new FakeFrameScheduler()
    const input = new FakeInput()
    const application = createApplication(scheduler, input)

    input.activate('crouch')

    scheduler.runNext(1000)

    expect(application.state).toBe('READY')
    expect(application.currentMario.movementState).toBe('RUNNING')
  })

  it('ignores gameplay commands in GAME_OVER', () => {
    const scheduler = new FakeFrameScheduler()
    const input = new FakeInput()
    const application = createApplication(scheduler, input)

    application.start()
    application.gameOver()

    input.activate('jump')
    input.activate('crouch')

    scheduler.runNext(1000)

    expect(application.state).toBe('GAME_OVER')
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
      hasCollision: true,
    })
  })

  it('does not detect collision when obstacles do not overlap Mario', () => {
    const scheduler = new FakeFrameScheduler()

    const obstacle: Obstacle = {
      id: 'obstacle-1',
      type: OBSTACLE_TYPE.GROUND_SMALL,
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
  })

  it('does not trigger game over when a collision is detected', () => {
    const scheduler = new FakeFrameScheduler()

    const obstacle: Obstacle = {
      id: 'obstacle-1',
      type: OBSTACLE_TYPE.GROUND_SMALL,
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
      hasCollision: true,
    })
    expect(application.state).toBe('RUNNING')
  })
})
