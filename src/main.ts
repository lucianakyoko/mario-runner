import './style.css'

import { GameApplication } from './application/game/application'
import { AnimationFrameScheduler } from './infrastructure/timing/animation-frame-scheduler'
import { CanvasSurface } from './presentation/canvas/canvas-surface'
import { GameRenderer } from './presentation/canvas/game-renderer'

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

const gameApplication = new GameApplication(
  scheduler,
  () => {},
  () => {
    renderer.render(gameApplication.state)
  },
)

gameApplication.start()
