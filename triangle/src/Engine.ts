import { vec, Vector } from './math';
import { PanZoom } from './PanZoom';
import { CoordinatePlane } from './CoordinatePlane';
import { Geometry } from './Geometry';

// See https://stackoverflow.com/a/37474225/12005228
function getScrollLineHeight() {
  let iframe = document.createElement('iframe');
  document.body.appendChild(iframe);
  let iframeWindow = iframe.contentWindow!;
  let iframeDoc = iframeWindow.document;
  iframeDoc.open();
  iframeDoc.write(
    '<!DOCTYPE html><html><head></head><body><span>a</span></body></html>',
  );
  iframeDoc.close();
  let span = iframeDoc.body.firstElementChild! as HTMLSpanElement;
  let result = span.offsetHeight;
  document.body.removeChild(iframe);
  return result;
}
const SCROLL_LINE_HEIGHT = getScrollLineHeight();

export class Engine {
  canvasSize!: Vector;
  renderingContext: CanvasRenderingContext2D;
  mousePosition: Vector = vec(0, 0);

  panZoom: PanZoom;
  coordinatePlane: CoordinatePlane;
  geometry: Geometry;

  constructor(private canvas: HTMLCanvasElement) {
    this.adjustCanvasSize();
    window.addEventListener('resize', () => this.adjustCanvasSize());

    let ctx = this.canvas.getContext('2d');
    if (ctx == null) throw new Error("couldn't get a 2D rendering context");
    this.renderingContext = ctx;

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
      let delta = vec(event.deltaX, event.deltaY);
      switch (event.deltaMode) {
        case WheelEvent.DOM_DELTA_PIXEL:
          // do nothing, deltaX and deltaY are already in pixels
          break;
        case WheelEvent.DOM_DELTA_LINE:
          // convert deltaX and deltaY to pixels
          delta.multiply(SCROLL_LINE_HEIGHT);
          break;
        case WheelEvent.DOM_DELTA_PAGE:
          // simply ignore other events
          return;
      }

      this.sendEvent('onWheel', this.translateMousePosition(event), delta);
    });

    this.panZoom = new PanZoom(this);
    this.coordinatePlane = new CoordinatePlane(this);
    this.geometry = new Geometry(this);
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
    callback(this.geometry);
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
