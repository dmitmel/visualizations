import { Vector, vec, vec1 } from './math';
import { Engine, GameObject } from './Engine';

const TEXT_MARGIN = vec1(10);
const UPDATE_INTERVAL = 100;

export class FPSCounter implements GameObject {
  prevUpdateTime: number = this.engine.renderTime;
  fps: number = 0;

  constructor(private engine: Engine) {}

  render() {
    let {
      renderingContext: ctx,
      canvasSize,
      renderTime,
      averageFps,
    } = this.engine;

    if (renderTime - this.prevUpdateTime > UPDATE_INTERVAL) {
      this.fps = averageFps;
      this.prevUpdateTime = renderTime;
    }

    ctx.font = '18px sans';
    ctx.textAlign = 'end';
    ctx.textBaseline = 'top';
    ctx.fillStyle = '#000000';
    ctx.fillText(
      `${this.fps.toFixed(2)} FPS`,
      canvasSize.x / 2 - TEXT_MARGIN.x,
      TEXT_MARGIN.y - canvasSize.y / 2,
    );
  }
}
