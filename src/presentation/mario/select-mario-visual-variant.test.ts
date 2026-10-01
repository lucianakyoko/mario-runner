import { describe, expect, it } from 'vitest'

import { marioLifeState } from '../../domain/mario/mario-life-state'
import { marioPowerState } from '../../domain/mario/mario-power-state'
import { selectMarioVisualVariant } from './select-mario-visual-variant'

describe('selectMarioVisualVariant', () => {
  it('selects the small visual for alive normal Mario', () => {
    expect(
      selectMarioVisualVariant(marioLifeState.ALIVE, marioPowerState.NORMAL),
    ).toBe('SMALL')
  })

  it('selects the big visual for alive powered Mario', () => {
    expect(
      selectMarioVisualVariant(marioLifeState.ALIVE, marioPowerState.POWERED),
    ).toBe('BIG')
  })

  it('selects the dead visual for dead normal Mario', () => {
    expect(
      selectMarioVisualVariant(marioLifeState.DEAD, marioPowerState.NORMAL),
    ).toBe('DEAD')
  })

  it('selects the dead visual for dead powered Mario', () => {
    expect(
      selectMarioVisualVariant(marioLifeState.DEAD, marioPowerState.POWERED),
    ).toBe('DEAD')
  })
})
