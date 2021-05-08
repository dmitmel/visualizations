import { Engine } from './Engine';
import './style.css';

declare global {
  // eslint-disable-next-line no-var
  var engine: Engine;
}

window.addEventListener('load', () => {
  let canvas = document.getElementById('canvas') as HTMLCanvasElement;
  let engine = new Engine(canvas);
  window.engine = engine;
});
