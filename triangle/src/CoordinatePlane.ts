import { App } from './App';
import { Vector, vec, deg2rad } from './math';

const ARROW_HEAD_LENGTH = 10;
const ARROW_HEAD_ANGLE = 30;
const RULER_COLOR = 'white';
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
      vec(translation.x + canvasSize.x / 2, canvasSize.y),
      vec(translation.x + canvasSize.x / 2, 0),
    );

    // x axis
    arrow(
      vec(0, translation.y + canvasSize.y / 2),
      vec(canvasSize.x, translation.y + canvasSize.y / 2),
    );

    ctx.lineWidth = RULER_LINE_WIDTH;
    ctx.strokeStyle = RULER_COLOR;
    ctx.stroke();
  }
}
