import { describe, expect, it } from 'vitest'

import type { GameTime } from '../../domain/time'
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

describe('GameApplication', () => {
  it('starts in READY', () => {
    const scheduler = new FakeFrameScheduler()
    const application = new GameApplication(
      scheduler,
      () => {},
      () => {},
    )

    expect(application.state).toBe('READY')
  })

  it('changes to RUNNING and starts the game loop', () => {
    const scheduler = new FakeFrameScheduler()
    const application = new GameApplication(
      scheduler,
      () => {},
      () => {},
    )

    application.start()

    expect(application.state).toBe('RUNNING')
    expect(scheduler.pendingFrames).toBe(1)
  })

  it('updates and renders while RUNNING', () => {
    const scheduler = new FakeFrameScheduler()
    const gameTimes: GameTime[] = []
    let renderCount = 0

    const application = new GameApplication(
      scheduler,
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

    const application = new GameApplication(
      scheduler,
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
    const application = new GameApplication(
      scheduler,
      () => {},
      () => {},
    )

    application.start()
    application.gameOver()
    application.restart()

    expect(application.state).toBe('READY')
  })
})
