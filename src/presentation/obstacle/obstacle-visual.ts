import type { ObstacleType } from '../../domain/obstacle/obstacle-type'

export interface ObstacleVisual {
  type: ObstacleType
  width: number
  height: number
  offsetX: number
  offsetY: number
}

export const createObstacleVisual = (
  type: ObstacleType,
  width: number,
  height: number,
  offsetX: number,
  offsetY: number,
): ObstacleVisual => ({
  type,
  width,
  height,
  offsetX,
  offsetY,
})
