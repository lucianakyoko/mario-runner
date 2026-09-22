import type {
  FrameCallback,
  FrameScheduler,
} from '../../application/game-loop/frame-scheduler'

export class AnimationFrameScheduler implements FrameScheduler {
  request(callback: FrameCallback): number {
    return requestAnimationFrame(callback)
  }

  cancel(requestId: number): void {
    cancelAnimationFrame(requestId)
  }
}
