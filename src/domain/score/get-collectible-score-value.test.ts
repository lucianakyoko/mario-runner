import { describe, expect, it } from 'vitest'

import { collectibleTypes } from '../collectible/collectible-type'
import { defaultGameplayConfig } from '../config/default-gameplay-config'
import { getCollectibleScoreValue } from './get-collectible-score-value'

describe('getCollectibleScoreValue', () => {
  it('returns 1 point for a coin', () => {
    expect(
      getCollectibleScoreValue(
        collectibleTypes.COIN,
        defaultGameplayConfig.scoring,
      ),
    ).toBe(1)
  })

  it('returns 2 points for a medal', () => {
    expect(
      getCollectibleScoreValue(
        collectibleTypes.MEDAL,
        defaultGameplayConfig.scoring,
      ),
    ).toBe(2)
  })

  it('always uses the configured scoring values', () => {
    const scoring = {
      coinPoints: 10,
      medalPoints: 25,
    }

    expect(getCollectibleScoreValue(collectibleTypes.COIN, scoring)).toBe(10)
    expect(getCollectibleScoreValue(collectibleTypes.MEDAL, scoring)).toBe(25)
  })
})
