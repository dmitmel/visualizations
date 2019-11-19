import { Line, Vector, vec } from './math';
import './style.css';

const BACKGROUND_COLOR = '#222';
const POINT_RADIUS = 4;
const POINT_COLOR = '#eee';
const LINE_WIDTH = 2;
const LINE_COLOR = '#888';

window.addEventListener('load', () => {
  let canvas = document.getElementById('canvas') as HTMLCanvasElement;
  let ctx = canvas.getContext('2d');

  function adjustCanvasSize() {
    canvas.width = document.documentElement.clientWidth;
    canvas.height = document.documentElement.clientHeight;
  }
  adjustCanvasSize();
  window.addEventListener('resize', adjustCanvasSize);

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
    let vertex = outerVertices[i];
    let nextVertex = outerVertices[i + 1 < outerVertices.length ? i + 1 : 0];
    const k = 1 / 4;
    innerVertices.push(vertex.lerp(nextVertex, k));
  }
  let innerShape = new Polygon(innerVertices);

  let currentPoint = outerVertices[0].lerp(outerVertices[1], 1 / 2);
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
      vec(
        currentPoint.x + (currentInnerEdge.b.x - currentInnerEdge.a.x),
        currentPoint.y + (currentInnerEdge.b.y - currentInnerEdge.a.y),
      ),
    );

    let intersection = currentOuterEdge.intersection(ray);
    drawnLines.push(new Line(currentPoint, intersection));

    currentPoint = intersection;
    currentEdgeIndex++;
    if (currentEdgeIndex >= innerShape.edges.length) currentEdgeIndex = 0;
  };

  function render(time: number) {
    ctx.fillStyle = BACKGROUND_COLOR;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // ctx.font = '48px monospace';
    // ctx.textAlign = 'end';
    // ctx.textBaseline = 'top';
    // ctx.fillStyle = '#fff';
    // ctx.fillText((time / 1000).toFixed(3), canvas.width - 10, 10);

    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);

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
      vec(
        currentPoint.x + (currentInnerEdge.b.x - currentInnerEdge.a.x),
        currentPoint.y + (currentInnerEdge.b.y - currentInnerEdge.a.y),
      ),
    );

    ctx.restore();

    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
});
