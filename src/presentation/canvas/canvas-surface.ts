export class CanvasSurface {
  readonly element: HTMLCanvasElement
  readonly context: CanvasRenderingContext2D

  constructor(canvas: HTMLCanvasElement) {
    const context = canvas.getContext('2d')
    if (!context) {
      throw new Error('Unable to create 2D canvas context.')
    }

    context.imageSmoothingEnabled = false

    this.element = canvas
    this.context = context
  }
}
