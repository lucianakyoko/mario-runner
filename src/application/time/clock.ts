import type { GameTime } from '../../domain/time'

export class Clock {
  private previousTimestamp: number | null = null
  private elapsedTime = 0

  tick(currentTimestamp: number): GameTime {
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
