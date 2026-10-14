import type { ObstacleType } from '../obstacle/obstacle-type'
import type { ObstacleVariant } from '../obstacle/obstacle-variant'

export interface MovementConfig {
  initialSpeed: number
  maxSpeed: number
}

export interface AnimationConfig {
  defaultFrameDuration: number
  collectibleFrameDuration: number
  obstacleFrameDurations: Partial<Record<ObstacleVariant, number>>
}

export interface PhysicsConfig {
  gravity: number
  jumpForce: number
  groundY: number
}

export interface ScenarioConfig {
  speed: number
  background: {
    id: string
  }
}

export interface ViewportConfig {
  width: number
}

export interface SpawnConfig {
  obstacleMinDistance: number
  obstacleMaxDistance: number
  collectibleMinDistance: number
  collectibleMaxDistance: number
  collectibleChance: number
  coinSpawnWeight: number
  medalSpawnWeight: number
  powerUpChance: number
  powerUpMinDistance: number
  powerUpMaxDistance: number
  powerUpObstacleClearance: number
  collectibleChanceIncreasePerLevel: number
  collectibleChanceMax: number
  collectibleMinDistanceDecreasePerLevel: number
  collectibleMaxDistanceDecreasePerLevel: number
  collectibleMinDistanceFloor: number
  collectibleMaxDistanceFloor: number
  cannonFireDelay: number
}

export interface DifficultyConfig {
  progressionInterval: number
  obstacleSpeedIncrease: number
  obstacleMinDistanceDecrease: number
  obstacleMaxDistanceDecrease: number
}

export interface CollisionBoundsConfig {
  offsetX: number
  offsetY: number
  width: number
  height: number
}

export interface ObstacleConfig {
  width: number
  height: number
  groundOffset: number
  speed: number
  collisionBounds: CollisionBoundsConfig
}

export type ObstacleConfigs = Record<ObstacleType, ObstacleConfig>

export interface CollectibleConfig {
  width: number
  height: number
  groundOffset: number
  speed: number
  collisionBounds: CollisionBoundsConfig
}

export interface PowerUpConfig {
  width: number
  height: number
  groundOffset: number
  speed: number
  collisionBounds: CollisionBoundsConfig
}

export interface MarioStateConfig {
  width: number
  height: number
  collisionBounds: CollisionBoundsConfig
  crouchingCollisionBounds: CollisionBoundsConfig
}

export interface MarioConfig {
  normal: MarioStateConfig
  powered: MarioStateConfig
}

export interface ScoringConfig {
  coinPoints: number
  medalPoints: number
}

export interface ProgressionConfig {
  pointsPerLevel: number
  speedIncreasePerLevel: number
}

export interface CollisionConfig {
  mario: CollisionBoundsConfig
}

export interface GameplayConfig {
  movement: MovementConfig
  physics: PhysicsConfig
  scenario: ScenarioConfig
  viewport: ViewportConfig
  spawn: SpawnConfig
  difficulty: DifficultyConfig
  obstacles: ObstacleConfigs
  coin: CollectibleConfig
  medal: CollectibleConfig
  powerUp: PowerUpConfig
  mario: MarioConfig
  scoring: ScoringConfig
  progression: ProgressionConfig
  collision: CollisionConfig
  animation: AnimationConfig
}
