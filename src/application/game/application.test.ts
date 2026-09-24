import { describe, expect, it } from 'vitest'

import { defaultGameplayConfig } from '../../domain/config/default-gameplay-config'
import type { Mario } from '../../domain/mario/mario'
import type { GameplayCommand } from '../../domain/input'
import type { GameTime } from '../../domain/time'
import type { Input } from '../input'
import type {
  FrameCallback,
  FrameScheduler,
} from '../game-loop/frame-scheduler'
import { GameApplication } from './application'
import type { Scenario } from '../../domain/scenario/scenario'

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

const createApplication = (
  scheduler: FakeFrameScheduler,
  input: FakeInput = new FakeInput(),
  update: (gameTime: GameTime) => void = () => {},
  render: (gameTime: GameTime) => void = () => {},
): GameApplication =>
  new GameApplication(
    scheduler,
    createMario(),
    createScenario(),
    input,
    update,
    render,
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

  it('starts Mario crouch when crouch is active in RUNNING', () => {
    const scheduler = new FakeFrameScheduler()
    const input = new FakeInput()
    const application = createApplication(scheduler, input)

    application.start()
    input.activate('crouch')

    scheduler.runNext(1000)

    expect(application.currentMario.movementState).toBe('CROUCHING')
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
})
