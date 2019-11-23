import { App } from './App';
import { Vector, vec, deg2rad } from './math';

const ARROW_HEAD_LENGTH = 10;
const ARROW_HEAD_ANGLE = 30;
const RULER_COLOR = '#000';
const RULER_LINE_WIDTH = 2;

export class CoordinatePlane {
  constructor(private app: App) {}

  render() {
    let { renderingContext: ctx, canvasSize, panZoom } = this.app;
    let { translation } = panZoom;

    ctx.beginPath();

    function arrow(from: Vector, to: Vector) {
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);

      let dir = from
        .clone()
        .subtract(to)
        .setLength(ARROW_HEAD_LENGTH);
      let p1 = dir
        .clone()
        .rotate(deg2rad(ARROW_HEAD_ANGLE))
        .add(to);
      let p2 = dir
        .clone()
        .rotate(deg2rad(-ARROW_HEAD_ANGLE))
        .add(to);

      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(to.x, to.y);
      ctx.lineTo(p2.x, p2.y);
    }

    // y axis
    arrow(
      vec(-canvasSize.x / 2, translation.y),
      vec(canvasSize.x / 2, translation.y),
    );

    // x axis
    arrow(
      vec(translation.x, -canvasSize.y / 2),
      vec(translation.x, canvasSize.y / 2),
    );

    ctx.lineWidth = RULER_LINE_WIDTH;
    ctx.strokeStyle = RULER_COLOR;
    ctx.stroke();
  }
}
