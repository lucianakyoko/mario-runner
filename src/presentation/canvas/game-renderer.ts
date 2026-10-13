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
import {
  createMarioSpriteCatalog,
  getMarioSpriteFrame,
  isSpriteLoaded,
  type MarioSpriteCatalog,
} from '../mario/mario-sprite-catalog'
import {
  createCollectibleSpriteCatalog,
  isCollectibleSpriteLoaded,
  type CollectibleSpriteCatalog,
} from '../collectible/collectible-sprite-catalog'
import {
  createEnvironmentDecorationCatalog,
  isEnvironmentDecorationLoaded,
  type EnvironmentDecorationCatalog,
  type EnvironmentDecorationFrame,
} from '../environment/environment-decoration-catalog'
import { defaultGameplayConfig } from '../../domain/config/default-gameplay-config'
import { CanvasSurface } from './canvas-surface'

const DEFAULT_BACKGROUND_COLOR = '#87CEEB'
const DEFAULT_GROUND_HEIGHT = 16
const GROUND_TILE_SIZE = 16
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
const GROUND_SPRITE_PATH = '/sprites/environments/ground-1-middle.png'

const CLOUD_SPACING = 300
const CLOUD_PARALLAX_FACTOR = 0.35
const CLOUD_INITIAL_OFFSET = 80
const CLOUD_HEIGHTS = [36, 72, 48, 88] as const

const BUSH_SPACING = 360
const BUSH_INITIAL_OFFSET = 110
const BUSH_SCALE = 1.25

const positiveModulo = (value: number, divisor: number): number =>
  ((value % divisor) + divisor) % divisor

export class GameRenderer {
  private readonly surface: CanvasSurface
  private marioSprites: MarioSpriteCatalog | undefined
  private collectibleSprites: CollectibleSpriteCatalog | undefined
  private environmentDecorations: EnvironmentDecorationCatalog | undefined
  private groundSprite: HTMLImageElement | undefined

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
    animationTime = 0,
  ): void {
    const { element, context } = this.surface

    context.clearRect(0, 0, element.width, element.height)

    this.renderBackground(scenario)
    this.renderClouds(scenario)
    this.renderGround(scenario)
    this.renderBushes(scenario)
    this.renderObstacles(obstacles, mario, scenario)
    this.renderCollectibles(coins, mario, scenario, animationTime)
    this.renderPowerUps(powerUps, mario, scenario)
    this.renderHud(state, score, level)
    this.renderMario(state, mario, marioVisual, scenario)
    this.renderGameOver(state)
  }

  private renderBackground(scenario: Scenario): void {
    const { element, context } = this.surface

    context.fillStyle = this.getBackgroundColor(scenario.background.id)
    context.fillRect(0, 0, element.width, element.height)
  }

  private renderClouds(scenario: Scenario): void {
    const { element } = this.surface

    const catalog = this.getEnvironmentDecorations()
    const cloud = catalog?.cloud

    if (!cloud || !isEnvironmentDecorationLoaded(cloud.image)) {
      return
    }

    const scrollPosition =
      scenario.position.x * CLOUD_PARALLAX_FACTOR + CLOUD_INITIAL_OFFSET
    const offset = positiveModulo(scrollPosition, CLOUD_SPACING)
    const firstCloudX = -offset
    const firstCloudIndex = Math.floor(scrollPosition / CLOUD_SPACING)

    for (
      let x = firstCloudX, index = firstCloudIndex;
      x < element.width;
      x += CLOUD_SPACING, index += 1
    ) {
      const frameIndex = positiveModulo(index, cloud.frames.length)
      const frame = cloud.frames[frameIndex]!
      const heightIndex = positiveModulo(index, CLOUD_HEIGHTS.length)
      const y = CLOUD_HEIGHTS[heightIndex]!

      this.drawDecorationFrame(cloud.image, frame, x, y)
    }
  }

  private renderGround(scenario: Scenario): void {
    const { element, context } = this.surface
    const groundY = element.height - scenario.ground.y - DEFAULT_GROUND_HEIGHT
    const sprite = this.getGroundSprite()

    if (!sprite || !isSpriteLoaded(sprite)) {
      context.fillStyle = DEFAULT_GROUND_COLOR
      context.fillRect(0, groundY, element.width, DEFAULT_GROUND_HEIGHT)
      return
    }

    const offset = positiveModulo(scenario.position.x, GROUND_TILE_SIZE)
    const firstTileX = -offset

    for (let x = firstTileX; x < element.width; x += GROUND_TILE_SIZE) {
      for (let row = 0; row < DEFAULT_GROUND_HEIGHT; row += GROUND_TILE_SIZE) {
        context.drawImage(
          sprite,
          0,
          0,
          GROUND_TILE_SIZE,
          GROUND_TILE_SIZE,
          x,
          groundY + row,
          GROUND_TILE_SIZE,
          GROUND_TILE_SIZE,
        )
      }
    }
  }

  private renderBushes(scenario: Scenario): void {
    const { element } = this.surface
    const catalog = this.getEnvironmentDecorations()
    const bush = catalog?.bush

    if (!bush || !isEnvironmentDecorationLoaded(bush.image)) {
      return
    }

    const scrollPosition = scenario.position.x + BUSH_INITIAL_OFFSET
    const offset = positiveModulo(scrollPosition, BUSH_SPACING)
    const firstBushX = -offset
    const firstBushIndex = Math.floor(scrollPosition / BUSH_SPACING)
    const groundTop = element.height - scenario.ground.y - DEFAULT_GROUND_HEIGHT

    for (
      let x = firstBushX, index = firstBushIndex;
      x < element.width;
      index += 1
    ) {
      const frameIndex = positiveModulo(index, bush.frames.length)
      const frame = bush.frames[frameIndex]!
      const scaledHeight = frame.height * BUSH_SCALE

      this.drawDecorationFrame(
        bush.image,
        frame,
        x,
        groundTop - scaledHeight,
        BUSH_SCALE,
      )

      x += BUSH_SPACING
    }
  }

  private drawDecorationFrame(
    image: HTMLImageElement,
    frame: EnvironmentDecorationFrame,
    x: number,
    y: number,
    scale = 1,
  ): void {
    this.surface.context.drawImage(
      image,
      frame.sourceX,
      frame.sourceY,
      frame.width,
      frame.height,
      Math.round(x),
      Math.round(y),
      Math.round(frame.width * scale),
      Math.round(frame.height * scale),
    )
  }

  private getEnvironmentDecorations():
    EnvironmentDecorationCatalog | undefined {
    if (typeof Image === 'undefined') {
      return undefined
    }

    if (!this.environmentDecorations) {
      this.environmentDecorations = createEnvironmentDecorationCatalog()
    }

    return this.environmentDecorations
  }

  private getGroundSprite(): HTMLImageElement | undefined {
    if (typeof Image === 'undefined') {
      return undefined
    }

    if (!this.groundSprite) {
      this.groundSprite = new Image()
      this.groundSprite.src = GROUND_SPRITE_PATH
    }

    return this.groundSprite
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

      const isGroundObstacle =
        obstacle.type === OBSTACLE_TYPE.GROUND_SMALL ||
        obstacle.type === OBSTACLE_TYPE.GROUND_TALL

      const obstacleGroundY = isGroundObstacle
        ? screenGroundY - DEFAULT_GROUND_HEIGHT
        : screenGroundY

      const screenY =
        obstacleGroundY - visual.height + obstacle.position.y + visual.offsetY

      context.fillStyle = this.getObstacleColor(obstacle.type)
      context.fillRect(screenX, screenY, visual.width, visual.height)
    }
  }

  private renderCollectibles(
    collectibles: Collectible[],
    mario: Mario,
    scenario: Scenario,
    animationTime: number,
  ): void {
    const { context } = this.surface

    const cameraX = mario.position.x - this.surface.element.width * 0.25
    const screenGroundY = this.surface.element.height - scenario.ground.y
    const sprites = this.getCollectibleSprites()

    const frameDuration =
      defaultGameplayConfig.animation.collectibleFrameDuration / 1000

    for (const collectible of collectibles) {
      const screenX = collectible.position.x - cameraX
      const screenY =
        screenGroundY - collectible.size.height + collectible.position.y

      const animatedSprite = sprites?.[collectible.type]
      const sprite = animatedSprite?.image

      if (sprite && isCollectibleSpriteLoaded(sprite)) {
        const frameIndex =
          Math.floor(animationTime / frameDuration) %
          animatedSprite.frames.length
        const frame = animatedSprite.frames[frameIndex]!

        context.drawImage(
          sprite,
          frame.x,
          frame.y,
          frame.width,
          frame.height,
          screenX,
          screenY,
          collectible.size.width,
          collectible.size.height,
        )
        continue
      }

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
    const sprites = this.getCollectibleSprites()

    for (const powerUp of powerUps) {
      const screenX = Math.round(powerUp.position.x - cameraX)
      const screenY = Math.round(
        screenGroundY -
          DEFAULT_GROUND_HEIGHT -
          powerUp.size.height +
          powerUp.position.y,
      )
      const sprite =
        powerUp.type === POWER_UP_TYPE.MUSHROOM ? sprites?.mushroom : undefined

      if (sprite && isCollectibleSpriteLoaded(sprite)) {
        context.drawImage(
          sprite,
          0,
          0,
          sprite.naturalWidth,
          sprite.naturalHeight,
          screenX,
          screenY,
          powerUp.size.width,
          powerUp.size.height,
        )
        continue
      }

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

  private getMarioSprites(): MarioSpriteCatalog | undefined {
    if (typeof Image === 'undefined') {
      return undefined
    }

    if (!this.marioSprites) {
      this.marioSprites = createMarioSpriteCatalog()
    }

    return this.marioSprites
  }

  private getCollectibleSprites(): CollectibleSpriteCatalog | undefined {
    if (typeof Image === 'undefined') {
      return undefined
    }

    if (!this.collectibleSprites) {
      this.collectibleSprites = createCollectibleSpriteCatalog()
    }

    return this.collectibleSprites
  }

  private renderMario(
    state: GameState,
    mario: Mario,
    visual: MarioVisual,
    scenario: Scenario,
  ): void {
    const { element, context } = this.surface

    const cameraX = mario.position.x - element.width * 0.25
    const screenX = mario.position.x - cameraX + visual.offsetX

    const screenGroundY = element.height - scenario.ground.y

    const screenY =
      screenGroundY -
      DEFAULT_GROUND_HEIGHT -
      visual.height +
      mario.position.y +
      visual.offsetY
    const sprites = this.getMarioSprites()

    if (sprites) {
      if (visual.variant === 'DEAD') {
        const deadSprite = sprites.dead

        if (isSpriteLoaded(deadSprite)) {
          context.drawImage(
            deadSprite,
            0,
            0,
            16,
            16,
            screenX,
            screenY,
            visual.width,
            visual.height,
          )
          return
        }
      } else {
        const sprite = visual.variant === 'BIG' ? sprites.big : sprites.small

        if (isSpriteLoaded(sprite.image)) {
          const frame =
            state === 'READY'
              ? sprite.frames.idle
              : getMarioSpriteFrame(sprite, visual)

          context.drawImage(
            sprite.image,
            frame.x,
            frame.y,
            frame.width,
            frame.height,
            screenX,
            screenY,
            visual.width,
            visual.height,
          )
          return
        }
      }
    }

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
