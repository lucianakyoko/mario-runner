import type { MarioVisual } from './mario-visual'

export interface SpriteFrame {
  x: number
  y: number
  width: number
  height: number
}

export interface MarioSprite {
  image: HTMLImageElement
  frames: {
    idle: SpriteFrame
    running: readonly [SpriteFrame, SpriteFrame]
    jumping: SpriteFrame
    crouching?: SpriteFrame
  }
}

export interface MarioSpriteCatalog {
  small: MarioSprite
  big: MarioSprite
  dead: HTMLImageElement
}

const createFrame = (
  x: number,
  width: number,
  height: number,
  y = 0,
): SpriteFrame => ({
  x,
  y,
  width,
  height,
})

const loadImage = (src: string): HTMLImageElement => {
  const image = new Image()
  image.src = src
  return image
}

const createMarioSprite = (
  image: HTMLImageElement,
  frameWidths: readonly number[],
  frameHeight: number,
  crouchingHeight?: number,
): MarioSprite => {
  const frames = frameWidths.map((width, index) => {
    const x = frameWidths
      .slice(0, index)
      .reduce((total, frameWidth) => total + frameWidth, 0)

    const isCrouchingFrame =
      crouchingHeight !== undefined && index === frameWidths.length - 1

    const height = isCrouchingFrame ? crouchingHeight : frameHeight
    const y = isCrouchingFrame ? frameHeight - height : 0

    return createFrame(x, width, height, y)
  })

  return {
    image,
    frames: {
      idle: frames[0]!,
      running: [frames[1]!, frames[2]!],
      jumping: frames[3]!,
      ...(crouchingHeight !== undefined ? { crouching: frames[4]! } : {}),
    },
  }
}

export const createMarioSpriteCatalog = (): MarioSpriteCatalog => {
  const smallImage = loadImage('/sprites/characters/small-mario.png')
  const bigImage = loadImage('/sprites/characters/mario.png')

  return {
    small: createMarioSprite(smallImage, [12, 16, 16, 16], 16),
    big: createMarioSprite(bigImage, [14, 16, 16, 16, 14], 27, 18),
    dead: loadImage('/sprites/characters/dead-mario.png'),
  }
}

export const isSpriteLoaded = (image: HTMLImageElement): boolean =>
  image.complete && image.naturalWidth > 0

export const getMarioSpriteFrame = (
  sprite: MarioSprite,
  visual: MarioVisual,
): SpriteFrame => {
  switch (visual.movementState) {
    case 'RUNNING':
      return sprite.frames.running[visual.animationFrame]

    case 'JUMPING':
    case 'FALLING':
      return sprite.frames.jumping

    case 'CROUCHING':
      return sprite.frames.crouching ?? sprite.frames.idle
  }
}

export const createSpriteFrame = (
  x: number,
  width: number,
  height: number,
): SpriteFrame => createFrame(x, width, height)
