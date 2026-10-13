import './style.css'

import type { AudioService } from './application/audio/audio-service'
import { GameApplication } from './application/game/application'
import { effectTypes } from './domain/audio/effect-type'
import { musicTypes } from './domain/audio/music-type'
import { defaultGameplayConfig } from './domain/config/default-gameplay-config'
import { createInitialMario } from './domain/mario/mario'
import { createInitialScenario } from './domain/scenario/scenario'
import { BrowserAudioService } from './infrastructure/audio/browser-audio-service'
import { KeyboardInput } from './infrastructure/input/keyboard-input'
import { TouchInput } from './infrastructure/input/touch-input'
import { AnimationFrameScheduler } from './infrastructure/timing/animation-frame-scheduler'
import { CanvasSurface } from './presentation/canvas/canvas-surface'
import { GameRenderer } from './presentation/canvas/game-renderer'
import { createAnimatedMarioVisual } from './presentation/mario/mario-visual'
import { selectMarioVisualVariant } from './presentation/mario/select-mario-visual-variant'

const registerServiceWorker = (): void => {
  if (!('serviceWorker' in navigator)) {
    return
  }

  void navigator.serviceWorker.register('/sw.js').catch(() => {
    // Falha no Service Worker não deve impedir o jogo de funcionar.
  })
}

registerServiceWorker()

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
            aria-pressed="false"
          >
            Pular
          </button>

          <button
            id="touch-crouch"
            class="touch-control"
            type="button"
            aria-label="Abaixar"
            aria-pressed="false"
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

    <section
      <section
        class="audio-controls"
        aria-label="Controles de áudio"
      >
        <label for="audio-volume">
          Volume
        </label>

        <input
          id="audio-volume"
          type="range"
          min="0"
          max="100"
          value="100"
          step="1"
          aria-label="Volume do áudio"
          aria-valuemin="0"
          aria-valuemax="100"
          aria-valuenow="100"
          aria-valuetext="100 por cento"
        />

        <button
          id="audio-mute"
          type="button"
          aria-label="Silenciar áudio"
          aria-pressed="false"
        >
          Silenciar
        </button>
      </section>
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

const volumeControl = document.querySelector<HTMLInputElement>('#audio-volume')

if (!volumeControl) {
  throw new Error('Audio volume control not found.')
}

const muteButton = document.querySelector<HTMLButtonElement>('#audio-mute')

if (!muteButton) {
  throw new Error('Mute button not found.')
}

const surface = new CanvasSurface(canvas)
const renderer = new GameRenderer(surface)
const scheduler = new AnimationFrameScheduler()
const keyboardInput = new KeyboardInput(window)
const touchInput = new TouchInput(jumpButton)

const audioService: AudioService = new BrowserAudioService({
  resolveMusicSource: (music) => `/audio/music/${music}.oga`,
  resolveEffectSource: (effect) => `/audio/effects/${effect}.wav`,
})

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
  music: musicTypes.DEFAULT,
})

const animationFrameDuration =
  defaultGameplayConfig.animation.defaultFrameDuration / 1000

const prefersReducedMotion = window.matchMedia(
  '(prefers-reduced-motion: reduce)',
).matches

let previousGameState: string | undefined
let isMuted = false

const handleVolumeChange = (): void => {
  const volumePercentage = Number(volumeControl.value)
  const volume = volumePercentage / 100

  audioService.setVolume(volume)

  volumeControl.setAttribute('aria-valuenow', String(volumePercentage))
  volumeControl.setAttribute('aria-valuetext', `${volumePercentage} por cento`)
}

const handleMuteClick = (): void => {
  isMuted = !isMuted

  audioService.setMuted(isMuted)

  muteButton.textContent = isMuted ? 'Ativar som' : 'Silenciar'
  muteButton.setAttribute(
    'aria-label',
    isMuted ? 'Ativar som' : 'Silenciar áudio',
  )
  muteButton.setAttribute('aria-pressed', String(isMuted))
}

volumeControl.addEventListener('input', handleVolumeChange)
muteButton.addEventListener('click', handleMuteClick)

const handleJumpPointerDown = (event: PointerEvent): void => {
  if (event.pointerType !== 'touch') {
    return
  }

  event.preventDefault()
  jumpButton.setAttribute('aria-pressed', 'true')
  touchInput.press('jump')
}

const handleJumpPointerUp = (event: PointerEvent): void => {
  if (event.pointerType !== 'touch') {
    return
  }

  event.preventDefault()
  jumpButton.setAttribute('aria-pressed', 'false')
  touchInput.release('jump')
}

const handleJumpPointerCancel = (event: PointerEvent): void => {
  if (event.pointerType !== 'touch') {
    return
  }

  event.preventDefault()
  jumpButton.setAttribute('aria-pressed', 'false')
  touchInput.release('jump')
}

const handleJumpClick = (): void => {
  audioService.playMusic(scenario.music)
}

const handleCrouchPointerDown = (event: PointerEvent): void => {
  if (event.pointerType !== 'touch') {
    return
  }

  event.preventDefault()
  crouchButton.setAttribute('aria-pressed', 'true')
  touchInput.press('crouch')
}

const handleCrouchPointerUp = (event: PointerEvent): void => {
  if (event.pointerType !== 'touch') {
    return
  }

  event.preventDefault()
  crouchButton.setAttribute('aria-pressed', 'false')
  touchInput.release('crouch')
}

const handleCrouchPointerCancel = (event: PointerEvent): void => {
  if (event.pointerType !== 'touch') {
    return
  }

  event.preventDefault()
  crouchButton.setAttribute('aria-pressed', 'false')
  touchInput.release('crouch')
}

jumpButton.addEventListener('pointerdown', handleJumpPointerDown)
jumpButton.addEventListener('pointerup', handleJumpPointerUp)
jumpButton.addEventListener('pointercancel', handleJumpPointerCancel)
jumpButton.addEventListener('click', handleJumpClick)

crouchButton.addEventListener('pointerdown', handleCrouchPointerDown)
crouchButton.addEventListener('pointerup', handleCrouchPointerUp)
crouchButton.addEventListener('pointercancel', handleCrouchPointerCancel)

const handleKeyboardInteraction = (): void => {
  if (keyboardInput.isActive('jump')) {
    audioService.playMusic(scenario.music)
  }
}

window.addEventListener('keydown', handleKeyboardInteraction)

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

      if (currentState === 'GAME_OVER') {
        audioService.stopMusic()
      }

      if (currentState === 'READY' && previousGameState === 'GAME_OVER') {
        audioService.stopEffects()
      }

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
      gameApplication.currentPowerUps,
      gameApplication.currentScore.value,
      gameApplication.currentLevel,
      animationTime,
    )
  },
  [],
  [],
  [],
  (event) => {
    if (event === 'JUMP') {
      audioService.playEffect(effectTypes.JUMP)
    }

    if (event === 'COIN') {
      audioService.playEffect(effectTypes.COIN)
    }

    if (event === 'MEDAL') {
      audioService.playEffect(effectTypes.MEDAL)
    }

    if (event === 'POWER_UP') {
      audioService.playEffect(effectTypes.POWER_UP)
    }

    if (event === 'LOSE_POWER') {
      audioService.playEffect(effectTypes.LOSE_POWER)
    }

    if (event === 'DEATH') {
      audioService.playEffect(effectTypes.DEATH)
    }

    if (event === 'CANNON_FIRE') {
      audioService.playEffect(effectTypes.CANNON_FIRE)
    }
  },
)
