const BUSH_SPRITE_PATH = '/sprites/environments/bush-1.png'
const CLOUD_SPRITE_PATH = '/sprites/environments/cloud.png'

export interface EnvironmentDecorationFrame {
  sourceX: number
  sourceY: number
  width: number
  height: number
}

export interface EnvironmentDecorationSprite {
  image: HTMLImageElement
  frames: readonly EnvironmentDecorationFrame[]
}

export interface EnvironmentDecorationCatalog {
  bush: EnvironmentDecorationSprite
  cloud: EnvironmentDecorationSprite
}

const BUSH_FRAMES: readonly EnvironmentDecorationFrame[] = [
  {
    sourceX: 0,
    sourceY: 0,
    width: 128,
    height: 64,
  },
  {
    sourceX: 128,
    sourceY: 0,
    width: 80,
    height: 65,
  },
  {
    sourceX: 208,
    sourceY: 0,
    width: 63,
    height: 48,
  },
]

const CLOUD_FRAMES: readonly EnvironmentDecorationFrame[] = [
  {
    sourceX: 0,
    sourceY: 0,
    width: 32,
    height: 23,
  },
  {
    sourceX: 32,
    sourceY: 0,
    width: 48,
    height: 23,
  },
  {
    sourceX: 80,
    sourceY: 0,
    width: 64,
    height: 23,
  },
]

const loadImage = (src: string): HTMLImageElement => {
  const image = new Image()
  image.src = src

  return image
}

export const createEnvironmentDecorationCatalog =
  (): EnvironmentDecorationCatalog => ({
    bush: {
      image: loadImage(BUSH_SPRITE_PATH),
      frames: BUSH_FRAMES,
    },
    cloud: {
      image: loadImage(CLOUD_SPRITE_PATH),
      frames: CLOUD_FRAMES,
    },
  })

export const isEnvironmentDecorationLoaded = (
  image: HTMLImageElement,
): boolean => image.complete && image.naturalWidth > 0
