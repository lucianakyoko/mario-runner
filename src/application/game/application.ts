import type { Mario } from '../../domain/mario/mario'
import { updateMarioMovement } from '../../domain/mario/update-mario-movement'
import type { GameTime } from '../../domain/time'
import type { FrameScheduler } from '../game-loop/frame-scheduler'
import { GameLoop } from '../game-loop/game-loop'
import type { Render } from '../game-loop/render'
import type { Update } from '../game-loop/update'
import { GameStateMachine } from '../game-state/game-state-machine'
import { Clock } from '../time/clock'

export class GameApplication {
  private readonly stateMachine: GameStateMachine
  private readonly gameLoop: GameLoop
  private readonly update: Update
  private readonly render: Render
  private mario: Mario

  constructor(
    scheduler: FrameScheduler,
    mario: Mario,
    update: Update,
    render: Render,
  ) {
    const clock = new Clock()

    this.stateMachine = new GameStateMachine()
    this.mario = mario
    this.update = update
    this.render = render
    this.gameLoop = new GameLoop(
      clock,
      scheduler,
      this.updateSession,
      this.renderSession,
    )
  }

  get state() {
    return this.stateMachine.state
  }

  get currentMario(): Mario {
    return this.mario
  }

  start(): void {
    if (this.stateMachine.state === 'RUNNING') {
      return
    }

    this.stateMachine.transitionTo('RUNNING')
    this.gameLoop.start()
  }

  restart(): void {
    this.stateMachine.transitionTo('READY')
  }

  gameOver(): void {
    this.stateMachine.transitionTo('GAME_OVER')
  }

  private updateSession = (gameTime: GameTime): void => {
    if (this.stateMachine.state !== 'RUNNING') {
      return
    }

    this.mario = updateMarioMovement(this.mario, gameTime.deltaTime)
    this.update(gameTime)
  }

  private renderSession = (gameTime: GameTime): void => {
    this.render(gameTime)
  }
}
