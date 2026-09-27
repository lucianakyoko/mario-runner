import type { Collidable } from '../../domain/collision/collidable'
import { detectCollision } from '../../domain/collision/detect-collision'
import type { CollisionResult } from '../../domain/collision/collision-result'
import { defaultGameplayConfig } from '../../domain/config/default-gameplay-config'
import { calculateDifficulty } from '../../domain/difficulty/calculate-difficulty'
import type { Difficulty } from '../../domain/difficulty/difficulty'
import type { Collectible } from '../../domain/collectible/collectible'
import { collectibleTypes } from '../../domain/collectible/collectible-type'
import { landMario } from '../../domain/mario/land-mario'
import { getMarioCollisionBounds, type Mario } from '../../domain/mario/mario'
import type { Obstacle } from '../../domain/obstacle/obstacle'
import { getObstacleCollisionBounds } from '../../domain/obstacle/obstacle'
import { removeOffscreenObstacles } from '../../domain/obstacle/remove-offscreen-obstacles'
import { updateObstaclesMovement } from '../../domain/obstacle/update-obstacles-movement'
import { resolveMarioGroundMovement } from '../../domain/mario/resolve-mario-ground-movement'
import { updateMarioMovement } from '../../domain/mario/update-mario-movement'
import { updateMarioVerticalMovement } from '../../domain/mario/update-mario-vertical-movement'
import { updateMarioVerticalPosition } from '../../domain/mario/update-mario-vertical-position'
import type { Scenario } from '../../domain/scenario/scenario'
import { updateScenarioMovement } from '../../domain/scenario/update-scenario-movement'
import { spawnCollectible } from '../../domain/spawn/spawn-collectible'
import { spawnObstacle } from '../../domain/spawn/spawn-obstacle'
import type { SpawnState } from '../../domain/spawn/spawn-state'
import { updateSpawnDistance } from '../../domain/spawn/update-spawn-distance'
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
  private coins: Collectible[]
  private spawnState: SpawnState
  private nextObstacleId = 1
  private nextCoinId = 1
  private nextMedalId = 1

  private collisionResult: CollisionResult = {
    hasCollision: false,
  }

  constructor(
    scheduler: FrameScheduler,
    mario: Mario,
    scenario: Scenario,
    input: Input,
    update: Update,
    render: Render,
    obstacles: Obstacle[] = [],
    coins: Collectible[] = [],
  ) {
    const clock = new Clock()

    this.stateMachine = new GameStateMachine()
    this.mario = mario
    this.scenario = scenario
    this.input = input
    this.update = update
    this.render = render
    this.obstacles = obstacles
    this.coins = coins
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

  get currentCoins(): Collectible[] {
    return this.coins
  }

  get currentCollision(): CollisionResult {
    return this.collisionResult
  }

  start(): void {
    if (this.stateMachine.state === 'RUNNING') {
      return
    }

    this.stateMachine.transitionTo('RUNNING')
  }

  restart(): void {
    this.collisionResult = { hasCollision: false }
    this.stateMachine.transitionTo('READY')
  }

  gameOver(): void {
    this.collisionResult = { hasCollision: false }
    this.stateMachine.transitionTo('GAME_OVER')
  }

  private createMarioCollidable(): Collidable {
    return {
      getCollisionBounds: () => getMarioCollisionBounds(this.mario),
    }
  }

  private createObstacleCollidable(obstacle: Obstacle): Collidable {
    return {
      getCollisionBounds: () => getObstacleCollisionBounds(obstacle),
    }
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

    const collectibleSpawnResult = spawnCollectible({
      state: this.spawnState,
      collectibles: this.coins,
      random: this.random,
      collectibleChance: defaultGameplayConfig.spawn.collectibleChance,
      coinSpawnWeight: defaultGameplayConfig.spawn.coinSpawnWeight,
      medalSpawnWeight: defaultGameplayConfig.spawn.medalSpawnWeight,
      coinConfig: defaultGameplayConfig.coin,
      medalConfig: defaultGameplayConfig.medal,
      spawnX,
      collectibleIds: {
        [collectibleTypes.COIN]: `coin-${this.nextCoinId}`,
        [collectibleTypes.MEDAL]: `medal-${this.nextMedalId}`,
      },
      velocityX: -difficulty.obstacleSpeed,
    })

    if (collectibleSpawnResult.collectibles.length > this.coins.length) {
      const spawnedCollectible =
        collectibleSpawnResult.collectibles[
          collectibleSpawnResult.collectibles.length - 1
        ]

      if (spawnedCollectible.type === collectibleTypes.COIN) {
        this.nextCoinId += 1
      } else {
        this.nextMedalId += 1
      }
    }

    this.coins = collectibleSpawnResult.collectibles

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

    const mario = this.createMarioCollidable()

    const hasCollision = this.obstacles.some(
      (obstacle) =>
        detectCollision(mario, this.createObstacleCollidable(obstacle))
          .hasCollision,
    )

    this.collisionResult = {
      hasCollision,
    }

    this.update(gameTime)
  }

  private renderSession = (gameTime: GameTime): void => {
    this.render(gameTime)
  }
}
