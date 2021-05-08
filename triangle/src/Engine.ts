import { Vector, vec } from './math';
import { PanZoom } from './PanZoom';
import { CoordinatePlane } from './CoordinatePlane';
import { Geometry } from './Geometry';
import { FPSCounter } from './FPSCounter';

const MAX_FPS = Infinity;
const FPS_SAMPLES_MAX_COUNT = 16;

const BACKGROUND_COLOR = '#eeeeee';

// See https://stackoverflow.com/a/37474225/12005228
function getScrollLineHeight(): number {
  let iframe = document.createElement('iframe');
  document.body.appendChild(iframe);
  let iframeWindow = iframe.contentWindow!;
  let iframeDoc = iframeWindow.document;
  iframeDoc.open();
  iframeDoc.write('<!DOCTYPE html><html><head></head><body><span>a</span></body></html>');
  iframeDoc.close();
  let span = iframeDoc.body.firstElementChild! as HTMLSpanElement;
  let result = span.offsetHeight;
  document.body.removeChild(iframe);
  return result;
}
const SCROLL_LINE_HEIGHT = getScrollLineHeight();

export class Engine {
  public canvasSize!: Vector;
  public renderingContext: CanvasRenderingContext2D;

  public renderTime: number = performance.now();
  public prevRenderTime: number = this.renderTime;
  public averageFps = 0;
  private fpsSamples: number[] = new Array(FPS_SAMPLES_MAX_COUNT);
  private fpsSamplesCount = 0;
  private newestFpsSampleIndex = 0;

  public mousePosition: Vector = vec(0, 0);

  public panZoom: PanZoom;
  public coordinatePlane: CoordinatePlane;
  public geometry: Geometry;
  public fpsCounter: FPSCounter;

  public constructor(private canvas: HTMLCanvasElement) {
    this.adjustCanvasSize();
    window.addEventListener('resize', () => this.adjustCanvasSize());

    let ctx = this.canvas.getContext('2d');
    if (ctx == null) throw new Error("couldn't get a 2D rendering context");
    this.renderingContext = ctx;

    canvas.addEventListener('mousedown', (event) => {
      this.sendEvent('onMouseDown', this.translateMousePosition(event));
    });

    canvas.addEventListener('mousemove', (event) => {
      this.sendEvent('onMouseMove', this.translateMousePosition(event));
    });

    canvas.addEventListener('mouseup', (event) => {
      this.sendEvent('onMouseUp', this.translateMousePosition(event));
    });

    canvas.addEventListener('mouseenter', (event) => {
      this.sendEvent('onMouseEnter', this.translateMousePosition(event));
    });

    canvas.addEventListener('mouseleave', (event) => {
      this.sendEvent('onMouseLeave', this.translateMousePosition(event));
    });

    canvas.addEventListener('wheel', (event) => {
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
    this.fpsCounter = new FPSCounter(this);

    // eslint-disable-next-line @typescript-eslint/no-this-alias
    let this2 = this;
    requestAnimationFrame(function animFrameCallback(timestamp: number) {
      this2.onAnimationFrame(timestamp);
      requestAnimationFrame(animFrameCallback);
    });
  }

  private adjustCanvasSize(): void {
    let { clientWidth: width, clientHeight: height } = document.documentElement;
    this.canvas.width = width;
    this.canvas.height = height;
    this.canvasSize = vec(width, height);
  }

  private forEachObject(callback: (value: GameObject) => void): void {
    callback(this.panZoom);
    callback(this.coordinatePlane);
    callback(this.geometry);
    callback(this.fpsCounter);
  }

  private sendEvent<N extends keyof GameObject>(name: N, ...args: unknown[]): void {
    this.forEachObject((object) => {
      if (name in object) {
        (object[name] as (...args: unknown[]) => void)(...args);
      }
    });
  }

  private translateMousePosition(event: MouseEvent): Vector {
    // transform mouse position into graphics coordinates
    this.mousePosition = vec(event.clientX, event.clientY).subtract(
      this.canvasSize.clone().divide(2),
    );
    return this.mousePosition;
  }

  private onAnimationFrame(timestamp: number): void {
    let shouldRender = true;

    if (this.fpsSamplesCount > 0) {
      let fpsSamplesSum = 0;
      for (let i = 0; i < this.fpsSamplesCount; i++) {
        fpsSamplesSum += this.fpsSamples[i];
      }
      this.averageFps = fpsSamplesSum / this.fpsSamplesCount;

      if (this.averageFps > MAX_FPS) shouldRender = false;
    }

    this.renderTime = timestamp;

    let fpsDuringThisFrame = 0;
    if (shouldRender) {
      this.render();
      let deltaRenderTime = this.renderTime - this.prevRenderTime;
      if (deltaRenderTime > 0) fpsDuringThisFrame = 1000 / deltaRenderTime;
    }

    this.fpsSamples[this.newestFpsSampleIndex] = fpsDuringThisFrame;
    if (this.fpsSamplesCount < this.fpsSamples.length) {
      this.fpsSamplesCount++;
    }
    this.newestFpsSampleIndex++;
    if (this.newestFpsSampleIndex >= this.fpsSamples.length) {
      this.newestFpsSampleIndex = 0;
    }

    this.prevRenderTime = this.renderTime;
  }

  private render(): void {
    let ctx = this.renderingContext;
    let { width, height } = this.canvas;

    ctx.fillStyle = BACKGROUND_COLOR;
    ctx.fillRect(0, 0, width, height);

    ctx.save();
    ctx.translate(width / 2, height / 2);

    this.sendEvent('render');

    ctx.restore();
  }

  public setCursor(cursor: string): void {
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
