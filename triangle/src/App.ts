import { vec, Vector } from './math';

export class App {
  private canvas: HTMLCanvasElement;
  canvasSize: Vector;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;

    this.adjustCanvasSize();
    window.addEventListener('resize', () => this.adjustCanvasSize());
  }

  adjustCanvasSize() {
    this.canvas.width = document.documentElement.clientWidth;
    this.canvas.height = document.documentElement.clientHeight;
    this.canvasSize = vec(this.canvas.width, this.canvas.height);
  }
}
