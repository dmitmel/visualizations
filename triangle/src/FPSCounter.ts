import { Vector, vec, vec1 } from './math';
import { Engine, GameObject } from './Engine';

const FPS_CALCULATION_INTERVAL = 100;
const TEXT_MARGIN = vec1(10);

export class FPSCounter implements GameObject {
  prevFpsCalculationTime: number = 0;
  fps: number = 0;

  constructor(private engine: Engine) {}

  render() {
    let {
      renderingContext: ctx,
      canvasSize,
      prevRenderTime,
      renderTime,
    } = this.engine;

    let deltaRenderTime = renderTime - prevRenderTime;
    if (
      deltaRenderTime > 0 &&
      renderTime - this.prevFpsCalculationTime > FPS_CALCULATION_INTERVAL
    ) {
      this.fps = Math.floor(1000 / deltaRenderTime);
      this.prevFpsCalculationTime = renderTime;
    }

    ctx.font = '18px sans';
    ctx.textAlign = 'end';
    ctx.textBaseline = 'top';
    ctx.fillStyle = '#000000';
    ctx.fillText(
      `${this.fps} FPS`,
      canvasSize.x / 2 - TEXT_MARGIN.x,
      TEXT_MARGIN.y - canvasSize.y / 2,
    );
  }
}
