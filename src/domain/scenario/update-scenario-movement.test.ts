import { describe, expect, it } from 'vitest'

import type { Scenario } from './scenario'
import { updateScenarioMovement } from './update-scenario-movement'

const createScenario = (): Scenario => ({
  id: 'default',
  background: {
    id: 'default',
  },
  ground: {
    y: 0,
  },
  position: {
    x: 100,
  },
})

describe('updateScenarioMovement', () => {
  it('moves the scenario according to elapsed time', () => {
    const scenario = createScenario()

    const updatedScenario = updateScenarioMovement(scenario, 280, 0.5)

    expect(updatedScenario.position.x).toBe(240)
  })

  it('preserves the original scenario state', () => {
    const scenario = createScenario()

    updateScenarioMovement(scenario, 280, 0.5)

    expect(scenario.position.x).toBe(100)
  })

  it('preserves non-movement scenario data', () => {
    const scenario = createScenario()

    const updatedScenario = updateScenarioMovement(scenario, 280, 0.5)

    expect(updatedScenario.id).toBe(scenario.id)
    expect(updatedScenario.background).toEqual(scenario.background)
    expect(updatedScenario.ground).toEqual(scenario.ground)
  })

  it('produces the same displacement at different frame rates', () => {
    const sixtyFpsDeltaTime = 1 / 60
    const thirtyFpsDeltaTime = 1 / 30

    let scenarioAtSixtyFps = createScenario()
    let scenarioAtThirtyFps = createScenario()

    for (let frame = 0; frame < 60; frame += 1) {
      scenarioAtSixtyFps = updateScenarioMovement(
        scenarioAtSixtyFps,
        280,
        sixtyFpsDeltaTime,
      )
    }

    for (let frame = 0; frame < 30; frame += 1) {
      scenarioAtThirtyFps = updateScenarioMovement(
        scenarioAtThirtyFps,
        280,
        thirtyFpsDeltaTime,
      )
    }

    expect(scenarioAtSixtyFps.position.x).toBeCloseTo(
      scenarioAtThirtyFps.position.x,
    )
  })
})
