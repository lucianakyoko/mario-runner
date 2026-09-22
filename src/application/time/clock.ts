import type { GameTime } from '../../domain/time'

export type TimeSource = () => number

export class Clock {
  private readonly timeSource: TimeSource
  private previousTimestamp: number | null = null
  private elapsedTime = 0

  constructor(timeSource: TimeSource) {
    this.timeSource = timeSource
  }

  tick(): GameTime {
    const currentTimestamp = this.timeSource()

    if (this.previousTimestamp === null) {
      this.previousTimestamp = currentTimestamp

      return {
        deltaTime: 0,
        elapsedTime: 0,
      }
    }

    const deltaTime = (currentTimestamp - this.previousTimestamp) / 1000

    this.previousTimestamp = currentTimestamp
    this.elapsedTime += deltaTime

    return {
      deltaTime,
      elapsedTime: this.elapsedTime,
    }
  }
}
