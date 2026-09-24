import { OBSTACLE_TYPE } from '../obstacle/obstacle-type'
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
  spawn: {
    obstacleMinDistance: 320,
    obstacleMaxDistance: 700,
    collectibleChance: 0.25,
    powerUpChance: 0.05,
  },
  obstacles: {
    [OBSTACLE_TYPE.GROUND_SMALL]: {
      width: 32,
      height: 32,
      groundOffset: 0,
      speed: 280,
    },
    [OBSTACLE_TYPE.GROUND_TALL]: {
      width: 32,
      height: 48,
      groundOffset: 0,
      speed: 280,
    },
    [OBSTACLE_TYPE.AIR]: {
      width: 32,
      height: 24,
      groundOffset: 64,
      speed: 280,
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
    horizontalPadding: 0,
    verticalPadding: 0,
  },
  animation: {
    defaultFrameDuration: 100,
  },
}
