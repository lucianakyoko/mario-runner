import type { GameState } from '../../domain/game/game-state'
import type { Mario } from '../../domain/mario/mario'
import type { Obstacle } from '../../domain/obstacle/obstacle'
import { OBSTACLE_TYPE } from '../../domain/obstacle/obstacle-type'
import type { Scenario } from '../../domain/scenario/scenario'
import type { MarioVisual } from '../mario/mario-visual'
import type { ObstacleVisual } from '../obstacle/obstacle-visual'
import { CanvasSurface } from './canvas-surface'

const DEFAULT_BACKGROUND_COLOR = '#87CEEB'
const DEFAULT_GROUND_HEIGHT = 32
const DEFAULT_GROUND_COLOR = '#8B4513'
const GROUND_SMALL_COLOR = '#228B22'
const GROUND_TALL_COLOR = '#006400'
const AIR_COLOR = '#B22222'

export class GameRenderer {
  private readonly surface: CanvasSurface

  constructor(surface: CanvasSurface) {
    this.surface = surface
  }

  render(
    state: GameState,
    scenario: Scenario,
    mario: Mario,
    marioVisual: MarioVisual,
    obstacles: Obstacle[] = [],
  ): void {
    const { element, context } = this.surface

    context.clearRect(0, 0, element.width, element.height)

    this.renderBackground(scenario)
    this.renderGround(scenario)
    this.renderObstacles(obstacles, mario, scenario)

    context.fillText(this.getStateLabel(state), 16, 24)

    this.renderMario(mario, marioVisual, scenario)
  }

  private renderBackground(scenario: Scenario): void {
    const { element, context } = this.surface

    context.fillStyle = this.getBackgroundColor(scenario.background.id)
    context.fillRect(0, 0, element.width, element.height)
  }

  private renderGround(scenario: Scenario): void {
    const { element, context } = this.surface

    const groundY = element.height - scenario.ground.y

    context.fillStyle = DEFAULT_GROUND_COLOR
    context.fillRect(0, groundY, element.width, DEFAULT_GROUND_HEIGHT)
  }

  private renderObstacles(
    obstacles: Obstacle[],
    mario: Mario,
    scenario: Scenario,
  ): void {
    const { element, context } = this.surface

    const cameraX = mario.position.x - element.width * 0.25
    const screenGroundY = element.height - scenario.ground.y

    for (const obstacle of obstacles) {
      const visual = this.getObstacleVisual(obstacle)
      const screenX = obstacle.position.x - cameraX + visual.offsetX
      const screenY =
        screenGroundY - visual.height + obstacle.position.y + visual.offsetY

      context.fillStyle = this.getObstacleColor(obstacle.type)
      context.fillRect(screenX, screenY, visual.width, visual.height)
    }
  }

  private getObstacleVisual(obstacle: Obstacle): ObstacleVisual {
    switch (obstacle.type) {
      case OBSTACLE_TYPE.GROUND_SMALL:
        return {
          type: obstacle.type,
          width: 32,
          height: 32,
          offsetX: 0,
          offsetY: 0,
        }

      case OBSTACLE_TYPE.GROUND_TALL:
        return {
          type: obstacle.type,
          width: 32,
          height: 48,
          offsetX: 0,
          offsetY: 0,
        }

      case OBSTACLE_TYPE.AIR:
        return {
          type: obstacle.type,
          width: 32,
          height: 24,
          offsetX: 0,
          offsetY: 0,
        }
    }
  }

  private getObstacleColor(type: Obstacle['type']): string {
    switch (type) {
      case OBSTACLE_TYPE.GROUND_SMALL:
        return GROUND_SMALL_COLOR

      case OBSTACLE_TYPE.GROUND_TALL:
        return GROUND_TALL_COLOR

      case OBSTACLE_TYPE.AIR:
        return AIR_COLOR
    }
  }

  private getBackgroundColor(backgroundId: string): string {
    switch (backgroundId) {
      case 'default':
        return DEFAULT_BACKGROUND_COLOR

      default:
        return DEFAULT_BACKGROUND_COLOR
    }
  }

  private renderMario(
    mario: Mario,
    visual: MarioVisual,
    scenario: Scenario,
  ): void {
    const { element, context } = this.surface

    const cameraX = mario.position.x - element.width * 0.25
    const screenX = mario.position.x - cameraX + visual.offsetX

    const screenGroundY = element.height - scenario.ground.y

    const screenY =
      screenGroundY - visual.height + mario.position.y + visual.offsetY

    context.fillRect(screenX, screenY, visual.width, visual.height)
  }

  private getStateLabel(state: GameState): string {
    switch (state) {
      case 'READY':
        return 'READY'

      case 'RUNNING':
        return 'RUNNING'

      case 'GAME_OVER':
        return 'GAME OVER'

      case 'PAUSED':
        return 'PAUSED'

      case 'LOADING':
        return 'LOADING'

      case 'TRANSITIONING':
        return 'TRANSITIONING'
    }
  }
}
