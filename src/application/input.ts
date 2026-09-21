import type { GameplayCommand } from '../domain/input'

export interface Input {
  isActive(comand: GameplayCommand): boolean
}
