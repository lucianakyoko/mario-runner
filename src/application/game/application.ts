import { defaultGameplayConfig } from '../../domain/config/default-gameplay-config'
import { calculateDifficulty } from '../../domain/difficulty/calculate-difficulty'
import type { Difficulty } from '../../domain/difficulty/difficulty'
import { landMario } from '../../domain/mario/land-mario'
import type { Mario } from '../../domain/mario/mario'
import { resolveMarioGroundMovement } from '../../domain/mario/resolve-mario-ground-movement'
import { updateMarioMovement } from '../../domain/mario/update-mario-movement'
import { updateMarioVerticalMovement } from '../../domain/mario/update-mario-vertical-movement'
import { updateMarioVerticalPosition } from '../../domain/mario/update-mario-vertical-position'
import type { Obstacle } from '../../domain/obstacle/obstacle'
import { removeOffscreenObstacles } from '../../domain/obstacle/remove-offscreen-obstacles'
import { updateObstaclesMovement } from '../../domain/obstacle/update-obstacles-movement'
import { spawnObstacle } from '../../domain/spawn/spawn-obstacle'
import type { SpawnState } from '../../domain/spawn/spawn-state'
import { updateSpawnDistance } from '../../domain/spawn/update-spawn-distance'
import type { Scenario } from '../../domain/scenario/scenario'
import { updateScenarioMovement } from '../../domain/scenario/update-scenario-movement'
import type { GameTime } from '../../domain/time'
import { SeededRandom } from '../../infrastructure/random/seeded-random'
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
  private readonly random: SeededRandom
  private readonly initialDifficulty: Difficulty

  private mario: Mario
  private scenario: Scenario
  private obstacles: Obstacle[]
  private spawnState: SpawnState
  private nextObstacleId = 1

  constructor(
    scheduler: FrameScheduler,
    mario: Mario,
    scenario: Scenario,
    input: Input,
    update: Update,
    render: Render,
    obstacles: Obstacle[] = [],
  ) {
    const clock = new Clock()

    this.stateMachine = new GameStateMachine()
    this.mario = mario
    this.scenario = scenario
    this.input = input
    this.update = update
    this.render = render
    this.obstacles = obstacles
    this.random = new SeededRandom(1)

    this.initialDifficulty = {
      obstacleSpeed: defaultGameplayConfig.scenario.speed,
      obstacleMinDistance: defaultGameplayConfig.spawn.obstacleMinDistance,
      obstacleMaxDistance: defaultGameplayConfig.spawn.obstacleMaxDistance,
    }

    this.spawnState = {
      distanceSinceLastSpawn: 0,
      nextSpawnDistance: defaultGameplayConfig.spawn.obstacleMinDistance,
    }

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

  get currentScenario(): Scenario {
    return this.scenario
  }

  get currentObstacles(): Obstacle[] {
    return this.obstacles
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

    this.scenario = updateScenarioMovement(
      this.scenario,
      defaultGameplayConfig.scenario.speed,
      gameTime.deltaTime,
    )

    this.spawnState = updateSpawnDistance(
      this.spawnState,
      defaultGameplayConfig.scenario.speed * gameTime.deltaTime,
    )

    const difficulty = calculateDifficulty({
      elapsedTime: gameTime.elapsedTime,
      initialDifficulty: this.initialDifficulty,
      config: defaultGameplayConfig.difficulty,
    })

    const spawnX =
      this.mario.position.x + defaultGameplayConfig.viewport.width * 0.75

    const spawnResult = spawnObstacle({
      state: this.spawnState,
      obstacles: this.obstacles,
      random: this.random,
      difficulty,
      obstacleConfigs: defaultGameplayConfig.obstacles,
      spawnX,
      obstacleId: `obstacle-${this.nextObstacleId}`,
    })

    if (spawnResult.obstacles.length > this.obstacles.length) {
      this.nextObstacleId += 1
    }

    this.spawnState = spawnResult.state
    this.obstacles = spawnResult.obstacles

    this.obstacles = updateObstaclesMovement(this.obstacles, gameTime.deltaTime)
    this.obstacles = removeOffscreenObstacles(this.obstacles)

    this.mario = resolveMarioGroundMovement(
      this.mario,
      {
        jump: this.input.isActive('jump'),
        crouch: this.input.isActive('crouch'),
      },
      {
        jumpForce: defaultGameplayConfig.physics.jumpForce,
      },
    )

    this.mario = updateMarioMovement(this.mario, gameTime.deltaTime)

    if (!this.mario.isGrounded) {
      this.mario = updateMarioVerticalMovement(
        this.mario,
        defaultGameplayConfig.physics.gravity,
        gameTime.deltaTime,
      )

      if (this.mario.velocity.y >= 0) {
        this.mario = {
          ...this.mario,
          movementState: 'FALLING',
        }
      }

      this.mario = updateMarioVerticalPosition(this.mario, gameTime.deltaTime)

      this.mario = landMario(this.mario, defaultGameplayConfig.physics.groundY)
    }

    this.update(gameTime)
  }

  private renderSession = (gameTime: GameTime): void => {
    this.render(gameTime)
  }
}
