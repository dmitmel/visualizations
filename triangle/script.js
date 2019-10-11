window.addEventListener('load', () => {
  const BACKGROUND_COLOR = '#222';
  const POINT_RADIUS = 4;
  const POINT_COLOR = '#eee';
  const LINE_WIDTH = 2;
  const LINE_COLOR = '#888';

  let canvas = document.getElementById('canvas');
  let ctx = canvas.getContext('2d');

  function adjustCanvasSize() {
    canvas.width = document.documentElement.clientWidth;
    canvas.height = document.documentElement.clientHeight;
  }
  adjustCanvasSize();
  window.addEventListener('resize', adjustCanvasSize);

  let { PI } = Math;
  let TWO_PI = PI * 2;

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  class Vector {
    constructor(x, y) {
      this.x = x;
      this.y = y;
    }

    clone() {
      return vec(this.x, this.y);
    }

    render(color = POINT_COLOR) {
      ctx.beginPath();
      ctx.arc(this.x, this.y, POINT_RADIUS, 0, TWO_PI);
      ctx.fillStyle = color;
      ctx.fill();
    }

    plus(other) {
      return vec(this.x + other.x, this.y + other.y);
    }

    minus(other) {
      return vec(this.x - other.x, this.y - other.y);
    }

    times(other) {
      return vec(this.x * other.x, this.y * other.y);
    }

    divide(other) {
      return vec(this.x + other.x, this.y + other.y);
    }

    lerp(other, t) {
      return vec(lerp(this.x, other.x, t), lerp(this.y, other.y, t));
    }
  }

  function vec(x, y) {
    return new Vector(x, y);
  }

  class Line {
    constructor(a, b) {
      this.a = a;
      this.b = b;
    }

    render() {
      ctx.beginPath();
      ctx.moveTo(this.a.x, this.a.y);
      ctx.lineTo(this.b.x, this.b.y);
      ctx.lineWidth = LINE_WIDTH;
      ctx.strokeStyle = LINE_COLOR;
      ctx.stroke();
    }

    intersection(other) {
      let { x: x1, y: y1 } = this.a;
      let { x: x2, y: y2 } = this.b;
      let { x: x3, y: y3 } = other.a;
      let { x: x4, y: y4 } = other.b;

      // https://en.wikipedia.org/wiki/Line-line_intersection

      let d = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
      if (d === 0) return null;

      // let t = (x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4);
      // let u = -(x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3);

      return vec(
        ((x1 * y2 - y1 * x2) * (x3 - x4) - (x1 - x2) * (x3 * y4 - y3 * x4)) / d,
        ((x1 * y2 - y1 * x2) * (y3 - y4) - (y1 - y2) * (x3 * y4 - y3 * x4)) / d,
      );
    }
  }

  class Polygon {
    constructor(vertices) {
      this.vertices = vertices;
      this.edges = [];
      for (let i = 0; i < vertices.length; i++) {
        let vertex = vertices[i];
        let nextVertex = vertices[i + 1 < vertices.length ? i + 1 : 0];
        this.edges.push(new Line(vertex, nextVertex));
      }
    }

    static regular(center, radius, vertexCount) {
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
        vertex.render();
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

  let drawnLines = [];

  window.nextPoint = function nextPoint() {
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

  function render(time) {
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
    drawnLines.forEach(line => line.render());
    currentPoint.render('#f55');

    let currentInnerEdge = innerShape.edges[currentEdgeIndex];
    // currentInnerEdge.render();
    let currentOuterEdge =
      outerShape.edges[
        currentEdgeIndex + 1 < outerShape.edges.length
          ? currentEdgeIndex + 1
          : 0
      ];
    // currentOuterEdge.render();
    let ray = new Line(
      currentPoint,
      vec(
        currentPoint.x + (currentInnerEdge.b.x - currentInnerEdge.a.x),
        currentPoint.y + (currentInnerEdge.b.y - currentInnerEdge.a.y),
      ),
    );
    // ray.render();

    ctx.restore();

    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
});
