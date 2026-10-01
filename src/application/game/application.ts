import type { Collidable } from '../../domain/collision/collidable'
import type { CollisionResult } from '../../domain/collision/collision-result'
import { detectCollision } from '../../domain/collision/detect-collision'
import { defaultGameplayConfig } from '../../domain/config/default-gameplay-config'
import { calculateDifficulty } from '../../domain/difficulty/calculate-difficulty'
import type { Difficulty } from '../../domain/difficulty/difficulty'
import type { Collectible } from '../../domain/collectible/collectible'
import { collectibleTypes } from '../../domain/collectible/collectible-type'
import { collectCollectible } from '../../domain/collectible/collect-collectible'
import { createCollectibleCollidable } from '../../domain/collectible/create-collectible-collidable'
import { updateCollectiblesMovement } from '../../domain/collectible/update-collectibles-movement'
import { calculateLevel } from '../../domain/progression/calculate-level'
import { dieMario } from '../../domain/mario/die-mario'
import {
  createInitialMario,
  type InitialMarioConfig,
  type Mario,
} from '../../domain/mario/mario'
import { getMarioCollisionBounds } from '../../domain/mario/mario'
import { landMario } from '../../domain/mario/land-mario'
import { marioLifeState } from '../../domain/mario/mario-life-state'
import { resolveMarioGroundMovement } from '../../domain/mario/resolve-mario-ground-movement'
import { shouldDieMario } from '../../domain/mario/should-die-mario'
import { updateMarioMovement } from '../../domain/mario/update-mario-movement'
import { updateMarioVerticalMovement } from '../../domain/mario/update-mario-vertical-movement'
import { updateMarioVerticalPosition } from '../../domain/mario/update-mario-vertical-position'
import type { Obstacle } from '../../domain/obstacle/obstacle'
import { getObstacleCollisionBounds } from '../../domain/obstacle/obstacle'
import { removeOffscreenObstacles } from '../../domain/obstacle/remove-offscreen-obstacles'
import { updateObstaclesMovement } from '../../domain/obstacle/update-obstacles-movement'
import type { PowerUp } from '../../domain/power-up/power-up'
import { consumePowerUp } from '../../domain/power-up/consume-power-up'
import { createPowerUpCollidable } from '../../domain/power-up/create-power-up-collidable'
import { updatePowerUpsMovement } from '../../domain/power-up/update-power-ups-movement'
import { growMario } from '../../domain/mario/grow-mario'
import { loseMarioPower } from '../../domain/mario/lose-mario-power'
import { shouldLoseMarioPower } from '../../domain/mario/should-lose-mario-power'
import { addScore } from '../../domain/score/add-score'
import { createScore } from '../../domain/score/create-score'
import { getCollectibleScoreValue } from '../../domain/score/get-collectible-score-value'
import type { Score } from '../../domain/score/score'
import {
  createInitialScenario,
  type InitialScenarioConfig,
  type Scenario,
} from '../../domain/scenario/scenario'
import { updateScenarioMovement } from '../../domain/scenario/update-scenario-movement'
import { spawnCollectible } from '../../domain/spawn/spawn-collectible'
import { spawnMushroom } from '../../domain/spawn/spawn-mushroom'
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
  private readonly initialMarioConfig: InitialMarioConfig
  private readonly initialScenarioConfig: InitialScenarioConfig

  private mario: Mario
  private scenario: Scenario
  private obstacles: Obstacle[]
  private coins: Collectible[]
  private powerUps: PowerUp[]
  private score: Score
  private level = 1
  private spawnState: SpawnState
  private collectibleSpawnState: SpawnState
  private powerUpSpawnState: SpawnState
  private nextObstacleId = 1
  private nextCoinId = 1
  private nextMedalId = 1
  private nextMushroomId = 1

  private collisionResult: CollisionResult = {
    hasCollision: false,
  }

  private collectibleCollisions: Collectible[] = []
  private powerUpCollisions: PowerUp[] = []

  constructor(
    scheduler: FrameScheduler,
    mario: Mario,
    scenario: Scenario,
    input: Input,
    update: Update,
    render: Render,
    obstacles: Obstacle[] = [],
    coins: Collectible[] = [],
    powerUps: PowerUp[] = [],
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
    this.powerUps = powerUps
    this.score = createScore()
    this.level = calculateLevel({
      score: this.score.value,
      pointsPerLevel: defaultGameplayConfig.progression.pointsPerLevel,
    })
    this.random = new SeededRandom(1)

    this.initialMarioConfig = {
      width: mario.size.width,
      height: mario.size.height,
      initialX: mario.position.x,
      groundY: mario.position.y,
      initialSpeed: mario.velocity.x,
      collisionBounds: mario.collisionBounds,
    }

    this.initialScenarioConfig = {
      id: scenario.id,
      backgroundId: scenario.background.id,
      groundY: scenario.ground.y,
    }

    this.initialDifficulty = {
      obstacleSpeed: defaultGameplayConfig.scenario.speed,
      obstacleMinDistance: defaultGameplayConfig.spawn.obstacleMinDistance,
      obstacleMaxDistance: defaultGameplayConfig.spawn.obstacleMaxDistance,
    }

    this.spawnState = {
      distanceSinceLastSpawn: 0,
      nextSpawnDistance: defaultGameplayConfig.spawn.obstacleMinDistance,
    }

    this.collectibleSpawnState = {
      distanceSinceLastSpawn: 0,
      nextSpawnDistance: defaultGameplayConfig.spawn.collectibleMinDistance,
    }

    this.powerUpSpawnState = {
      distanceSinceLastSpawn: 0,
      nextSpawnDistance: defaultGameplayConfig.spawn.powerUpMinDistance,
    }

    this.nextObstacleId = 1
    this.nextCoinId = 1
    this.nextMedalId = 1
    this.nextMushroomId = 1

    this.random.reset()

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

  get currentPowerUps(): PowerUp[] {
    return this.powerUps
  }

  get currentScore(): Score {
    return this.score
  }

  get currentLevel(): number {
    return this.level
  }

  get currentCollision(): CollisionResult {
    return this.collisionResult
  }

  get currentCollectibleCollisions(): Collectible[] {
    return this.collectibleCollisions
  }

  get currentPowerUpCollisions(): PowerUp[] {
    return this.powerUpCollisions
  }

  start(): void {
    if (this.stateMachine.state === 'RUNNING') {
      return
    }

    this.stateMachine.transitionTo('RUNNING')
  }

  restart(): void {
    this.mario = createInitialMario(this.initialMarioConfig)
    this.scenario = createInitialScenario(this.initialScenarioConfig)

    this.collisionResult = { hasCollision: false }
    this.collectibleCollisions = []
    this.powerUpCollisions = []

    this.score = createScore()
    this.level = calculateLevel({
      score: this.score.value,
      pointsPerLevel: defaultGameplayConfig.progression.pointsPerLevel,
    })

    this.spawnState = {
      distanceSinceLastSpawn: 0,
      nextSpawnDistance: defaultGameplayConfig.spawn.obstacleMinDistance,
    }

    this.collectibleSpawnState = {
      distanceSinceLastSpawn: 0,
      nextSpawnDistance: defaultGameplayConfig.spawn.collectibleMinDistance,
    }

    this.powerUpSpawnState = {
      distanceSinceLastSpawn: 0,
      nextSpawnDistance: defaultGameplayConfig.spawn.powerUpMinDistance,
    }

    this.nextObstacleId = 1
    this.nextCoinId = 1
    this.nextMedalId = 1
    this.nextMushroomId = 1

    this.random.reset()

    this.stateMachine.transitionTo('READY')
  }

  gameOver(): void {
    this.collisionResult = { hasCollision: false }
    this.collectibleCollisions = []
    this.powerUpCollisions = []
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

  private detectCollectibleCollisions(mario: Collidable): Collectible[] {
    return this.coins.filter(
      (collectible) =>
        !collectible.isCollected &&
        detectCollision(mario, createCollectibleCollidable(collectible))
          .hasCollision,
    )
  }

  private detectPowerUpCollisions(mario: Collidable): PowerUp[] {
    return this.powerUps.filter(
      (powerUp) =>
        !powerUp.isCollected &&
        detectCollision(mario, createPowerUpCollidable(powerUp)).hasCollision,
    )
  }

  private collectDetectedCollectibles(collectibles: Collectible[]): void {
    const collectedIds = new Set(
      collectibles.map((collectible) => collectible.id),
    )

    for (const collectible of collectibles) {
      const points = getCollectibleScoreValue(
        collectible.type,
        defaultGameplayConfig.scoring,
      )

      this.score = addScore(this.score, points)
      this.level = calculateLevel({
        score: this.score.value,
        pointsPerLevel: defaultGameplayConfig.progression.pointsPerLevel,
      })
    }

    this.coins = this.coins
      .map((collectible) =>
        collectedIds.has(collectible.id)
          ? collectCollectible(collectible)
          : collectible,
      )
      .filter((collectible) => !collectible.isCollected)
  }

  private consumeDetectedPowerUps(powerUps: PowerUp[]): void {
    const consumedIds = new Set(powerUps.map((powerUp) => powerUp.id))

    this.powerUps = this.powerUps
      .map((powerUp) =>
        consumedIds.has(powerUp.id) ? consumePowerUp(powerUp) : powerUp,
      )
      .filter((powerUp) => !powerUp.isCollected)
  }

  private applyPowerUpTransformation(powerUps: PowerUp[]): void {
    if (powerUps.length === 0) {
      return
    }

    this.mario = growMario(this.mario, {
      width: defaultGameplayConfig.mario.powered.width,
      height: defaultGameplayConfig.mario.powered.height,
      collisionBounds: defaultGameplayConfig.mario.powered.collisionBounds,
    })
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

    const traveledDistance =
      defaultGameplayConfig.scenario.speed * gameTime.deltaTime

    this.scenario = updateScenarioMovement(
      this.scenario,
      defaultGameplayConfig.scenario.speed,
      gameTime.deltaTime,
    )

    this.spawnState = updateSpawnDistance(this.spawnState, traveledDistance)

    this.collectibleSpawnState = updateSpawnDistance(
      this.collectibleSpawnState,
      traveledDistance,
    )

    this.powerUpSpawnState = updateSpawnDistance(
      this.powerUpSpawnState,
      traveledDistance,
    )

    const difficulty = calculateDifficulty({
      level: this.level,
      initialDifficulty: this.initialDifficulty,
      config: defaultGameplayConfig.difficulty,
    })

    const spawnX =
      this.mario.position.x + defaultGameplayConfig.viewport.width * 0.75

    const collectibleSpawnResult = spawnCollectible({
      state: this.collectibleSpawnState,
      collectibles: this.coins,
      random: this.random,
      collectibleChance: defaultGameplayConfig.spawn.collectibleChance,
      coinSpawnWeight: defaultGameplayConfig.spawn.coinSpawnWeight,
      medalSpawnWeight: defaultGameplayConfig.spawn.medalSpawnWeight,
      coinConfig: defaultGameplayConfig.coin,
      medalConfig: defaultGameplayConfig.medal,
      spawnX,
      velocityX: -difficulty.obstacleSpeed,
      minSpawnDistance: defaultGameplayConfig.spawn.collectibleMinDistance,
      maxSpawnDistance: defaultGameplayConfig.spawn.collectibleMaxDistance,
      collectibleIds: {
        [collectibleTypes.COIN]: `coin-${this.nextCoinId}`,
        [collectibleTypes.MEDAL]: `medal-${this.nextMedalId}`,
      },
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

    this.collectibleSpawnState = collectibleSpawnResult.state
    this.coins = collectibleSpawnResult.collectibles

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

    const mushroomSpawnResult = spawnMushroom({
      state: this.powerUpSpawnState,
      powerUps: this.powerUps,
      random: this.random,
      powerUpChance: defaultGameplayConfig.spawn.powerUpChance,
      mushroomConfig: defaultGameplayConfig.powerUp,
      spawnX,
      mushroomId: `mushroom-${this.nextMushroomId}`,
      velocityX: -difficulty.obstacleSpeed,
      minSpawnDistance: defaultGameplayConfig.spawn.powerUpMinDistance,
      maxSpawnDistance: defaultGameplayConfig.spawn.powerUpMaxDistance,
    })

    if (mushroomSpawnResult.powerUps.length > this.powerUps.length) {
      this.nextMushroomId += 1
    }

    this.powerUpSpawnState = mushroomSpawnResult.state
    this.powerUps = mushroomSpawnResult.powerUps

    this.coins = updateCollectiblesMovement(this.coins, gameTime.deltaTime)
    this.powerUps = updatePowerUpsMovement(this.powerUps, gameTime.deltaTime)
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

    this.resolveMarioObstacleCollision()

    if (this.mario.lifeState === marioLifeState.DEAD) {
      this.gameOver()
      return
    }

    this.collectibleCollisions = this.detectCollectibleCollisions(mario)
    this.collectDetectedCollectibles(this.collectibleCollisions)

    this.powerUpCollisions = this.detectPowerUpCollisions(mario)
    this.consumeDetectedPowerUps(this.powerUpCollisions)
    this.applyPowerUpTransformation(this.powerUpCollisions)

    this.update(gameTime)
  }

  private renderSession = (gameTime: GameTime): void => {
    this.render(gameTime)
  }

  private resolveMarioObstacleCollision(): void {
    if (shouldLoseMarioPower(this.mario, this.collisionResult.hasCollision)) {
      this.mario = loseMarioPower(this.mario, {
        width: defaultGameplayConfig.mario.normal.width,
        height: defaultGameplayConfig.mario.normal.height,
        collisionBounds: defaultGameplayConfig.mario.normal.collisionBounds,
      })

      return
    }

    if (shouldDieMario(this.mario, this.collisionResult.hasCollision)) {
      this.mario = dieMario(this.mario)
    }
  }
}
