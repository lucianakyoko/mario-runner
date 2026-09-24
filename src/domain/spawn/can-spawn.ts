import type { SpawnState } from './spawn-state'

export const canSpawn = (state: SpawnState): boolean =>
  state.distanceSinceLastSpawn >= state.nextSpawnDistance
