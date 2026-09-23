import { defaultGameplayConfig } from '../../domain/config/default-gameplay-config'
import type { Mario } from '../../domain/mario/mario'
import { landMario } from '../../domain/mario/land-mario'
import { startMarioCrouch } from '../../domain/mario/start-mario-crouch'
import { startMarioJump } from '../../domain/mario/start-mario-jump'
import { updateMarioMovement } from '../../domain/mario/update-mario-movement'
import { updateMarioVerticalMovement } from '../../domain/mario/update-mario-vertical-movement'
import { updateMarioVerticalPosition } from '../../domain/mario/update-mario-vertical-position'
import type { GameTime } from '../../domain/time'
import type { FrameScheduler } from '../game-loop/frame-scheduler'
import { GameLoop } from '../game-loop/game-loop'
import type { Render } from '../game-loop/render'
import type { Update } from '../game-loop/update'
import { GameStateMachine } from '../game-state/game-state-machine'
import type { Input } from '../input'
import { Clock } from '../time/clock'

export class GameApplication {
  private readonly stateMachine: GameStateMachine
  private readonly gameLoop: GameLoop
  private readonly input: Input
  private readonly update: Update
  private readonly render: Render
  private mario: Mario

  constructor(
    scheduler: FrameScheduler,
    mario: Mario,
    input: Input,
    update: Update,
    render: Render,
  ) {
    const clock = new Clock()

    this.stateMachine = new GameStateMachine()
    this.mario = mario
    this.input = input
    this.update = update
    this.render = render
    this.gameLoop = new GameLoop(
      clock,
      scheduler,
      this.updateSession,
      this.renderSession,
    )

    this.gameLoop.start()
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
  }

  restart(): void {
    this.stateMachine.transitionTo('READY')
  }

  gameOver(): void {
    this.stateMachine.transitionTo('GAME_OVER')
  }

  private updateSession = (gameTime: GameTime): void => {
    if (this.stateMachine.state === 'READY') {
      if (this.input.isActive('jump')) {
        this.start()
      }

      return
    }

    if (this.stateMachine.state !== 'RUNNING') {
      return
    }

    const wasAirborne = !this.mario.isGrounded

    this.handleGameplayInput()
    this.mario = updateMarioMovement(this.mario, gameTime.deltaTime)
    this.mario = updateMarioVerticalMovement(
      this.mario,
      defaultGameplayConfig.physics.gravity,
      gameTime.deltaTime,
    )
    this.mario = updateMarioVerticalPosition(this.mario, gameTime.deltaTime)

    if (wasAirborne) {
      this.mario = landMario(this.mario, defaultGameplayConfig.physics.groundY)
    }

    this.update(gameTime)
  }

  private handleGameplayInput(): void {
    if (this.input.isActive('jump')) {
      this.mario = startMarioJump(
        this.mario,
        defaultGameplayConfig.physics.jumpForce,
      )
    }

    if (this.input.isActive('crouch')) {
      this.mario = startMarioCrouch(this.mario)
    }
  }

  private renderSession = (gameTime: GameTime): void => {
    this.render(gameTime)
  }
}
