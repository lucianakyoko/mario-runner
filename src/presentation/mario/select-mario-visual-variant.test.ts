import { describe, expect, it } from 'vitest'

import { marioPowerState } from '../../domain/mario/mario-power-state'
import { selectMarioVisualVariant } from './select-mario-visual-variant'

describe('selectMarioVisualVariant', () => {
  it('selects the small visual for normal Mario', () => {
    expect(selectMarioVisualVariant(marioPowerState.NORMAL)).toBe('SMALL')
  })

  it('selects the big visual for powered Mario', () => {
    expect(selectMarioVisualVariant(marioPowerState.POWERED)).toBe('BIG')
  })
})
