import type { GameState } from './game-state'

const validTransitions: Record<GameState, readonly GameState[]> = {
  READY: ['RUNNING'],
  RUNNING: ['GAME_OVER'],
  GAME_OVER: ['READY'],
  PAUSED: [],
  LOADING: [],
  TRANSITIONING: [],
}

export function transitionGameState(
  currentState: GameState,
  nextState: GameState,
): GameState {
  if (!validTransitions[currentState].includes(nextState)) {
    throw new Error(
      `Invalid game state transition: ${currentState} -> ${nextState}`,
    )
  }

  return nextState
}
