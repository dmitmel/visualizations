import { Engine } from './Engine';
import './style.css';

window.addEventListener('load', () => {
  let canvas = document.getElementById('canvas') as HTMLCanvasElement;
  let engine = new Engine(canvas);
  (window as any).engine = engine;
});
