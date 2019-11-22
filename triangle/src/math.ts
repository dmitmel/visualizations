export function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

export class Vector {
  x: number;
  y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  clone() {
    return new Vector(this.x, this.y);
  }

  set(x: number, y: number) {
    this.x = x;
    this.y = y;
    return this;
  }

  add(other: Vector) {
    this.x += other.x;
    this.y += other.y;
    return this;
  }

  subtract(other: Vector) {
    this.x -= other.x;
    this.y -= other.y;
    return this;
  }

  multiply(scalar: number) {
    this.x *= scalar;
    this.y *= scalar;
    return this;
  }

  divide(scalar: number) {
    this.x /= scalar;
    this.y /= scalar;
    return this;
  }

  lerp(other: Vector, t: number) {
    return this.set(lerp(this.x, other.x, t), lerp(this.y, other.y, t));
  }
}

export function vec(x: number, y: number) {
  return new Vector(x, y);
}

export class Line {
  readonly a: Vector;
  readonly b: Vector;

  constructor(a: Vector, b: Vector) {
    this.a = a;
    this.b = b;
  }

  intersection(other: Line) {
    let { x: x1, y: y1 } = this.a;
    let { x: x2, y: y2 } = this.b;
    let { x: x3, y: y3 } = other.a;
    let { x: x4, y: y4 } = other.b;

    // https://en.wikipedia.org/wiki/Line-line_intersection#Given_two_points_on_each_line

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
