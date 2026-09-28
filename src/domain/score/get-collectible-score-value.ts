import type { ScoringConfig } from '../config/gameplay-config'
import { collectibleTypes } from '../collectible/collectible-type'
import type { CollectibleType } from '../collectible/collectible-type'

export const getCollectibleScoreValue = (
  type: CollectibleType,
  config: ScoringConfig,
): number => {
  if (type === collectibleTypes.COIN) {
    return config.coinPoints
  }

  return config.medalPoints
}
