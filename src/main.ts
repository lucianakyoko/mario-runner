import './style.css'

import { GameApplication } from './application/game/application'
import { defaultGameplayConfig } from './domain/config/default-gameplay-config'
import { createInitialMario } from './domain/mario/mario'
import { createInitialScenario } from './domain/scenario/scenario'
import { KeyboardInput } from './infrastructure/input/keyboard-input'
import { TouchInput } from './infrastructure/input/touch-input'
import { AnimationFrameScheduler } from './infrastructure/timing/animation-frame-scheduler'
import { CanvasSurface } from './presentation/canvas/canvas-surface'
import { GameRenderer } from './presentation/canvas/game-renderer'
import { createAnimatedMarioVisual } from './presentation/mario/mario-visual'
import { selectMarioVisualVariant } from './presentation/mario/select-mario-visual-variant'

const app = document.querySelector<HTMLDivElement>('#app')

if (!app) {
  throw new Error('Application root element not found.')
}

app.innerHTML = `
  <main>
    <section aria-label="Game">
      <div class="game-surface">
        <canvas
          id="game-canvas"
          width="800"
          height="300"
          aria-label="Mario Runner"
          aria-describedby="game-status"
        ></canvas>

        <div
          class="touch-controls"
          aria-label="Touch controls"
        >
          <button
            id="touch-jump"
            class="touch-control"
            type="button"
            aria-label="Pular"
          >
            Pular
          </button>

          <button
            id="touch-crouch"
            class="touch-control"
            type="button"
            aria-label="Abaixar"
          >
            Abaixar
          </button>
        </div>
      </div>

      <p
        id="game-status"
        class="visually-hidden"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        READY
      </p>
    </section>

    <section aria-label="Information">
      <p>INFO</p>
    </section>
  </main>
`

const canvas = document.querySelector<HTMLCanvasElement>('#game-canvas')

if (!canvas) {
  throw new Error('Game canvas element not found.')
}

const gameStatus = document.querySelector<HTMLParagraphElement>('#game-status')

if (!gameStatus) {
  throw new Error('Game status element not found.')
}

const jumpButton = document.querySelector<HTMLButtonElement>('#touch-jump')

if (!jumpButton) {
  throw new Error('Touch jump button not found.')
}

const crouchButton = document.querySelector<HTMLButtonElement>('#touch-crouch')

if (!crouchButton) {
  throw new Error('Touch crouch button not found.')
}

const surface = new CanvasSurface(canvas)
const renderer = new GameRenderer(surface)
const scheduler = new AnimationFrameScheduler()
const keyboardInput = new KeyboardInput(window)
const touchInput = new TouchInput(jumpButton)

keyboardInput.register()
touchInput.register()

const mario = createInitialMario({
  width: 32,
  height: 48,
  initialX: 0,
  groundY: defaultGameplayConfig.physics.groundY,
  initialSpeed: defaultGameplayConfig.movement.initialSpeed,
  collisionBounds: defaultGameplayConfig.collision.mario,
})

const scenario = createInitialScenario({
  id: 'default',
  backgroundId: defaultGameplayConfig.scenario.background.id,
  groundY: defaultGameplayConfig.physics.groundY,
})

const animationFrameDuration =
  defaultGameplayConfig.animation.defaultFrameDuration / 1000

const prefersReducedMotion = window.matchMedia(
  '(prefers-reduced-motion: reduce)',
).matches

let previousGameState: string | undefined

const handleJumpPointerDown = (event: PointerEvent): void => {
  if (event.pointerType !== 'touch') {
    return
  }

  event.preventDefault()
  touchInput.press('jump')
}

const handleJumpPointerUp = (event: PointerEvent): void => {
  if (event.pointerType !== 'touch') {
    return
  }

  event.preventDefault()
  touchInput.release('jump')
}

const handleJumpPointerCancel = (event: PointerEvent): void => {
  if (event.pointerType !== 'touch') {
    return
  }

  event.preventDefault()
  touchInput.release('jump')
}

const handleCrouchPointerDown = (event: PointerEvent): void => {
  if (event.pointerType !== 'touch') {
    return
  }

  event.preventDefault()
  touchInput.press('crouch')
}

const handleCrouchPointerUp = (event: PointerEvent): void => {
  if (event.pointerType !== 'touch') {
    return
  }

  event.preventDefault()
  touchInput.release('crouch')
}

const handleCrouchPointerCancel = (event: PointerEvent): void => {
  if (event.pointerType !== 'touch') {
    return
  }

  event.preventDefault()
  touchInput.release('crouch')
}

jumpButton.addEventListener('pointerdown', handleJumpPointerDown)
jumpButton.addEventListener('pointerup', handleJumpPointerUp)
jumpButton.addEventListener('pointercancel', handleJumpPointerCancel)

crouchButton.addEventListener('pointerdown', handleCrouchPointerDown)
crouchButton.addEventListener('pointerup', handleCrouchPointerUp)
crouchButton.addEventListener('pointercancel', handleCrouchPointerCancel)

const gameApplication = new GameApplication(
  scheduler,
  mario,
  scenario,
  {
    isActive: (command) =>
      keyboardInput.isActive(command) || touchInput.isActive(command),
  },
  () => {},
  (gameTime) => {
    const currentMario = gameApplication.currentMario
    const currentScenario = gameApplication.currentScenario
    const currentState = gameApplication.state

    if (currentState !== previousGameState) {
      gameStatus.textContent =
        currentState === 'GAME_OVER'
          ? 'GAME OVER — PRESS RESTART'
          : currentState

      previousGameState = currentState
    }

    const animationTime =
      currentState === 'READY' || prefersReducedMotion
        ? 0
        : gameTime.elapsedTime

    const marioVariant = selectMarioVisualVariant(
      currentMario.lifeState,
      currentMario.powerState,
    )

    const marioVisual = createAnimatedMarioVisual(
      marioVariant,
      currentMario.movementState,
      animationTime,
      animationFrameDuration,
    )

    renderer.render(
      currentState,
      currentScenario,
      currentMario,
      marioVisual,
      gameApplication.currentObstacles,
      gameApplication.currentCoins,
      gameApplication.currentScore.value,
      gameApplication.currentLevel,
    )
  },
)
