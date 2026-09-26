import type { Rectangle } from './rectangle'

export const intersectsRectangle = (
  first: Rectangle,
  second: Rectangle,
): boolean => {
  const overlapsHorizontally =
    first.x < second.x + second.width && first.x + first.width > second.x

  const overlapsVertically =
    first.y < second.y + second.height && first.y + first.height > second.y

  return overlapsHorizontally && overlapsVertically
}
