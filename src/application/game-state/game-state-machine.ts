import type { GameState } from '../../domain/game/game-state'
import { transitionGameState } from '../../domain/game/game-state-transition'

export class GameStateMachine {
  private currentState: GameState

  constructor(initialState: GameState = 'READY') {
    this.currentState = initialState
  }

  get state(): GameState {
    return this.currentState
  }

  transitionTo(nextState: GameState): void {
    this.currentState = transitionGameState(this.currentState, nextState)
  }
}
