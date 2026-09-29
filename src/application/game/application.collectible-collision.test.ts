import { describe, expect, it } from 'vitest'

import type { Collectible } from '../../domain/collectible/collectible'
import { collectibleTypes } from '../../domain/collectible/collectible-type'
import type { GameplayCommand } from '../../domain/input'
import type { Mario } from '../../domain/mario/mario'
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

const createCoin = (
  x: number,
  y = 0,
  isCollected = false,
  id = 'coin-1',
): Collectible => ({
  id,
  type: collectibleTypes.COIN,
  position: {
    x,
    y,
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
  isCollected,
})

const createMedal = (
  x: number,
  y = 0,
  isCollected = false,
  id = 'medal-1',
): Collectible => ({
  id,
  type: collectibleTypes.MEDAL,
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
  isCollected,
})

const createApplication = (
  scheduler: FakeFrameScheduler,
  coins: Collectible[] = [],
): GameApplication =>
  new GameApplication(
    scheduler,
    createMario(),
    createScenario(),
    new FakeInput(),
    () => {},
    () => {},
    [],
    coins,
  )

describe('GameApplication collectible collision', () => {
  it('detects a collision between Mario and a coin', () => {
    const scheduler = new FakeFrameScheduler()
    const coin = createCoin(0)
    const application = createApplication(scheduler, [coin])

    application.start()
    scheduler.runNext(1000)

    expect(application.currentCollectibleCollisions).toEqual([coin])
  })

  it('adds the coin score when Mario collects a coin', () => {
    const scheduler = new FakeFrameScheduler()
    const coin = createCoin(0)
    const application = createApplication(scheduler, [coin])

    application.start()
    scheduler.runNext(1000)

    expect(application.currentScore).toEqual({
      value: 1,
    })
  })

  it('detects a collision between Mario and a medal', () => {
    const scheduler = new FakeFrameScheduler()
    const medal = createMedal(0)
    const application = createApplication(scheduler, [medal])

    application.start()
    scheduler.runNext(1000)

    expect(application.currentCollectibleCollisions).toEqual([medal])
  })

  it('adds the medal score when Mario collects a medal', () => {
    const scheduler = new FakeFrameScheduler()
    const medal = createMedal(0)
    const application = createApplication(scheduler, [medal])

    application.start()
    scheduler.runNext(1000)

    expect(application.currentScore).toEqual({
      value: 2,
    })
  })

  it('does not detect a collectible that does not overlap Mario', () => {
    const scheduler = new FakeFrameScheduler()
    const coin = createCoin(500)
    const application = createApplication(scheduler, [coin])

    application.start()
    scheduler.runNext(1000)

    expect(application.currentCollectibleCollisions).toEqual([])
  })

  it('does not detect a collectible that is already collected', () => {
    const scheduler = new FakeFrameScheduler()
    const coin = createCoin(0, 0, true)
    const application = createApplication(scheduler, [coin])

    application.start()
    scheduler.runNext(1000)

    expect(application.currentCollectibleCollisions).toEqual([])
  })

  it('detects multiple active collectibles in the same frame', () => {
    const scheduler = new FakeFrameScheduler()
    const coin = createCoin(0)
    const medal = createMedal(0)
    const application = createApplication(scheduler, [coin, medal])

    application.start()
    scheduler.runNext(1000)

    expect(application.currentCollectibleCollisions).toEqual([coin, medal])
  })

  it('clears collectible collisions when restarting', () => {
    const scheduler = new FakeFrameScheduler()
    const coin = createCoin(0)
    const application = createApplication(scheduler, [coin])

    application.start()
    scheduler.runNext(1000)

    expect(application.currentCollectibleCollisions).toEqual([coin])

    application.gameOver()
    application.restart()

    expect(application.currentCollectibleCollisions).toEqual([])
  })

  it('uses the collectible collision bounds instead of its visual size', () => {
    const scheduler = new FakeFrameScheduler()

    const coin: Collectible = {
      ...createCoin(0),
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

    const application = createApplication(scheduler, [coin])

    application.start()
    scheduler.runNext(1000)

    expect(application.currentCollectibleCollisions).toEqual([])
  })

  it('removes a collected coin from the active collectibles', () => {
    const scheduler = new FakeFrameScheduler()
    const coin = createCoin(0)
    const application = createApplication(scheduler, [coin])

    application.start()
    scheduler.runNext(1000)

    expect(application.currentCoins).toEqual([])
  })

  it('removes a collected medal from the active collectibles', () => {
    const scheduler = new FakeFrameScheduler()
    const medal = createMedal(0)
    const application = createApplication(scheduler, [medal])

    application.start()
    scheduler.runNext(1000)

    expect(application.currentCoins).toEqual([])
  })

  it('does not collect the same collectible again', () => {
    const scheduler = new FakeFrameScheduler()
    const coin = createCoin(0)
    const application = createApplication(scheduler, [coin])

    application.start()
    scheduler.runNext(1000)

    expect(application.currentCollectibleCollisions).toEqual([coin])

    scheduler.runNext(1016)

    expect(application.currentCollectibleCollisions).toEqual([])
    expect(application.currentCoins).toEqual([])
  })

  it('resets the score when restarting', () => {
    const scheduler = new FakeFrameScheduler()
    const coin = createCoin(0)
    const application = createApplication(scheduler, [coin])

    application.start()
    scheduler.runNext(1000)

    expect(application.currentScore).toEqual({
      value: 1,
    })

    application.gameOver()
    application.restart()

    expect(application.currentScore).toEqual({
      value: 0,
    })
  })

  it('adds the score of multiple collectibles collected in the same frame', () => {
    const scheduler = new FakeFrameScheduler()

    const coin = createCoin(0)
    const medal = createMedal(0)

    const application = createApplication(scheduler, [coin, medal])

    application.start()
    scheduler.runNext(1000)

    expect(application.currentScore).toEqual({
      value: 3,
    })
  })

  it('keeps level 1 with 19 points', () => {
    const scheduler = new FakeFrameScheduler()
    const collectibles = [
      ...Array.from({ length: 9 }, (_, index) =>
        createMedal(0, 0, false, `medal-${index + 1}`),
      ),
      createCoin(0, 0, false, 'coin-1'),
    ]

    const application = createApplication(scheduler, collectibles)

    application.start()
    scheduler.runNext(1000)

    expect(application.currentScore).toEqual({
      value: 19,
    })
    expect(application.currentLevel).toBe(1)
  })

  it('starts level 2 at 20 points', () => {
    const scheduler = new FakeFrameScheduler()
    const collectibles = Array.from({ length: 10 }, (_, index) =>
      createMedal(0, 0, false, `medal-${index + 1}`),
    )

    const application = createApplication(scheduler, collectibles)

    application.start()
    scheduler.runNext(1000)

    expect(application.currentScore).toEqual({
      value: 20,
    })
    expect(application.currentLevel).toBe(2)
  })

  it('starts level 3 at 40 points', () => {
    const scheduler = new FakeFrameScheduler()
    const collectibles = Array.from({ length: 20 }, (_, index) =>
      createMedal(0, 0, false, `medal-${index + 1}`),
    )

    const application = createApplication(scheduler, collectibles)

    application.start()
    scheduler.runNext(1000)

    expect(application.currentScore).toEqual({
      value: 40,
    })
    expect(application.currentLevel).toBe(3)
  })

  it('detects a collision when Mario reaches the configured coin height', () => {
    const scheduler = new FakeFrameScheduler()

    const coin = createCoin(0, -48)
    const application = createApplication(scheduler, [coin])

    application.currentMario.position.y = -48

    application.start()
    scheduler.runNext(1000)

    expect(application.currentCollectibleCollisions).toEqual([coin])
  })

  it('does not collide with a spawned coin while Mario is at ground level', () => {
    const scheduler = new FakeFrameScheduler()
    const coin = createCoin(0, 48)

    const application = createApplication(scheduler, [coin])

    application.start()
    scheduler.runNext(16)

    expect(application.currentCollectibleCollisions).toEqual([])
  })
})
