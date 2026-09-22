import { describe, expect, it } from 'vitest'

import { GameStateMachine } from './game-state-machine'

describe('GameStateMachine', () => {
  it('starts in READY by default', () => {
    const machine = new GameStateMachine()

    expect(machine.state).toBe('READY')
  })

  it('allows READY to RUNNING', () => {
    const machine = new GameStateMachine()

    machine.transitionTo('RUNNING')

    expect(machine.state).toBe('RUNNING')
  })

  it('allows RUNNING to GAME_OVER', () => {
    const machine = new GameStateMachine('RUNNING')

    machine.transitionTo('GAME_OVER')

    expect(machine.state).toBe('GAME_OVER')
  })

  it('allows GAME_OVER to READY', () => {
    const machine = new GameStateMachine('GAME_OVER')

    machine.transitionTo('READY')

    expect(machine.state).toBe('READY')
  })

  it('rejects invalid transitions', () => {
    const machine = new GameStateMachine()

    expect(() => machine.transitionTo('GAME_OVER')).toThrow(
      'Invalid game state transition: READY -> GAME_OVER',
    )

    expect(machine.state).toBe('READY')
  })

  it('rejects transitions from future states until their rules are defined', () => {
    const machine = new GameStateMachine('PAUSED')

    expect(() => machine.transitionTo('RUNNING')).toThrow(
      'Invalid game state transition: PAUSED -> RUNNING',
    )

    expect(machine.state).toBe('PAUSED')
  })
})
