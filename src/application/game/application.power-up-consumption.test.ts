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

const createMushroom = (
  x: number,
  y = 0,
  isCollected = false,
  id = 'mushroom-1',
): PowerUp => ({
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
  isCollected,
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

describe('GameApplication power-up consumption', () => {
  it('removes a mushroom after a collision', () => {
    const scheduler = new FakeFrameScheduler()
    const mushroom = createMushroom(0)
    const application = createApplication(scheduler, [mushroom])

    application.start()
    scheduler.runNext(1000)

    expect(application.currentPowerUps).toEqual([])
  })

  it('does not consume a mushroom without a collision', () => {
    const scheduler = new FakeFrameScheduler()
    const mushroom = createMushroom(500)
    const application = createApplication(scheduler, [mushroom])

    application.start()
    scheduler.runNext(1000)

    expect(application.currentPowerUps).toEqual([mushroom])
  })

  it('does not consume an already collected mushroom', () => {
    const scheduler = new FakeFrameScheduler()
    const mushroom = createMushroom(0, 0, true)
    const application = createApplication(scheduler, [mushroom])

    application.start()
    scheduler.runNext(1000)

    expect(application.currentPowerUps).toEqual([])
  })

  it('consumes only the mushrooms that collide with Mario', () => {
    const scheduler = new FakeFrameScheduler()
    const collidingMushroom = createMushroom(0, 0, false, 'mushroom-1')
    const distantMushroom = createMushroom(500, 0, false, 'mushroom-2')
    const application = createApplication(scheduler, [
      collidingMushroom,
      distantMushroom,
    ])

    application.start()
    scheduler.runNext(1000)

    expect(application.currentPowerUps).toEqual([distantMushroom])
  })

  it('does not transform Mario while consuming the mushroom', () => {
    const scheduler = new FakeFrameScheduler()
    const mushroom = createMushroom(0)
    const application = createApplication(scheduler, [mushroom])

    application.start()
    scheduler.runNext(1000)

    expect(application.currentPowerUps).toEqual([])
    expect(application.currentMario.powerState).toBe('NORMAL')
  })
})
