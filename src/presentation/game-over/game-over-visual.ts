export interface GameOverVisual {
  title: string
  instruction: string
}

export const createGameOverVisual = (): GameOverVisual => ({
  title: 'GAME OVER',
  instruction: 'PRESS RESTART',
})
