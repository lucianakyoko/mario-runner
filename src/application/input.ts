import type { GameplayCommand } from '../domain/input'

export interface Input {
  isActive(command: GameplayCommand): boolean
}
