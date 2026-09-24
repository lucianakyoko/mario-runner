import type { Random } from '../../domain/random/random'

const MULTIPLIER = 1664525
const INCREMENT = 1013904223
const MODULUS = 2 ** 32

export class SeededRandom implements Random {
  private state: number

  constructor(seed: number) {
    this.state = seed >>> 0
  }

  next(): number {
    this.state = (MULTIPLIER * this.state + INCREMENT) % MODULUS

    return this.state / MODULUS
  }

  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min
  }
}
