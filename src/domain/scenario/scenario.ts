export interface ScenarioPosition {
  x: number
}

export interface ScenarioBackground {
  id: string
}

export interface ScenarioGround {
  y: number
}

export interface Scenario {
  id: string
  background: ScenarioBackground
  ground: ScenarioGround
  position: ScenarioPosition
}

export interface InitialScenarioConfig {
  id: string
  backgroundId: string
  groundY: number
}

export const createInitialScenario = (
  config: InitialScenarioConfig,
): Scenario => ({
  id: config.id,
  background: {
    id: config.backgroundId,
  },
  ground: {
    y: config.groundY,
  },
  position: {
    x: 0,
  },
})
