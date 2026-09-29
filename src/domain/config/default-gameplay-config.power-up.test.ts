import { describe, expect, it } from 'vitest'

import { defaultGameplayConfig } from './default-gameplay-config'

describe('defaultGameplayConfig powerUp', () => {
  it('should expose the mushroom configuration', () => {
    expect(defaultGameplayConfig.powerUp).toEqual({
      width: 32,
      height: 32,
      groundOffset: 0,
      speed: 280,
      collisionBounds: {
        offsetX: 2,
        offsetY: 2,
        width: 28,
        height: 28,
      },
    })
  })
})
