import { describe, expect, it } from 'vitest'

import { Clock } from '../time/clock'
import type { FrameCallback, FrameScheduler } from './frame-scheduler'
import { GameLoop } from './game-loop'

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

describe('GameLoop', () => {
  it('schedules a frame when started', () => {
    const scheduler = new FakeFrameScheduler()
    const clock = new Clock()

    const update = (): void => {}
    const render = (): void => {}
    const loop = new GameLoop(clock, scheduler, update, render)

    loop.start()

    expect(scheduler.pendingFrames).toBe(1)
  })

  it('updates before rendering and schedules the next frame', () => {
    const scheduler = new FakeFrameScheduler()
    const clock = new Clock()

    const events: string[] = []
    let receivedDeltaTime = 0
    let receivedElapsedTime = 0

    const update = (gameTime: {
      deltaTime: number
      elapsedTime: number
    }): void => {
      events.push('update')
      receivedDeltaTime = gameTime.deltaTime
      receivedElapsedTime = gameTime.elapsedTime
    }

    const render = (): void => {
      events.push('render')
    }

    const loop = new GameLoop(clock, scheduler, update, render)

    loop.start()

    scheduler.runNext(1000)
    scheduler.runNext(1250)

    expect(events).toEqual(['update', 'render', 'update', 'render'])
    expect(receivedDeltaTime).toBe(0.25)
    expect(receivedElapsedTime).toBe(0.25)
    expect(scheduler.pendingFrames).toBe(1)
  })

  it('does not schedule multiple frames when started repeatedly', () => {
    const scheduler = new FakeFrameScheduler()
    const clock = new Clock()

    const loop = new GameLoop(
      clock,
      scheduler,
      () => {},
      () => {},
    )

    loop.start()
    loop.start()

    expect(scheduler.pendingFrames).toBe(1)
  })

  it('cancels the pending frame when stopped', () => {
    const scheduler = new FakeFrameScheduler()
    const clock = new Clock()

    const loop = new GameLoop(
      clock,
      scheduler,
      () => {},
      () => {},
    )

    loop.start()
    loop.stop()

    expect(scheduler.pendingFrames).toBe(0)
  })

  it('allows stop to be called without a pending frame', () => {
    const scheduler = new FakeFrameScheduler()
    const clock = new Clock()

    const loop = new GameLoop(
      clock,
      scheduler,
      () => {},
      () => {},
    )

    expect(() => loop.stop()).not.toThrow()
  })
})
