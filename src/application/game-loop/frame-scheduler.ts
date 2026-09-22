export type FrameCallback = (timestamp: number) => void

export interface FrameScheduler {
  request(callback: FrameCallback): number
  cancel(requestId: number): void
}
