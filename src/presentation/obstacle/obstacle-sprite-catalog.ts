import type { SpriteFrame } from '../mario/mario-sprite-catalog'
import {
  OBSTACLE_VARIANT,
  type ObstacleVariant,
} from '../../domain/obstacle/obstacle-variant'

export { OBSTACLE_VARIANT }
export type { ObstacleVariant }

export interface ObstacleSprite {
  image: HTMLImageElement
  frames: readonly SpriteFrame[]
}

export type ObstacleSpriteCatalog = Record<ObstacleVariant, ObstacleSprite>

const loadImage = (src: string): HTMLImageElement => {
  const image = new Image()
  image.src = src
  return image
}

const createHorizontalFrames = (
  frameWidths: readonly number[],
  frameHeight: number,
): readonly SpriteFrame[] => {
  let x = 0

  return frameWidths.map((width) => {
    const frame: SpriteFrame = {
      x,
      y: 0,
      width,
      height: frameHeight,
    }

    x += width
    return frame
  })
}

const createObstacleSprite = (
  path: string,
  frameWidths: readonly number[],
  frameHeight: number,
): ObstacleSprite => ({
  image: loadImage(path),
  frames: createHorizontalFrames(frameWidths, frameHeight),
})

export const createObstacleSpriteCatalog = (): ObstacleSpriteCatalog => ({
  [OBSTACLE_VARIANT.CANNONBALL]: createObstacleSprite(
    '/sprites/obstacles/cannonball.png',
    [16],
    14,
  ),
  [OBSTACLE_VARIANT.HAMMER]: createObstacleSprite(
    '/sprites/obstacles/hammer.png',
    [16, 16, 16, 16, 16, 16, 16],
    16,
  ),
  [OBSTACLE_VARIANT.PTOOIE]: createObstacleSprite(
    '/sprites/obstacles/ptooie.png',
    [16, 16, 16, 16],
    27,
  ),
  [OBSTACLE_VARIANT.MUNCHER]: createObstacleSprite(
    '/sprites/obstacles/muncher.png',
    [16, 16, 16],
    16,
  ),
  [OBSTACLE_VARIANT.NIPPERPLANT]: createObstacleSprite(
    '/sprites/obstacles/nipperplant.png',
    [16, 16, 16, 16],
    16,
  ),
  [OBSTACLE_VARIANT.SPINY]: createObstacleSprite(
    '/sprites/obstacles/spiny.png',
    [16, 16],
    16,
  ),
})

export const isObstacleSpriteLoaded = (image: HTMLImageElement): boolean =>
  image.complete && image.naturalWidth > 0
