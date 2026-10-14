import { OBSTACLE_TYPE } from '../obstacle/obstacle-type'
import { OBSTACLE_VARIANT } from '../obstacle/obstacle-variant'
import type { GameplayConfig } from './gameplay-config'

export const defaultGameplayConfig: GameplayConfig = {
  movement: {
    initialSpeed: 280,
    maxSpeed: 520,
  },
  physics: {
    gravity: 1800,
    jumpForce: 680,
    groundY: 0,
  },
  scenario: {
    speed: 280,
    background: {
      id: 'default',
    },
  },
  viewport: {
    width: 800,
  },
  spawn: {
    obstacleMinDistance: 320,
    obstacleMaxDistance: 700,
    collectibleMinDistance: 220,
    collectibleMaxDistance: 480,
    collectibleChance: 0.45,
    coinSpawnWeight: 0.8,
    medalSpawnWeight: 0.2,
    powerUpChance: 0.05,
    powerUpMinDistance: 320,
    powerUpMaxDistance: 700,
    powerUpObstacleClearance: 64,
    collectibleChanceIncreasePerLevel: 0.05,
    collectibleChanceMax: 0.75,
    collectibleMinDistanceDecreasePerLevel: 20,
    collectibleMaxDistanceDecreasePerLevel: 40,
    collectibleMinDistanceFloor: 160,
    collectibleMaxDistanceFloor: 260,
    cannonFireDelay: 0.25,
  },
  difficulty: {
    progressionInterval: 10,
    obstacleSpeedIncrease: 10,
    obstacleMinDistanceDecrease: 10,
    obstacleMaxDistanceDecrease: 20,
  },
  obstacles: {
    [OBSTACLE_TYPE.GROUND_SMALL]: {
      width: 32,
      height: 32,
      groundOffset: 0,
      speed: 280,
      collisionBounds: {
        offsetX: 2,
        offsetY: 2,
        width: 28,
        height: 30,
      },
    },
    [OBSTACLE_TYPE.GROUND_TALL]: {
      width: 32,
      height: 48,
      groundOffset: 0,
      speed: 280,
      collisionBounds: {
        offsetX: 2,
        offsetY: 2,
        width: 28,
        height: 46,
      },
    },
    [OBSTACLE_TYPE.AIR]: {
      width: 32,
      height: 24,
      groundOffset: 64,
      speed: 280,
      collisionBounds: {
        offsetX: 2,
        offsetY: 2,
        width: 28,
        height: 20,
      },
    },
  },
  coin: {
    width: 24,
    height: 24,
    groundOffset: 48,
    speed: 280,
    collisionBounds: {
      offsetX: 2,
      offsetY: 2,
      width: 20,
      height: 20,
    },
  },
  medal: {
    width: 32,
    height: 32,
    groundOffset: 64,
    speed: 280,
    collisionBounds: {
      offsetX: 4,
      offsetY: 3,
      width: 24,
      height: 26,
    },
  },
  powerUp: {
    width: 32,
    height: 32,
    groundOffset: 0,
    speed: 150,
    collisionBounds: {
      offsetX: 2,
      offsetY: 2,
      width: 28,
      height: 28,
    },
  },
  mario: {
    normal: {
      width: 32,
      height: 48,
      collisionBounds: {
        offsetX: 2,
        offsetY: 2,
        width: 28,
        height: 44,
      },
      crouchingCollisionBounds: {
        offsetX: 2,
        offsetY: 24,
        width: 28,
        height: 20,
      },
    },
    powered: {
      width: 32,
      height: 64,
      collisionBounds: {
        offsetX: 2,
        offsetY: 2,
        width: 28,
        height: 60,
      },
      crouchingCollisionBounds: {
        offsetX: 2,
        offsetY: 24,
        width: 28,
        height: 20,
      },
    },
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
    mario: {
      offsetX: 2,
      offsetY: 2,
      width: 28,
      height: 44,
    },
  },
  animation: {
    defaultFrameDuration: 100,
    collectibleFrameDuration: 250,
    obstacleFrameDurations: {
      [OBSTACLE_VARIANT.PTOOIE]: 250,
    },
  },
}
