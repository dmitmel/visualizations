import { Vector, vec, clamp } from './math';
import { Engine, GameObject } from './Engine';

const SCROLL_ZOOM_SENSITIVITY = 0.005;
// must be less than 1
const MAX_ZOOM_CHANGE_PER_EVENT = 0.5;

export class PanZoom implements GameObject {
  translation: Vector = vec(0, 0);
  scale: number = 1;

  isPanning: boolean = false;
  translationBeforePan: Vector = this.translation;
  mouseBeforePan: Vector = vec(0, 0);

  constructor(private engine: Engine) {}

  onMouseDown(pos: Vector) {
    this.isPanning = true;
    this.translationBeforePan = this.translation.clone();
    this.mouseBeforePan = pos.clone();
    this.engine.setCursor('move');
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
    this.engine.setCursor('');
  }

  onMouseLeave(pos: Vector) {
    this.onMouseUp(pos);
  }

  onWheel(mouse: Vector, delta: Vector) {
    let newScale =
      this.scale *
      (1 -
        clamp(
          delta.y * SCROLL_ZOOM_SENSITIVITY,
          -MAX_ZOOM_CHANGE_PER_EVENT,
          MAX_ZOOM_CHANGE_PER_EVENT,
        ));
    let zoomFactor = newScale / this.scale;
    this.translation = mouse.clone().lerp(this.translation, zoomFactor);
    this.scale = newScale;
  }
}
