import type { Scenario } from './scenario'

export const updateScenarioMovement = (
  scenario: Scenario,
  speed: number,
  deltaTime: number,
): Scenario => ({
  ...scenario,
  position: {
    ...scenario.position,
    x: scenario.position.x + speed * deltaTime,
  },
})
