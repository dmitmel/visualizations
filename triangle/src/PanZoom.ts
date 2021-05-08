import { Vector, clamp, vec } from './math';
import { Engine, GameObject } from './Engine';

const SCROLL_ZOOM_SENSITIVITY = 0.005;
// must be less than 1
const MAX_ZOOM_CHANGE_PER_EVENT = 0.5;

export class PanZoom implements GameObject {
  public translation: Vector = vec(0, 0);
  public scale = 1;

  public isPanning = false;
  public translationBeforePan: Vector = this.translation;
  public mouseBeforePan: Vector = vec(0, 0);

  public constructor(private engine: Engine) {}

  public onMouseDown(pos: Vector): void {
    this.isPanning = true;
    this.translationBeforePan = this.translation.clone();
    this.mouseBeforePan = pos.clone();
    this.engine.setCursor('move');
  }

  public onMouseMove(pos: Vector): void {
    if (!this.isPanning) return;
    this.translation = this.translationBeforePan.clone().subtract(this.mouseBeforePan).add(pos);
  }

  public onMouseUp(pos: Vector): void {
    this.onMouseMove(pos);
    this.isPanning = false;
    this.engine.setCursor('');
  }

  public onMouseLeave(pos: Vector): void {
    this.onMouseUp(pos);
  }

  public onWheel(mouse: Vector, delta: Vector): void {
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
