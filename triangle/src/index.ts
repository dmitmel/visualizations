import { Engine } from './Engine';
import './style.css';

const BACKGROUND_COLOR = '#eee';

window.addEventListener('load', () => {
  let canvas = document.getElementById('canvas') as HTMLCanvasElement;
  let engine = new Engine(canvas);
  (window as any).engine = engine;
  let ctx = engine.renderingContext;

  function render(time: number) {
    engine.renderTime = time;

    ctx.fillStyle = BACKGROUND_COLOR;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);

    engine.render();

    ctx.restore();

    engine.prevRenderTime = engine.renderTime;
    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
});
