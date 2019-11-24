import { Engine } from './Engine';
import { Line, Vector, vec } from './math';
import './style.css';

const BACKGROUND_COLOR = '#eee';
const POINT_RADIUS = 4;
const POINT_COLOR = '#666';
const LINE_WIDTH = 2;
const LINE_COLOR = '#888';

window.addEventListener('load', () => {
  let canvas = document.getElementById('canvas') as HTMLCanvasElement;
  let engine = new Engine(canvas);
  let ctx = canvas.getContext('2d');

  let { PI } = Math;
  let TWO_PI = PI * 2;

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
      let firstVertex = this.vertices[0];
      ctx.moveTo(firstVertex.x, firstVertex.y);
      for (let i = 1; i < this.vertices.length; i++) {
        let vertex = this.vertices[i];
        ctx.lineTo(vertex.x, vertex.y);
      }
      ctx.closePath();
      ctx.lineWidth = LINE_WIDTH;
      ctx.strokeStyle = LINE_COLOR;
      ctx.stroke();

      for (let i = 0; i < this.vertices.length; i++) {
        let vertex = this.vertices[i];
        ctx.beginPath();
        ctx.arc(vertex.x, vertex.y, POINT_RADIUS, 0, TWO_PI);
        ctx.fillStyle = POINT_COLOR;
        ctx.fill();
      }
    }
  }

  let outerShape = Polygon.regular(vec(0, 0), 250, 3);
  let outerVertices = outerShape.vertices;

  let innerVertices = [];
  for (let i = 0; i < outerVertices.length; i++) {
    let vertex = outerVertices[i].clone();
    let nextVertex = outerVertices[i + 1 < outerVertices.length ? i + 1 : 0];
    const k = 1 / 4;
    innerVertices.push(vertex.lerp(nextVertex, k));
  }
  let innerShape = new Polygon(innerVertices);

  let currentPoint = outerVertices[0].clone().lerp(outerVertices[1], 1 / 2);
  let currentEdgeIndex = 0;

  let drawnLines: Line[] = [];

  (window as any).nextPoint = function nextPoint() {
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

    let intersection = currentOuterEdge.intersection(ray);
    drawnLines.push(new Line(currentPoint, intersection));

    currentPoint = intersection;
    currentEdgeIndex++;
    if (currentEdgeIndex >= innerShape.edges.length) currentEdgeIndex = 0;
  };

  let prevTime: number = null;
  let prevFpsCalculationTime: number = null;
  let fps: number = null;
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
      ctx.font = '24px monospace';
      ctx.textAlign = 'end';
      ctx.textBaseline = 'top';
      ctx.fillStyle = '#000000';
      ctx.fillText(`${fps} FPS`, canvas.width - 10, 10);
    }

    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.scale(1, -1);

    ctx.save();
    ctx.translate(engine.panZoom.translation.x, engine.panZoom.translation.y);
    ctx.scale(engine.panZoom.scale, engine.panZoom.scale);

    outerShape.render();
    innerShape.render();
    drawnLines.forEach(line => {
      ctx.beginPath();
      ctx.moveTo(line.a.x, line.a.y);
      ctx.lineTo(line.b.x, line.b.y);
      ctx.lineWidth = LINE_WIDTH;
      ctx.strokeStyle = LINE_COLOR;
      ctx.stroke();
    });
    ctx.beginPath();
    ctx.arc(currentPoint.x, currentPoint.y, POINT_RADIUS, 0, TWO_PI);
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

    ctx.restore();

    engine.coordinatePlane.render();

    ctx.restore();

    prevTime = time;
    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
});
