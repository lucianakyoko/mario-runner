import type { SpriteFrame } from '../mario/mario-sprite-catalog'

export interface AnimatedCollectibleSprite {
  image: HTMLImageElement
  frames: readonly SpriteFrame[]
}

export interface CollectibleSpriteCatalog {
  coin: AnimatedCollectibleSprite
  medal: AnimatedCollectibleSprite
  mushroom: HTMLImageElement
}

const loadImage = (src: string): HTMLImageElement => {
  const image = new Image()
  image.src = src
  return image
}

const createHorizontalFrames = (
  widths: readonly number[],
  height: number,
): readonly SpriteFrame[] => {
  let x = 0

  return widths.map((width) => {
    const frame: SpriteFrame = {
      x,
      y: 0,
      width,
      height,
    }

    x += width
    return frame
  })
}

export const createCollectibleSpriteCatalog = (): CollectibleSpriteCatalog => ({
  coin: {
    image: loadImage('/sprites/collectibles/coin.png'),
    frames: createHorizontalFrames([14, 10, 10, 6], 16),
  },
  medal: {
    image: loadImage('/sprites/collectibles/medal.png'),
    frames: createHorizontalFrames([20, 15, 8], 32),
  },
  mushroom: loadImage('/sprites/power-ups/super-mushroom.png'),
})

export const isCollectibleSpriteLoaded = (image: HTMLImageElement): boolean =>
  image.complete && image.naturalWidth > 0
