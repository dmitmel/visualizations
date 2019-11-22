import { Vector, lerp, vec } from './math';

const SCROLL_ZOOM_SENSITIVITY = 0.01;

export class PanZoom {
  translation: Vector = vec(0, 0);
  scale: number = 1;

  isPanning: boolean = false;
  translationBeforePan: Vector = this.translation;
  mouseBeforePan: Vector = vec(0, 0);

  canvas: HTMLCanvasElement;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
  }

  onMouseDown(pos: Vector) {
    this.isPanning = true;
    this.translationBeforePan = this.translation.clone();
    this.mouseBeforePan = pos.clone();
  }

  onMouseMove(pos: Vector) {
    if (!this.isPanning) return;
    this.translation = this.translationBeforePan
      .clone()
      .subtract(this.mouseBeforePan)
      .add(pos);
  }

  onMouseUp(pos: Vector) {
    this.onMouseMove(pos);
    this.isPanning = false;
  }

  onMouseLeave(pos: Vector) {
    this.onMouseUp(pos);
  }

  onWheel(mouse: Vector, delta: Vector) {
    let newScale = this.scale * (1 - delta.y * SCROLL_ZOOM_SENSITIVITY);
    let zoomFactor = newScale / this.scale;
    let canvasSize = vec(this.canvas.width, this.canvas.height);
    this.translation = mouse
      .clone()
      .subtract(canvasSize.divide(2))
      .lerp(this.translation, zoomFactor);
    this.scale = newScale;
  }
}
