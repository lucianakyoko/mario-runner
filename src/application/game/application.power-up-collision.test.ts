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

describe('GameApplication power-up collision', () => {
  it('detects a collision between Mario and a mushroom', () => {
    const scheduler = new FakeFrameScheduler()
    const mushroom = createMushroom(0)
    const application = createApplication(scheduler, [mushroom])

    application.start()
    scheduler.runNext(1000)

    expect(application.currentPowerUpCollisions).toEqual([mushroom])
  })

  it('does not detect a mushroom that does not overlap Mario', () => {
    const scheduler = new FakeFrameScheduler()
    const mushroom = createMushroom(500)
    const application = createApplication(scheduler, [mushroom])

    application.start()
    scheduler.runNext(1000)

    expect(application.currentPowerUpCollisions).toEqual([])
  })

  it('does not detect a mushroom that is already collected', () => {
    const scheduler = new FakeFrameScheduler()
    const mushroom = createMushroom(0, 0, true)
    const application = createApplication(scheduler, [mushroom])

    application.start()
    scheduler.runNext(1000)

    expect(application.currentPowerUpCollisions).toEqual([])
  })

  it('uses the mushroom collision bounds instead of its visual size', () => {
    const scheduler = new FakeFrameScheduler()

    const mushroom: PowerUp = {
      ...createMushroom(0),
      size: {
        width: 100,
        height: 100,
      },
      collisionBounds: {
        offsetX: 40,
        offsetY: 40,
        width: 10,
        height: 10,
      },
    }

    const application = createApplication(scheduler, [mushroom])

    application.start()
    scheduler.runNext(1000)

    expect(application.currentPowerUpCollisions).toEqual([])
  })

  it('does not consume or transform the mushroom during collision detection', () => {
    const scheduler = new FakeFrameScheduler()
    const mushroom = createMushroom(0)
    const application = createApplication(scheduler, [mushroom])

    application.start()
    scheduler.runNext(1000)

    expect(application.currentPowerUpCollisions).toEqual([mushroom])
    expect(application.currentPowerUps).toEqual([mushroom])
    expect(application.currentMario.powerState).toBe('NORMAL')
  })

  it('clears power-up collisions when restarting', () => {
    const scheduler = new FakeFrameScheduler()
    const mushroom = createMushroom(0)
    const application = createApplication(scheduler, [mushroom])

    application.start()
    scheduler.runNext(1000)

    expect(application.currentPowerUpCollisions).toEqual([mushroom])

    application.gameOver()
    application.restart()

    expect(application.currentPowerUpCollisions).toEqual([])
  })
})
