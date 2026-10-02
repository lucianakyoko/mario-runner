export const calculatePowerUpSpawnX = (
  spawnX: number,
  obstacleWasSpawned: boolean,
  obstacleClearance: number,
): number => (obstacleWasSpawned ? spawnX + obstacleClearance : spawnX)
