import type { GameState } from '../../domain/game/game-state'
import { CanvasSurface } from './canvas-surface'

export class GameRenderer {
  private readonly surface: CanvasSurface

  constructor(surface: CanvasSurface) {
    this.surface = surface
  }

  render(state: GameState): void {
    const { element, context } = this.surface

    context.clearRect(0, 0, element.width, element.height)

    context.fillText(this.getStateLabel(state), 16, 24)
  }

  private getStateLabel(state: GameState): string {
    switch (state) {
      case 'READY':
        return 'READY'

      case 'RUNNING':
        return 'RUNNING'

      case 'GAME_OVER':
        return 'GAME OVER'

      case 'PAUSED':
        return 'PAUSED'

      case 'LOADING':
        return 'LOADING'

      case 'TRANSITIONING':
        return 'TRANSITIONING'
    }
  }
}
