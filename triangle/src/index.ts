import { Engine } from './Engine';
import './style.css';

const BACKGROUND_COLOR = '#eee';

window.addEventListener('load', () => {
  let canvas = document.getElementById('canvas') as HTMLCanvasElement;
  let engine = new Engine(canvas);
  let ctx = engine.renderingContext;

  let prevTime: number = null!;
  let prevFpsCalculationTime: number = null!;
  let fps: number = null!;
  const FPS_RENDER_INTERVAL = 100;

  function render(time: number) {
    if (
      prevTime != null &&
      time - prevFpsCalculationTime > FPS_RENDER_INTERVAL
    ) {
      fps = Math.floor(1000 / (time - prevTime));
      prevFpsCalculationTime = time;
    }

    ctx.fillStyle = BACKGROUND_COLOR;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (fps != null) {
      ctx.font = '18px sans';
      ctx.textAlign = 'end';
      ctx.textBaseline = 'top';
      ctx.fillStyle = '#000000';
      ctx.fillText(`${fps} FPS`, canvas.width - 10, 10);
    }

    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.scale(1, -1);

    engine.coordinatePlane.render();
    engine.geometry.render();

    ctx.restore();

    prevTime = time;

    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
});
