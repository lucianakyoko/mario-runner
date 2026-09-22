import type { GameTime } from '../../domain/time'
import type { Clock } from '../time/clock'
import type { FrameScheduler } from './frame-scheduler'
import type { Render } from './render'
import type { Update } from './update'

export class GameLoop {
  private readonly clock: Clock
  private readonly scheduler: FrameScheduler
  private readonly update: Update
  private readonly render: Render
  private requestId: number | null = null

  constructor(
    clock: Clock,
    scheduler: FrameScheduler,
    update: Update,
    render: Render,
  ) {
    this.clock = clock
    this.scheduler = scheduler
    this.update = update
    this.render = render
  }

  start(): void {
    if (this.requestId !== null) {
      return
    }

    this.requestId = this.scheduler.request(this.frame)
  }

  stop(): void {
    if (this.requestId === null) {
      return
    }

    this.scheduler.cancel(this.requestId)
    this.requestId = null
  }

  private frame = (timestamp: number): void => {
    this.requestId = null

    const gameTime: GameTime = this.clock.tick(timestamp)

    this.update(gameTime)
    this.render()

    this.requestId = this.scheduler.request(this.frame)
  }
}
