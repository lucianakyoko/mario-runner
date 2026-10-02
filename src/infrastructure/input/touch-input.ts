import type { Input } from '../../application/input'
import type { GameplayCommand } from '../../domain/input'

interface PointerEventTarget {
  addEventListener(
    type: 'pointerdown' | 'pointermove' | 'pointerup' | 'pointercancel',
    listener: (event: PointerEvent) => void,
  ): void

  removeEventListener(
    type: 'pointerdown' | 'pointermove' | 'pointerup' | 'pointercancel',
    listener: (event: PointerEvent) => void,
  ): void
}

interface PointerPosition {
  readonly x: number
  readonly y: number
}

const DOWNWARD_SWIPE_THRESHOLD = 24

export class TouchInput implements Input {
  private readonly activeCommands = new Set<GameplayCommand>()
  private readonly eventTarget: PointerEventTarget

  private isRegistered = false
  private activePointerId: number | null = null
  private initialPosition: PointerPosition | null = null
  private crouchActivated = false

  constructor(eventTarget: PointerEventTarget) {
    this.eventTarget = eventTarget
  }

  register(): void {
    if (this.isRegistered) {
      return
    }

    this.eventTarget.addEventListener('pointerdown', this.handlePointerDown)
    this.eventTarget.addEventListener('pointermove', this.handlePointerMove)
    this.eventTarget.addEventListener('pointerup', this.handlePointerUp)
    this.eventTarget.addEventListener('pointercancel', this.handlePointerCancel)

    this.isRegistered = true
  }

  dispose(): void {
    if (!this.isRegistered) {
      return
    }

    this.eventTarget.removeEventListener('pointerdown', this.handlePointerDown)
    this.eventTarget.removeEventListener('pointermove', this.handlePointerMove)
    this.eventTarget.removeEventListener('pointerup', this.handlePointerUp)
    this.eventTarget.removeEventListener(
      'pointercancel',
      this.handlePointerCancel,
    )

    this.activeCommands.clear()
    this.resetPointer()

    this.isRegistered = false
  }

  isActive(command: GameplayCommand): boolean {
    return this.activeCommands.has(command)
  }

  press(command: GameplayCommand): void {
    this.activeCommands.add(command)
  }

  release(command: GameplayCommand): void {
    this.activeCommands.delete(command)
  }

  private handlePointerDown = (event: PointerEvent): void => {
    if (event.pointerType !== 'touch') {
      return
    }

    if (this.activePointerId !== null) {
      return
    }

    this.activePointerId = event.pointerId
    this.initialPosition = {
      x: event.clientX,
      y: event.clientY,
    }

    this.crouchActivated = false
    this.activeCommands.delete('crouch')
    this.activeCommands.add('jump')
  }

  private handlePointerMove = (event: PointerEvent): void => {
    if (event.pointerId !== this.activePointerId) {
      return
    }

    if (!this.initialPosition || this.crouchActivated) {
      return
    }

    const deltaY = event.clientY - this.initialPosition.y

    if (deltaY < DOWNWARD_SWIPE_THRESHOLD) {
      return
    }

    this.activeCommands.delete('jump')
    this.activeCommands.add('crouch')
    this.crouchActivated = true
  }

  private handlePointerUp = (event: PointerEvent): void => {
    if (event.pointerId !== this.activePointerId) {
      return
    }

    this.activeCommands.delete('jump')
    this.activeCommands.delete('crouch')

    this.resetPointer()
  }

  private handlePointerCancel = (event: PointerEvent): void => {
    if (event.pointerId !== this.activePointerId) {
      return
    }

    this.activeCommands.delete('jump')
    this.activeCommands.delete('crouch')

    this.resetPointer()
  }

  private resetPointer(): void {
    this.activePointerId = null
    this.initialPosition = null
    this.crouchActivated = false
  }
}
