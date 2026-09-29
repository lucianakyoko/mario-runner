import { describe, expect, it } from 'vitest'

import type { GameplayCommand } from '../../domain/input'
import type { Mario } from '../../domain/mario/mario'
import type { PowerUp } from '../../domain/power-up/power-up'
import { POWER_UP_TYPE } from '../../domain/power-up/power-up-type'
import type { Scenario } from '../../domain/scenario/scenario'
import type {
  FrameCallback,
  FrameScheduler,
} from '../game-loop/frame-scheduler'
import type { Input } from '../input'
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
  powerState: 'NORMAL',
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

const createMushroom = (x: number, y = 0, id = 'mushroom-1'): PowerUp => ({
  id,
  type: POWER_UP_TYPE.MUSHROOM,
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
    x: 0,
    y: 0,
  },
  isCollected: false,
})

const createApplication = (
  scheduler: FakeFrameScheduler,
  powerUps: PowerUp[] = [],
): GameApplication =>
  new GameApplication(
    scheduler,
    createMario(),
    createScenario(),
    new FakeInput(),
    () => {},
    () => {},
    [],
    [],
    powerUps,
  )

describe('GameApplication power-up transformation', () => {
  it('transforms Mario into powered state after consuming a mushroom', () => {
    const scheduler = new FakeFrameScheduler()
    const mushroom = createMushroom(0)
    const application = createApplication(scheduler, [mushroom])

    application.start()
    scheduler.runNext(1000)

    expect(application.currentMario.powerState).toBe('POWERED')
  })

  it('applies the powered Mario size and collision bounds', () => {
    const scheduler = new FakeFrameScheduler()
    const mushroom = createMushroom(0)
    const application = createApplication(scheduler, [mushroom])

    application.start()
    scheduler.runNext(1000)

    expect(application.currentMario.size).toEqual({
      width: 32,
      height: 64,
    })

    expect(application.currentMario.collisionBounds).toEqual({
      offsetX: 2,
      offsetY: 2,
      width: 28,
      height: 60,
    })
  })

  it('preserves Mario position and movement when transforming', () => {
    const scheduler = new FakeFrameScheduler()
    const mushroom = createMushroom(0)
    const application = createApplication(scheduler, [mushroom])

    application.start()
    scheduler.runNext(1000)

    expect(application.currentMario.position).toEqual({
      x: 0,
      y: 0,
    })

    expect(application.currentMario.velocity).toEqual({
      x: 280,
      y: 0,
    })

    expect(application.currentMario.movementState).toBe('RUNNING')
    expect(application.currentMario.isGrounded).toBe(true)
  })

  it('does not transform Mario when the mushroom does not collide', () => {
    const scheduler = new FakeFrameScheduler()
    const mushroom = createMushroom(500)
    const application = createApplication(scheduler, [mushroom])

    application.start()
    scheduler.runNext(1000)

    expect(application.currentMario.powerState).toBe('NORMAL')
    expect(application.currentMario.size).toEqual({
      width: 32,
      height: 48,
    })
  })

  it('keeps Mario powered when consuming another mushroom', () => {
    const scheduler = new FakeFrameScheduler()
    const firstMushroom = createMushroom(0, 0, 'mushroom-1')
    const secondMushroom = createMushroom(280, 0, 'mushroom-2')
    const application = createApplication(scheduler, [
      firstMushroom,
      secondMushroom,
    ])

    application.start()
    scheduler.runNext(1000)

    expect(application.currentMario.powerState).toBe('POWERED')
    expect(application.currentPowerUps).toEqual([secondMushroom])

    scheduler.runNext(2000)

    expect(application.currentMario.powerState).toBe('POWERED')
    expect(application.currentMario.size).toEqual({
      width: 32,
      height: 64,
    })
    expect(application.currentMario.collisionBounds).toEqual({
      offsetX: 2,
      offsetY: 2,
      width: 28,
      height: 60,
    })
    expect(application.currentPowerUps).toEqual([])
  })
})
