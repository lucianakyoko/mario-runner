export interface MovementConfig {
  initialSpeed: number
  maxSpeed: number
}

export interface PhysicsConfig {
  gravity: number
  jumpForce: number
}

export interface SpawnConfig {
  obstacleMinDistance: number
  obstacleMaxDistance: number
  collectibleChance: number
  powerUpChance: number
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
  horizontalPadding: number
  verticalPadding: number
}

export interface AnimationConfig {
  defaultFrameDuration: number
}

export interface GameplayConfig {
  movement: MovementConfig
  physics: PhysicsConfig
  spawn: SpawnConfig
  scoring: ScoringConfig
  progression: ProgressionConfig
  collision: CollisionConfig
  animation: AnimationConfig
}
