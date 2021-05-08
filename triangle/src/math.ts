export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function deg2rad(degrees: number): number {
  return (degrees / 180) * Math.PI;
}

export function rad2deg(radians: number): number {
  return (radians / Math.PI) * 180;
}

export function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(val, max));
}

export class Vector {
  public constructor(public x: number, public y: number) {}

  public clone(): Vector {
    return new Vector(this.x, this.y);
  }

  public set(x: number, y: number): Vector {
    this.x = x;
    this.y = y;
    return this;
  }

  public get length(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  public set length(val: number) {
    this.setLength(val);
  }

  public get sqrLength(): number {
    return this.x * this.x + this.y * this.y;
  }

  public negate(): Vector {
    this.x = -this.x;
    this.y = -this.y;
    return this;
  }

  public add(other: Vector): Vector {
    this.x += other.x;
    this.y += other.y;
    return this;
  }

  public subtract(other: Vector): Vector {
    this.x -= other.x;
    this.y -= other.y;
    return this;
  }

  public multiply(scalar: number): Vector {
    this.x *= scalar;
    this.y *= scalar;
    return this;
  }

  public divide(scalar: number): Vector {
    this.x /= scalar;
    this.y /= scalar;
    return this;
  }

  public normalize(): Vector {
    return this.divide(this.length);
  }

  public setLength(newLength: number): Vector {
    return this.normalize().multiply(newLength);
  }

  public lerp(other: Vector, t: number): Vector {
    return this.set(lerp(this.x, other.x, t), lerp(this.y, other.y, t));
  }

  public clamp(min: Vector, max: Vector): Vector {
    return this.set(clamp(this.x, min.x, max.x), clamp(this.y, min.y, max.y));
  }

  public rotate(angle: number): Vector {
    let c = Math.cos(angle);
    let s = Math.sin(angle);
    let x2 = this.x * c - this.y * s;
    let y2 = this.x * s + this.y * c;
    return this.set(x2, y2);
  }
}

export function vec(x: number, y: number): Vector {
  return new Vector(x, y);
}

export function vec1(x: number): Vector {
  return new Vector(x, x);
}

export class Line {
  public constructor(public a: Vector, public b: Vector) {}

  public intersection(other: Line): Vector | null {
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
