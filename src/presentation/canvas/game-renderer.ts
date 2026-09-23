import { defaultGameplayConfig } from '../../domain/config/default-gameplay-config'
import type { GameState } from '../../domain/game/game-state'
import type { Mario } from '../../domain/mario/mario'
import type { MarioVisual } from '../mario/mario-visual'
import { CanvasSurface } from './canvas-surface'

export class GameRenderer {
  private readonly surface: CanvasSurface

  constructor(surface: CanvasSurface) {
    this.surface = surface
  }

  render(state: GameState, mario: Mario, marioVisual: MarioVisual): void {
    const { element, context } = this.surface

    context.clearRect(0, 0, element.width, element.height)

    context.fillText(this.getStateLabel(state), 16, 24)

    this.renderMario(mario, marioVisual)
  }

  private renderMario(mario: Mario, visual: MarioVisual): void {
    const { element, context } = this.surface

    const cameraX = mario.position.x - element.width * 0.25
    const screenX = mario.position.x - cameraX + visual.offsetX

    const groundY = defaultGameplayConfig.physics.groundY
    const screenGroundY = element.height - groundY

    const screenY =
      screenGroundY - visual.height + mario.position.y + visual.offsetY

    context.fillRect(screenX, screenY, visual.width, visual.height)
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
