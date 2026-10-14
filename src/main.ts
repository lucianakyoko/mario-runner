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

      <div class="touch-controls" aria-label="Controles de toque">
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

  <section class="audio-controls" aria-label="Controles de áudio">
    <label for="audio-volume">Volume</label>

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

  <section class="game-information" aria-label="Informações do jogo">
    <div
      id="connection-status"
      class="connection-status"
      role="status"
      aria-live="polite"
      hidden
    >
      <p class="offline-message">
        Ops! Parece que você está sem internet.
      </p>
      <p>Pressione Espaço ou ↑ para jogar.</p>
    </div>

    <footer class="game-footer">
      <p class="developer-credit">
        Desenvolvido com <span class="heart" aria-label="amor">♥</span> por
        <a
          href="https://lucianakyoko.vercel.app/"
          target="_blank"
          rel="noopener noreferrer"
        >Luciana Kyoko</a>
      </p>

      <nav class="social-links" aria-label="Redes sociais e código">
        <a
          href="https://github.com/lucianakyoko/mario-runner"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="GitHub do Mario Runner"
          title="GitHub"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            width="24"
            height="24"
            fill="currentColor"
          >
            <path d="M12 .9a11.1 11.1 0 0 0-3.51 21.63c.56.1.76-.24.76-.54v-2.08c-3.1.67-3.76-1.31-3.76-1.31-.5-1.28-1.24-1.62-1.24-1.62-1.01-.69.08-.68.08-.68 1.12.08 1.71 1.15 1.71 1.15 1 .1.75 2.04 3.3 1.56.1-.71.39-1.2.7-1.48-2.48-.28-5.09-1.24-5.09-5.52 0-1.22.44-2.22 1.15-3-.12-.28-.5-1.43.11-2.98 0 0 .94-.3 3.05 1.15a10.6 10.6 0 0 1 5.55 0c2.11-1.44 3.05-1.15 3.05-1.15.61 1.55.23 2.7.11 2.98.72.78 1.15 1.78 1.15 3 0 4.29-2.61 5.24-5.1 5.51.4.35.75 1.02.75 2.06v3.05c0 .3.2.65.77.54A11.1 11.1 0 0 0 12 .9Z" />
          </svg>
        </a>

        <a
          href="https://www.linkedin.com/in/lucianakyoko"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="LinkedIn de Luciana Kyoko"
          title="LinkedIn"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            width="24"
            height="24"
            fill="currentColor"
          >
            <path d="M20.45 2H3.55C2.69 2 2 2.68 2 3.52v16.96c0 .84.69 1.52 1.55 1.52h16.9c.86 0 1.55-.68 1.55-1.52V3.52c0-.84-.69-1.52-1.55-1.52ZM7.93 18.5H4.96V9h2.97v9.5ZM6.45 7.7a1.72 1.72 0 1 1 .02-3.44 1.72 1.72 0 0 1-.02 3.44ZM19.04 18.5h-2.97v-4.62c0-1.1-.02-2.52-1.54-2.52-1.54 0-1.78 1.2-1.78 2.44v4.7H9.78V9h2.85v1.3h.04c.4-.75 1.37-1.54 2.82-1.54 3.02 0 3.58 1.99 3.58 4.58v5.16Z" />
          </svg>
        </a>
      </nav>
    </footer>
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

const connectionStatus =
  document.querySelector<HTMLDivElement>('#connection-status')

if (!connectionStatus) {
  throw new Error('Connection status element not found.')
}

const updateConnectionStatus = (): void => {
  connectionStatus.hidden = navigator.onLine
}

window.addEventListener('online', updateConnectionStatus)
window.addEventListener('offline', updateConnectionStatus)

updateConnectionStatus()

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
