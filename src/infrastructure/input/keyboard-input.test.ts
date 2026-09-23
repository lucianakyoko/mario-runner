import { afterEach, describe, expect, it } from 'vitest'

import { KeyboardInput } from './keyboard-input'

interface RegisteredListener {
  type: 'keydown' | 'keyup'
  listener: (event: KeyboardEvent) => void
}

class FakeKeyboardEventTarget {
  private readonly listeners: RegisteredListener[] = []

  addEventListener(
    type: 'keydown' | 'keyup',
    listener: (event: KeyboardEvent) => void,
  ): void {
    this.listeners.push({
      type,
      listener,
    })
  }

  removeEventListener(
    type: 'keydown' | 'keyup',
    listener: (event: KeyboardEvent) => void,
  ): void {
    const index = this.listeners.findIndex(
      (registeredListener) =>
        registeredListener.type === type &&
        registeredListener.listener === listener,
    )

    if (index >= 0) {
      this.listeners.splice(index, 1)
    }
  }

  dispatch(type: 'keydown' | 'keyup', code: string): void {
    const event = {
      code,
    } as KeyboardEvent

    for (const registeredListener of this.listeners) {
      if (registeredListener.type === type) {
        registeredListener.listener(event)
      }
    }
  }

  get listenerCount(): number {
    return this.listeners.length
  }
}

describe('KeyboardInput', () => {
  let input: KeyboardInput

  afterEach(() => {
    input?.dispose()
  })

  it('maps ArrowUp to jump', () => {
    const eventTarget = new FakeKeyboardEventTarget()
    input = new KeyboardInput(eventTarget)

    input.register()
    eventTarget.dispatch('keydown', 'ArrowUp')

    expect(input.isActive('jump')).toBe(true)
    expect(input.isActive('crouch')).toBe(false)
  })

  it('maps Space to jump', () => {
    const eventTarget = new FakeKeyboardEventTarget()
    input = new KeyboardInput(eventTarget)

    input.register()
    eventTarget.dispatch('keydown', 'Space')

    expect(input.isActive('jump')).toBe(true)
    expect(input.isActive('crouch')).toBe(false)
  })

  it('maps ArrowDown to crouch', () => {
    const eventTarget = new FakeKeyboardEventTarget()
    input = new KeyboardInput(eventTarget)

    input.register()
    eventTarget.dispatch('keydown', 'ArrowDown')

    expect(input.isActive('crouch')).toBe(true)
    expect(input.isActive('jump')).toBe(false)
  })

  it('does not activate a command for an unsupported key', () => {
    const eventTarget = new FakeKeyboardEventTarget()
    input = new KeyboardInput(eventTarget)

    input.register()
    eventTarget.dispatch('keydown', 'KeyA')

    expect(input.isActive('jump')).toBe(false)
    expect(input.isActive('crouch')).toBe(false)
  })

  it('deactivates jump when the jump key is released', () => {
    const eventTarget = new FakeKeyboardEventTarget()
    input = new KeyboardInput(eventTarget)

    input.register()
    eventTarget.dispatch('keydown', 'ArrowUp')
    eventTarget.dispatch('keyup', 'ArrowUp')

    expect(input.isActive('jump')).toBe(false)
  })

  it('deactivates crouch when ArrowDown is released', () => {
    const eventTarget = new FakeKeyboardEventTarget()
    input = new KeyboardInput(eventTarget)

    input.register()
    eventTarget.dispatch('keydown', 'ArrowDown')
    eventTarget.dispatch('keyup', 'ArrowDown')

    expect(input.isActive('crouch')).toBe(false)
  })

  it('does not register duplicate listeners', () => {
    const eventTarget = new FakeKeyboardEventTarget()
    input = new KeyboardInput(eventTarget)

    input.register()
    input.register()

    expect(eventTarget.listenerCount).toBe(2)
  })

  it('removes listeners when disposed', () => {
    const eventTarget = new FakeKeyboardEventTarget()
    input = new KeyboardInput(eventTarget)

    input.register()
    input.dispose()

    expect(eventTarget.listenerCount).toBe(0)
  })

  it('clears active commands when disposed', () => {
    const eventTarget = new FakeKeyboardEventTarget()
    input = new KeyboardInput(eventTarget)

    input.register()
    eventTarget.dispatch('keydown', 'ArrowUp')
    eventTarget.dispatch('keydown', 'ArrowDown')

    input.dispose()

    expect(input.isActive('jump')).toBe(false)
    expect(input.isActive('crouch')).toBe(false)
  })

  it('allows dispose to be called repeatedly', () => {
    const eventTarget = new FakeKeyboardEventTarget()
    input = new KeyboardInput(eventTarget)

    input.register()

    expect(() => {
      input.dispose()
      input.dispose()
    }).not.toThrow()

    expect(eventTarget.listenerCount).toBe(0)
  })

  it('allows listeners to be registered again after dispose', () => {
    const eventTarget = new FakeKeyboardEventTarget()
    input = new KeyboardInput(eventTarget)

    input.register()
    input.dispose()
    input.register()

    expect(eventTarget.listenerCount).toBe(2)

    eventTarget.dispatch('keydown', 'ArrowUp')

    expect(input.isActive('jump')).toBe(true)
  })
})
