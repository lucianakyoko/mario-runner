import type { SpawnState } from './spawn-state'

export const updateSpawnDistance = (
  state: SpawnState,
  distance: number,
): SpawnState => ({
  ...state,
  distanceSinceLastSpawn: state.distanceSinceLastSpawn + distance,
})
