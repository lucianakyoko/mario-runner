import type { Collectible } from '../../domain/collectible/collectible'
import { collectibleTypes } from '../../domain/collectible/collectible-type'
import type { GameState } from '../../domain/game/game-state'
import type { Mario } from '../../domain/mario/mario'
import type { Obstacle } from '../../domain/obstacle/obstacle'
import { OBSTACLE_TYPE } from '../../domain/obstacle/obstacle-type'
import type { PowerUp } from '../../domain/power-up/power-up'
import { POWER_UP_TYPE } from '../../domain/power-up/power-up-type'
import type { Scenario } from '../../domain/scenario/scenario'
import { createGameOverVisual } from '../game-over/game-over-visual'
import type { MarioVisual } from '../mario/mario-visual'
import type { ObstacleVisual } from '../obstacle/obstacle-visual'
import { CanvasSurface } from './canvas-surface'

const DEFAULT_BACKGROUND_COLOR = '#87CEEB'
const DEFAULT_GROUND_HEIGHT = 32
const DEFAULT_GROUND_COLOR = '#8B4513'
const GROUND_SMALL_COLOR = '#228B22'
const GROUND_TALL_COLOR = '#006400'
const AIR_COLOR = '#B22222'
const COIN_COLOR = '#FFD700'
const MEDAL_COLOR = '#C0C0C0'
const MUSHROOM_COLOR = '#FF0000'
const GAME_OVER_TITLE_FONT = 'bold 32px monospace'
const GAME_OVER_INSTRUCTION_FONT = '16px monospace'
const GAME_OVER_TEXT_COLOR = '#000000'

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
    coins: Collectible[] = [],
    powerUps: PowerUp[] = [],
    score = 0,
    level = 1,
  ): void {
    const { element, context } = this.surface

    context.clearRect(0, 0, element.width, element.height)

    this.renderBackground(scenario)
    this.renderGround(scenario)
    this.renderObstacles(obstacles, mario, scenario)
    this.renderCollectibles(coins, mario, scenario)
    this.renderPowerUps(powerUps, mario, scenario)
    this.renderHud(state, score, level)
    this.renderMario(mario, marioVisual, scenario)
    this.renderGameOver(state)
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
        screenGroundY - visual.height - obstacle.position.y + visual.offsetY

      context.fillStyle = this.getObstacleColor(obstacle.type)
      context.fillRect(screenX, screenY, visual.width, visual.height)
    }
  }

  private renderCollectibles(
    collectibles: Collectible[],
    mario: Mario,
    scenario: Scenario,
  ): void {
    const { context } = this.surface

    const cameraX = mario.position.x - this.surface.element.width * 0.25
    const screenGroundY = this.surface.element.height - scenario.ground.y

    for (const collectible of collectibles) {
      const screenX = collectible.position.x - cameraX

      const screenY =
        screenGroundY - collectible.size.height + collectible.position.y

      context.fillStyle = this.getCollectibleColor(collectible)

      context.fillRect(
        screenX,
        screenY,
        collectible.size.width,
        collectible.size.height,
      )
    }
  }

  private renderPowerUps(
    powerUps: PowerUp[],
    mario: Mario,
    scenario: Scenario,
  ): void {
    const { context } = this.surface

    const cameraX = mario.position.x - this.surface.element.width * 0.25
    const screenGroundY = this.surface.element.height - scenario.ground.y

    for (const powerUp of powerUps) {
      const screenX = powerUp.position.x - cameraX

      const screenY = screenGroundY - powerUp.size.height + powerUp.position.y

      context.fillStyle = this.getPowerUpColor(powerUp)

      context.fillRect(
        screenX,
        screenY,
        powerUp.size.width,
        powerUp.size.height,
      )
    }
  }

  private renderHud(state: GameState, score: number, level: number): void {
    const { context } = this.surface

    context.fillStyle = '#000000'
    context.font = '16px monospace'
    context.textAlign = 'left'
    context.textBaseline = 'top'

    context.fillText(`STATE: ${this.getStateLabel(state)}`, 16, 16)
    context.fillText(`SCORE: ${score}`, 16, 36)
    context.fillText(`LEVEL: ${level}`, 16, 56)
  }

  private renderGameOver(state: GameState): void {
    if (state !== 'GAME_OVER') {
      return
    }

    const { element, context } = this.surface
    const visual = createGameOverVisual()
    const centerX = element.width / 2
    const centerY = element.height / 2

    context.fillStyle = GAME_OVER_TEXT_COLOR
    context.textAlign = 'center'
    context.textBaseline = 'middle'

    context.font = GAME_OVER_TITLE_FONT
    context.fillText(visual.title, centerX, centerY - 16)

    context.font = GAME_OVER_INSTRUCTION_FONT
    context.fillText(visual.instruction, centerX, centerY + 24)
  }

  private getCollectibleColor(collectible: Collectible): string {
    switch (collectible.type) {
      case collectibleTypes.COIN:
        return COIN_COLOR

      case collectibleTypes.MEDAL:
        return MEDAL_COLOR
    }
  }

  private getPowerUpColor(powerUp: PowerUp): string {
    switch (powerUp.type) {
      case POWER_UP_TYPE.MUSHROOM:
        return MUSHROOM_COLOR
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

    context.fillStyle = '#000000'
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
