import './style.css'

import { GameApplication } from './application/game/application'
import { defaultGameplayConfig } from './domain/config/default-gameplay-config'
import { createInitialMario } from './domain/mario/mario'
import { KeyboardInput } from './infrastructure/input/keyboard-input'
import { AnimationFrameScheduler } from './infrastructure/timing/animation-frame-scheduler'
import { CanvasSurface } from './presentation/canvas/canvas-surface'
import { GameRenderer } from './presentation/canvas/game-renderer'
import { createAnimatedMarioVisual } from './presentation/mario/mario-visual'
import { createInitialScenario } from './domain/scenario/scenario'

const app = document.querySelector<HTMLDivElement>('#app')

if (!app) {
  throw new Error('Application root element not found.')
}

app.innerHTML = `
  <main>
    <section aria-label="Game">
      <canvas
        id="game-canvas"
        width="800"
        height="300"
        aria-label="Mario Runner"
      ></canvas>
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

const surface = new CanvasSurface(canvas)
const renderer = new GameRenderer(surface)
const scheduler = new AnimationFrameScheduler()
const input = new KeyboardInput(window)

input.register()

const mario = createInitialMario({
  width: 32,
  height: 48,
  initialX: 0,
  groundY: defaultGameplayConfig.physics.groundY,
  initialSpeed: defaultGameplayConfig.movement.initialSpeed,
})

const scenario = createInitialScenario({
  id: 'default',
  backgroundId: defaultGameplayConfig.scenario.background.id,
  groundY: defaultGameplayConfig.physics.groundY,
})

const animationFrameDuration =
  defaultGameplayConfig.animation.defaultFrameDuration / 1000

const gameApplication = new GameApplication(
  scheduler,
  mario,
  scenario,
  input,
  () => {},
  (gameTime) => {
    const currentMario = gameApplication.currentMario
    const animationTime =
      gameApplication.state === 'READY' ? 0 : gameTime.elapsedTime

    const marioVisual = createAnimatedMarioVisual(
      'SMALL',
      currentMario.movementState,
      animationTime,
      animationFrameDuration,
    )

    renderer.render(gameApplication.state, currentMario, marioVisual)
  },
)
