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
  private readonly activeKeys = new Set<string>()
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

    this.activeKeys.clear()
    this.isRegistered = false
  }

  isActive(command: GameplayCommand): boolean {
    for (const key of this.activeKeys) {
      if (this.getCommand(key) === command) {
        return true
      }
    }

    return false
  }

  private handleKeyDown = (event: KeyboardEvent): void => {
    if (!this.getCommand(event.code)) {
      return
    }

    this.activeKeys.add(event.code)
  }

  private handleKeyUp = (event: KeyboardEvent): void => {
    this.activeKeys.delete(event.code)
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
