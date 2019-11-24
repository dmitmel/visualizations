import { vec, Vector } from './math';
import { PanZoom } from './PanZoom';
import { CoordinatePlane } from './CoordinatePlane';

export class Engine {
  canvasSize: Vector;
  renderingContext: CanvasRenderingContext2D;
  mousePosition: Vector = vec(0, 0);

  panZoom: PanZoom;
  coordinatePlane: CoordinatePlane;

  constructor(private canvas: HTMLCanvasElement) {
    this.adjustCanvasSize();
    window.addEventListener('resize', () => this.adjustCanvasSize());

    this.renderingContext = this.canvas.getContext('2d');

    canvas.addEventListener('mousedown', event => {
      this.sendEvent('onMouseDown', this.translateMousePosition(event));
    });

    canvas.addEventListener('mousemove', event => {
      this.sendEvent('onMouseMove', this.translateMousePosition(event));
    });

    canvas.addEventListener('mouseup', event => {
      this.sendEvent('onMouseUp', this.translateMousePosition(event));
    });

    canvas.addEventListener('mouseenter', event => {
      this.sendEvent('onMouseEnter', this.translateMousePosition(event));
    });

    canvas.addEventListener('mouseleave', event => {
      this.sendEvent('onMouseLeave', this.translateMousePosition(event));
    });

    canvas.addEventListener('wheel', event => {
      this.sendEvent(
        'onWheel',
        this.translateMousePosition(event),
        vec(event.deltaX, event.deltaY),
      );
    });

    this.panZoom = new PanZoom(this);
    this.coordinatePlane = new CoordinatePlane(this);
  }

  private adjustCanvasSize() {
    let { clientWidth: width, clientHeight: height } = document.documentElement;
    this.canvas.width = width;
    this.canvas.height = height;
    this.canvasSize = vec(width, height);
  }

  private forEachObject(callback: (value: GameObject) => void) {
    callback(this.panZoom);
    callback(this.coordinatePlane);
  }

  private sendEvent<N extends keyof GameObject>(name: N, ...args: any) {
    this.forEachObject(object => {
      if (name in object) {
        (object[name] as (...args: any) => any)(...args);
      }
    });
  }

  private translateMousePosition(event: MouseEvent): Vector {
    // transform mouse position into graphics coordinates
    this.mousePosition = vec(
      event.clientX,
      this.canvasSize.y - event.clientY,
    ).subtract(this.canvasSize.clone().divide(2));
    return this.mousePosition;
  }

  setCursor(cursor: string) {
    this.canvas.style.cursor = cursor;
  }
}

export interface GameObject {
  render?(): void;
  onMouseDown?(pos: Vector): void;
  onMouseMove?(pos: Vector): void;
  onMouseUp?(pos: Vector): void;
  onMouseEnter?(pos: Vector): void;
  onMouseLeave?(pos: Vector): void;
  onWheel?(mouse: Vector, delta: Vector): void;
}
