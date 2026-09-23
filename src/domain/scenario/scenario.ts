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
