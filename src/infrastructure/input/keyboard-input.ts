import type { Input } from '../../application/input'
import type { GameplayCommand } from '../../domain/input'

interface KeyboardEventTarget {
  addEventListener(
    type: 'keydown' | 'keyup',
    listener: (event: KeyboardEvent) => void,
  ): void

  removeEventListener(
    type: 'keydown' | 'keyup',
    listener: (event: KeyboardEvent) => void,
  ): void
}

export class KeyboardInput implements Input {
  private readonly activeCommands = new Set<GameplayCommand>()
  private readonly eventTarget: KeyboardEventTarget
  private isRegistered = false

  constructor(eventTarget: KeyboardEventTarget) {
    this.eventTarget = eventTarget
  }

  register(): void {
    if (this.isRegistered) {
      return
    }

    this.eventTarget.addEventListener('keydown', this.handleKeyDown)
    this.eventTarget.addEventListener('keyup', this.handleKeyUp)

    this.isRegistered = true
  }

  dispose(): void {
    if (!this.isRegistered) {
      return
    }

    this.eventTarget.removeEventListener('keydown', this.handleKeyDown)
    this.eventTarget.removeEventListener('keyup', this.handleKeyUp)

    this.activeCommands.clear()
    this.isRegistered = false
  }

  isActive(command: GameplayCommand): boolean {
    return this.activeCommands.has(command)
  }

  private handleKeyDown = (event: KeyboardEvent): void => {
    const command = this.getCommand(event.code)

    if (!command) {
      return
    }

    this.activeCommands.add(command)
  }

  private handleKeyUp = (event: KeyboardEvent): void => {
    const command = this.getCommand(event.code)

    if (!command) {
      return
    }

    this.activeCommands.delete(command)
  }

  private getCommand(code: string): GameplayCommand | null {
    switch (code) {
      case 'ArrowUp':
      case 'Space':
        return 'jump'

      case 'ArrowDown':
        return 'crouch'

      default:
        return null
    }
  }
}
