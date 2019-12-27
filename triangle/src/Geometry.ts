import { Vector, Line, vec } from './math';
import { Engine, GameObject } from './Engine';

const POINT_RADIUS = 4;
const POINT_COLOR = '#666';
const LINE_WIDTH = 2;
const LINE_COLOR = '#888';

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
          center.x + Math.cos((i / vertexCount) * 2 * Math.PI) * radius,
          center.y + Math.sin((i / vertexCount) * 2 * Math.PI) * radius,
        ),
      );
    }
    return new Polygon(vertices);
  }
}

export class Geometry implements GameObject {
  outerShape: Polygon = Polygon.regular(vec(0, 0), 2.5, 3);
  innerShape: Polygon;
  startPoint: Vector;
  currentPoint: Vector;
  currentEdgeIndex: number = 0;
  drawnLines: Line[] = [];

  constructor(private engine: Engine) {
    let outerVertices = this.outerShape.vertices;

    let innerVertices = [];
    for (let i = 0; i < outerVertices.length; i++) {
      let vertex = outerVertices[i].clone();
      let nextVertex = outerVertices[(i + 1) % outerVertices.length];
      const k = 1 / 4;
      innerVertices.push(vertex.lerp(nextVertex, k));
    }
    this.innerShape = new Polygon(innerVertices);

    this.startPoint = outerVertices[0].clone().lerp(outerVertices[1], 1 / 2);
    this.currentPoint = this.startPoint;

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
      this.reset();
      for (let i = 0; i < iterations; i++) this.nextPoint();
    });
    resetButton.addEventListener('click', _event => {
      this.reset();
    });
  }

  private reset() {
    this.currentPoint = this.startPoint;
    this.currentEdgeIndex = 0;
    this.drawnLines = [];
  }

  private nextPoint() {
    let currentInnerEdge = this.innerShape.edges[this.currentEdgeIndex];
    let currentOuterEdge = this.outerShape.edges[
      (this.currentEdgeIndex + 1) % this.outerShape.edges.length
    ];
    let ray = new Line(
      this.currentPoint,
      this.currentPoint
        .clone()
        .add(currentInnerEdge.b)
        .subtract(currentInnerEdge.a),
    );

    let intersection = currentOuterEdge.intersection(ray)!;
    this.drawnLines.push(new Line(this.currentPoint, intersection));

    this.currentPoint = intersection;
    this.currentEdgeIndex =
      (this.currentEdgeIndex + 1) % this.innerShape.edges.length;
  }

  render() {
    this.renderPolygon(this.outerShape);
    this.renderPolygon(this.innerShape);

    this.drawnLines.forEach(line => this.renderLine(line));

    this.renderPoint(this.currentPoint, '#ff5555');

    // let currentInnerEdge = this.innerShape.edges[this.currentEdgeIndex];
    // let currentOuterEdge = this.outerShape.edges[
    //   (this.currentEdgeIndex + 1) % this.outerShape.edges.length
    // ];
    // let ray = new Line(
    //   this.currentPoint,
    //   this.currentPoint
    //     .clone()
    //     .add(currentInnerEdge.b)
    //     .subtract(currentInnerEdge.a),
    // );
  }

  private renderPoint(point: Vector, fillColor = POINT_COLOR) {
    let { renderingContext: ctx, coordinatePlane } = this.engine;

    ctx.beginPath();
    let { x, y } = coordinatePlane.transformPoint(point);
    ctx.fillStyle = fillColor;
    ctx.arc(x, y, POINT_RADIUS, 0, 2 * Math.PI);
    ctx.fill();
  }

  private renderLine(line: Line) {
    let { renderingContext: ctx, coordinatePlane } = this.engine;

    ctx.beginPath();
    let a = coordinatePlane.transformPoint(line.a);
    ctx.moveTo(a.x, a.y);
    let b = coordinatePlane.transformPoint(line.b);
    ctx.lineTo(b.x, b.y);
    ctx.lineWidth = LINE_WIDTH;
    ctx.strokeStyle = LINE_COLOR;
    ctx.stroke();
  }

  private renderPolygon(polygon: Polygon) {
    let { renderingContext: ctx, coordinatePlane } = this.engine;
    let { vertices } = polygon;

    ctx.beginPath();
    let firstVertex = coordinatePlane.transformPoint(vertices[0]);
    ctx.moveTo(firstVertex.x, firstVertex.y);
    for (let i = 1; i < vertices.length; i++) {
      let vertex = coordinatePlane.transformPoint(vertices[i]);
      ctx.lineTo(vertex.x, vertex.y);
    }
    ctx.closePath();
    ctx.lineWidth = LINE_WIDTH;
    ctx.strokeStyle = LINE_COLOR;
    ctx.stroke();
  }
}
