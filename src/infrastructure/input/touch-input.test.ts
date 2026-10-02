import { describe, expect, it, vi } from 'vitest'

import { TouchInput } from './touch-input'

type PointerEventListener = (event: PointerEvent) => void

type PointerEventType =
  'pointerdown' | 'pointermove' | 'pointerup' | 'pointercancel'

interface PointerEventTargetMock {
  addEventListener: ReturnType<
    typeof vi.fn<
      (type: PointerEventType, listener: PointerEventListener) => void
    >
  >
  removeEventListener: ReturnType<
    typeof vi.fn<
      (type: PointerEventType, listener: PointerEventListener) => void
    >
  >
}

const createEventTarget = (): PointerEventTargetMock => ({
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
})

const createPointerEvent = (
  pointerId: number,
  clientX: number,
  clientY: number,
  pointerType = 'touch',
): PointerEvent =>
  ({
    pointerId,
    pointerType,
    clientX,
    clientY,
  }) as PointerEvent

const getHandler = (
  eventTarget: PointerEventTargetMock,
  type: PointerEventType,
): PointerEventListener => {
  const call = eventTarget.addEventListener.mock.calls.find(
    ([registeredType]) => registeredType === type,
  )

  const handler = call?.[1]

  if (!handler) {
    throw new Error(`${type} handler was not registered.`)
  }

  return handler
}

describe('TouchInput lifecycle', () => {
  it('registers all pointer listeners once', () => {
    const eventTarget = createEventTarget()
    const input = new TouchInput(eventTarget)

    input.register()
    input.register()

    expect(eventTarget.addEventListener).toHaveBeenCalledTimes(4)

    expect(eventTarget.addEventListener).toHaveBeenNthCalledWith(
      1,
      'pointerdown',
      expect.any(Function),
    )
    expect(eventTarget.addEventListener).toHaveBeenNthCalledWith(
      2,
      'pointermove',
      expect.any(Function),
    )
    expect(eventTarget.addEventListener).toHaveBeenNthCalledWith(
      3,
      'pointerup',
      expect.any(Function),
    )
    expect(eventTarget.addEventListener).toHaveBeenNthCalledWith(
      4,
      'pointercancel',
      expect.any(Function),
    )
  })

  it('removes all pointer listeners on dispose', () => {
    const eventTarget = createEventTarget()
    const input = new TouchInput(eventTarget)

    input.register()
    input.dispose()

    expect(eventTarget.removeEventListener).toHaveBeenCalledTimes(4)

    expect(eventTarget.removeEventListener).toHaveBeenNthCalledWith(
      1,
      'pointerdown',
      expect.any(Function),
    )
    expect(eventTarget.removeEventListener).toHaveBeenNthCalledWith(
      2,
      'pointermove',
      expect.any(Function),
    )
    expect(eventTarget.removeEventListener).toHaveBeenNthCalledWith(
      3,
      'pointerup',
      expect.any(Function),
    )
    expect(eventTarget.removeEventListener).toHaveBeenNthCalledWith(
      4,
      'pointercancel',
      expect.any(Function),
    )
  })

  it('does not remove listeners when dispose is called before register', () => {
    const eventTarget = createEventTarget()
    const input = new TouchInput(eventTarget)

    input.dispose()

    expect(eventTarget.removeEventListener).not.toHaveBeenCalled()
  })

  it('does not remove listeners more than once when dispose is repeated', () => {
    const eventTarget = createEventTarget()
    const input = new TouchInput(eventTarget)

    input.register()
    input.dispose()
    input.dispose()

    expect(eventTarget.removeEventListener).toHaveBeenCalledTimes(4)
  })

  it('can register again after dispose', () => {
    const eventTarget = createEventTarget()
    const input = new TouchInput(eventTarget)

    input.register()
    input.dispose()
    input.register()

    expect(eventTarget.addEventListener).toHaveBeenCalledTimes(8)
  })
})

describe('TouchInput commands', () => {
  it('activates jump when a touch starts', () => {
    const eventTarget = createEventTarget()
    const input = new TouchInput(eventTarget)

    input.register()

    const pointerDownHandler = getHandler(eventTarget, 'pointerdown')

    pointerDownHandler(createPointerEvent(1, 100, 100))

    expect(input.isActive('jump')).toBe(true)
    expect(input.isActive('crouch')).toBe(false)
  })

  it('deactivates jump when the touch is released', () => {
    const eventTarget = createEventTarget()
    const input = new TouchInput(eventTarget)

    input.register()

    const pointerDownHandler = getHandler(eventTarget, 'pointerdown')
    const pointerUpHandler = getHandler(eventTarget, 'pointerup')

    pointerDownHandler(createPointerEvent(1, 100, 100))
    pointerUpHandler(createPointerEvent(1, 100, 100))

    expect(input.isActive('jump')).toBe(false)
  })

  it('activates crouch when the touch moves downward beyond the threshold', () => {
    const eventTarget = createEventTarget()
    const input = new TouchInput(eventTarget)

    input.register()

    const pointerDownHandler = getHandler(eventTarget, 'pointerdown')
    const pointerMoveHandler = getHandler(eventTarget, 'pointermove')

    pointerDownHandler(createPointerEvent(1, 100, 100))
    pointerMoveHandler(createPointerEvent(1, 100, 124))

    expect(input.isActive('jump')).toBe(false)
    expect(input.isActive('crouch')).toBe(true)
  })

  it('keeps crouch active while the same touch remains pressed', () => {
    const eventTarget = createEventTarget()
    const input = new TouchInput(eventTarget)

    input.register()

    const pointerDownHandler = getHandler(eventTarget, 'pointerdown')
    const pointerMoveHandler = getHandler(eventTarget, 'pointermove')

    pointerDownHandler(createPointerEvent(1, 100, 100))
    pointerMoveHandler(createPointerEvent(1, 100, 130))
    pointerMoveHandler(createPointerEvent(1, 100, 150))

    expect(input.isActive('jump')).toBe(false)
    expect(input.isActive('crouch')).toBe(true)
  })

  it('deactivates crouch when the touch is released', () => {
    const eventTarget = createEventTarget()
    const input = new TouchInput(eventTarget)

    input.register()

    const pointerDownHandler = getHandler(eventTarget, 'pointerdown')
    const pointerMoveHandler = getHandler(eventTarget, 'pointermove')
    const pointerUpHandler = getHandler(eventTarget, 'pointerup')

    pointerDownHandler(createPointerEvent(1, 100, 100))
    pointerMoveHandler(createPointerEvent(1, 100, 130))
    pointerUpHandler(createPointerEvent(1, 100, 130))

    expect(input.isActive('jump')).toBe(false)
    expect(input.isActive('crouch')).toBe(false)
  })

  it('does not activate crouch for a horizontal movement', () => {
    const eventTarget = createEventTarget()
    const input = new TouchInput(eventTarget)

    input.register()

    const pointerDownHandler = getHandler(eventTarget, 'pointerdown')
    const pointerMoveHandler = getHandler(eventTarget, 'pointermove')

    pointerDownHandler(createPointerEvent(1, 100, 100))
    pointerMoveHandler(createPointerEvent(1, 130, 100))

    expect(input.isActive('jump')).toBe(true)
    expect(input.isActive('crouch')).toBe(false)
  })

  it('clears commands when the active pointer is cancelled', () => {
    const eventTarget = createEventTarget()
    const input = new TouchInput(eventTarget)

    input.register()

    const pointerDownHandler = getHandler(eventTarget, 'pointerdown')
    const pointerMoveHandler = getHandler(eventTarget, 'pointermove')
    const pointerCancelHandler = getHandler(eventTarget, 'pointercancel')

    pointerDownHandler(createPointerEvent(1, 100, 100))
    pointerMoveHandler(createPointerEvent(1, 100, 130))
    pointerCancelHandler(createPointerEvent(1, 100, 130))

    expect(input.isActive('jump')).toBe(false)
    expect(input.isActive('crouch')).toBe(false)
  })

  it('ignores non-touch pointers', () => {
    const eventTarget = createEventTarget()
    const input = new TouchInput(eventTarget)

    input.register()

    const pointerDownHandler = getHandler(eventTarget, 'pointerdown')

    pointerDownHandler(createPointerEvent(1, 100, 100, 'mouse'))

    expect(input.isActive('jump')).toBe(false)
    expect(input.isActive('crouch')).toBe(false)
  })
})

describe('TouchInput concurrent interaction', () => {
  it('ignores a second pointer while the first pointer is active', () => {
    const eventTarget = createEventTarget()
    const input = new TouchInput(eventTarget)

    input.register()

    const pointerDownHandler = getHandler(eventTarget, 'pointerdown')

    pointerDownHandler(createPointerEvent(1, 100, 100))
    pointerDownHandler(createPointerEvent(2, 200, 200))

    expect(input.isActive('jump')).toBe(true)
    expect(input.isActive('crouch')).toBe(false)
  })

  it('ignores a second pointer release while the first pointer is active', () => {
    const eventTarget = createEventTarget()
    const input = new TouchInput(eventTarget)

    input.register()

    const pointerDownHandler = getHandler(eventTarget, 'pointerdown')
    const pointerUpHandler = getHandler(eventTarget, 'pointerup')

    pointerDownHandler(createPointerEvent(1, 100, 100))
    pointerUpHandler(createPointerEvent(2, 200, 200))

    expect(input.isActive('jump')).toBe(true)
  })

  it('allows a new pointer after the active pointer is released', () => {
    const eventTarget = createEventTarget()
    const input = new TouchInput(eventTarget)

    input.register()

    const pointerDownHandler = getHandler(eventTarget, 'pointerdown')
    const pointerUpHandler = getHandler(eventTarget, 'pointerup')

    pointerDownHandler(createPointerEvent(1, 100, 100))
    pointerUpHandler(createPointerEvent(1, 100, 100))

    expect(input.isActive('jump')).toBe(false)

    pointerDownHandler(createPointerEvent(2, 200, 200))

    expect(input.isActive('jump')).toBe(true)
  })
})
