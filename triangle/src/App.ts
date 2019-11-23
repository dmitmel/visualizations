import { vec, Vector } from './math';
import { PanZoom } from './PanZoom';
import { CoordinatePlane } from './CoordinatePlane';

export class App {
  canvasSize: Vector;
  renderingContext: CanvasRenderingContext2D;

  panZoom: PanZoom;
  coordinatePlane: CoordinatePlane;

  constructor(private canvas: HTMLCanvasElement) {
    this.adjustCanvasSize();
    window.addEventListener('resize', () => this.adjustCanvasSize());

    this.renderingContext = this.canvas.getContext('2d');

    canvas.addEventListener('mousedown', event => {
      this.panZoom.onMouseDown(this.getMouseCoordinates(event));
    });

    canvas.addEventListener('mousemove', event => {
      this.panZoom.onMouseMove(this.getMouseCoordinates(event));
    });

    canvas.addEventListener('mouseup', event => {
      this.panZoom.onMouseUp(this.getMouseCoordinates(event));
    });

    canvas.addEventListener('mouseleave', event => {
      this.panZoom.onMouseLeave(this.getMouseCoordinates(event));
    });

    canvas.addEventListener('wheel', event => {
      this.panZoom.onWheel(
        this.getMouseCoordinates(event),
        vec(event.deltaX, event.deltaY),
      );
    });

    this.panZoom = new PanZoom(this);
    this.coordinatePlane = new CoordinatePlane(this);
  }

  adjustCanvasSize() {
    this.canvas.width = document.documentElement.clientWidth;
    this.canvas.height = document.documentElement.clientHeight;
    this.canvasSize = vec(this.canvas.width, this.canvas.height);
  }

  getMouseCoordinates(event: MouseEvent) {
    return vec(
      event.clientX,
      // transform mouse Y into graphics coordinates
      this.canvasSize.y - event.clientY,
    );
  }
}
