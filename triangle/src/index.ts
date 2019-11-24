import { Engine } from './Engine';
import { Line, Vector, vec } from './math';
import { PIXELS_PER_UNIT } from './CoordinatePlane';
import './style.css';

const BACKGROUND_COLOR = '#eee';
const POINT_RADIUS = 4;
const POINT_COLOR = '#666';
const LINE_WIDTH = 2;
const LINE_COLOR = '#888';

window.addEventListener('load', () => {
  let canvas = document.getElementById('canvas') as HTMLCanvasElement;
  let engine = new Engine(canvas);
  let ctx = engine.renderingContext;

  let controls = document.getElementById('controls') as HTMLFormElement;
  function getControl<T extends HTMLElement>(name: string): T {
    return controls.elements.namedItem(name) as T;
  }
  let iterationsInput: HTMLInputElement = getControl('iterations');
  let startButton: HTMLButtonElement = getControl('start');
  let resetButton: HTMLButtonElement = getControl('reset');
  startButton.addEventListener('click', event => {
    event.preventDefault();
    let iterations = iterationsInput.valueAsNumber;
    reset();
    for (let i = 0; i < iterations; i++) nextPoint();
  });
  resetButton.addEventListener('click', _event => {
    reset();
  });

  let { PI } = Math;
  let TWO_PI = PI * 2;

  function transformPoint(point: Vector) {
    return point
      .clone()
      .multiply(engine.panZoom.scale)
      .multiply(PIXELS_PER_UNIT)
      .add(engine.panZoom.translation);
  }

  class Polygon {
    readonly vertices: Vector[];
    readonly edges: Line[];

    constructor(vertices: Vector[]) {
      this.vertices = vertices;
      this.edges = [];
      for (let i = 0; i < vertices.length; i++) {
        let vertex = vertices[i];
        let nextVertex = vertices[i + 1 < vertices.length ? i + 1 : 0];
        this.edges.push(new Line(vertex, nextVertex));
      }
    }

    static regular(center: Vector, radius: number, vertexCount: number) {
      let vertices = [];
      for (let i = 0; i < vertexCount; i++) {
        vertices.push(
          vec(
            center.x + Math.cos((i / vertexCount) * TWO_PI) * radius,
            center.y + Math.sin((i / vertexCount) * TWO_PI) * radius,
          ),
        );
      }
      return new Polygon(vertices);
    }

    render() {
      ctx.beginPath();
      let firstVertex = transformPoint(this.vertices[0]);
      ctx.moveTo(firstVertex.x, firstVertex.y);
      for (let i = 1; i < this.vertices.length; i++) {
        let vertex = transformPoint(this.vertices[i]);
        ctx.lineTo(vertex.x, vertex.y);
      }
      ctx.closePath();
      ctx.lineWidth = LINE_WIDTH;
      ctx.strokeStyle = LINE_COLOR;
      ctx.stroke();

      for (let i = 0; i < this.vertices.length; i++) {
        let vertex = transformPoint(this.vertices[i]);
        ctx.beginPath();
        ctx.arc(vertex.x, vertex.y, POINT_RADIUS, 0, TWO_PI);
        ctx.fillStyle = POINT_COLOR;
        ctx.fill();
      }
    }
  }

  let outerShape = Polygon.regular(vec(0, 0), 2.5, 3);
  let outerVertices = outerShape.vertices;

  let innerVertices = [];
  for (let i = 0; i < outerVertices.length; i++) {
    let vertex = outerVertices[i].clone();
    let nextVertex = outerVertices[i + 1 < outerVertices.length ? i + 1 : 0];
    const k = 1 / 4;
    innerVertices.push(vertex.lerp(nextVertex, k));
  }
  let innerShape = new Polygon(innerVertices);

  let startPoint = outerVertices[0].clone().lerp(outerVertices[1], 1 / 2);
  let currentPoint = startPoint;
  let currentEdgeIndex = 0;

  let drawnLines: Line[] = [];

  function reset() {
    currentPoint = startPoint;
    currentEdgeIndex = 0;
    drawnLines = [];
  }

  function nextPoint() {
    let currentInnerEdge = innerShape.edges[currentEdgeIndex];
    let currentOuterEdge =
      outerShape.edges[
        currentEdgeIndex + 1 < outerShape.edges.length
          ? currentEdgeIndex + 1
          : 0
      ];
    let ray = new Line(
      currentPoint,
      currentPoint
        .clone()
        .add(currentInnerEdge.b)
        .subtract(currentInnerEdge.a),
    );

    let intersection = currentOuterEdge.intersection(ray)!;
    drawnLines.push(new Line(currentPoint, intersection));

    currentPoint = intersection;
    currentEdgeIndex++;
    if (currentEdgeIndex >= innerShape.edges.length) currentEdgeIndex = 0;
  }

  let prevTime: number = null!;
  let prevFpsCalculationTime: number = null!;
  let fps: number = null!;
  const FPS_RENDER_INTERVAL = 100;

  function render(time: number) {
    ctx.fillStyle = BACKGROUND_COLOR;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (
      prevTime != null &&
      time - prevFpsCalculationTime > FPS_RENDER_INTERVAL
    ) {
      fps = Math.floor(1000 / (time - prevTime));
      prevFpsCalculationTime = time;
    }

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

    outerShape.render();
    innerShape.render();
    drawnLines.forEach(line => {
      ctx.beginPath();
      let a = transformPoint(line.a);
      ctx.moveTo(a.x, a.y);
      let b = transformPoint(line.b);
      ctx.lineTo(b.x, b.y);
      ctx.lineWidth = LINE_WIDTH;
      ctx.strokeStyle = LINE_COLOR;
      ctx.stroke();
    });
    ctx.beginPath();
    let currentPoint2 = transformPoint(currentPoint);
    ctx.arc(currentPoint2.x, currentPoint2.y, POINT_RADIUS, 0, TWO_PI);
    ctx.fillStyle = '#f55';
    ctx.fill();

    let currentInnerEdge = innerShape.edges[currentEdgeIndex];
    let currentOuterEdge =
      outerShape.edges[
        currentEdgeIndex + 1 < outerShape.edges.length
          ? currentEdgeIndex + 1
          : 0
      ];
    let ray = new Line(
      currentPoint,
      currentPoint
        .clone()
        .add(currentInnerEdge.b)
        .subtract(currentInnerEdge.a),
    );

    engine.coordinatePlane.render();

    ctx.restore();

    prevTime = time;
    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
});
