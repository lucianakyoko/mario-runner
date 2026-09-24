import type { ObstacleType } from '../obstacle/obstacle-type'

export interface MovementConfig {
  initialSpeed: number
  maxSpeed: number
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

export interface SpawnConfig {
  obstacleMinDistance: number
  obstacleMaxDistance: number
  collectibleChance: number
  powerUpChance: number
}

export interface ObstacleConfig {
  width: number
  height: number
  groundOffset: number
}

export type ObstacleConfigs = Record<ObstacleType, ObstacleConfig>

export interface ScoringConfig {
  coinPoints: number
  medalPoints: number
}

export interface ProgressionConfig {
  pointsPerLevel: number
  speedIncreasePerLevel: number
}

export interface CollisionConfig {
  horizontalPadding: number
  verticalPadding: number
}

export interface AnimationConfig {
  defaultFrameDuration: number
}

export interface GameplayConfig {
  movement: MovementConfig
  physics: PhysicsConfig
  scenario: ScenarioConfig
  spawn: SpawnConfig
  obstacles: ObstacleConfigs
  scoring: ScoringConfig
  progression: ProgressionConfig
  collision: CollisionConfig
  animation: AnimationConfig
}
