import type { GameplayConfig } from './gameplay-config'

export const defaultGameplayConfig: GameplayConfig = {
  movement: {
    initialSpeed: 280,
    maxSpeed: 520,
  },
  physics: {
    gravity: 1800,
    jumpForce: 680,
  },
  spawn: {
    obstacleMinDistance: 320,
    obstacleMaxDistance: 700,
    collectibleChance: 0.25,
    powerUpChance: 0.05,
  },
  scoring: {
    coinPoints: 1,
    medalPoints: 2,
  },
  progression: {
    pointsPerLevel: 20,
    speedIncreasePerLevel: 20,
  },
  collision: {
    horizontalPadding: 0,
    verticalPadding: 0,
  },
  animation: {
    defaultFrameDuration: 100,
  },
}
