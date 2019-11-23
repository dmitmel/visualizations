import { App, GameObject } from './App';
import { Vector, vec, deg2rad, vec1 } from './math';

const ARROW_HEAD_LENGTH = 10;
const ARROW_HEAD_ANGLE = 30;

const RULER_COLOR = '#000';
const RULER_LINE_WIDTH = 2;
const RULER_AXIS_MARGIN = vec1(20);

const MOUSE_GUIDES_COLOR = '#aaa';
const MOUSE_GUIDES_LINE_WIDTH = 1;

export class CoordinatePlane implements GameObject {
  constructor(private app: App) {}

  render() {
    let {
      renderingContext: ctx,
      canvasSize,
      mousePosition,
      panZoom,
    } = this.app;
    let halfCanvasSize = canvasSize.clone().divide(2);
    let { translation } = panZoom;

    let axisPositions = panZoom.translation.clone().clamp(
      halfCanvasSize
        .clone()
        .negate()
        .add(RULER_AXIS_MARGIN),
      halfCanvasSize.clone().subtract(RULER_AXIS_MARGIN),
    );

    ctx.beginPath();

    ctx.moveTo(mousePosition.x, translation.y);
    ctx.lineTo(mousePosition.x, mousePosition.y);
    ctx.moveTo(translation.x, mousePosition.y);
    ctx.lineTo(mousePosition.x, mousePosition.y);

    ctx.save();
    ctx.strokeStyle = MOUSE_GUIDES_COLOR;
    ctx.lineWidth = MOUSE_GUIDES_LINE_WIDTH;
    ctx.stroke();
    ctx.restore();

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
      vec(-halfCanvasSize.x, axisPositions.y),
      vec(halfCanvasSize.x, axisPositions.y),
    );

    // x axis
    arrow(
      vec(axisPositions.x, -halfCanvasSize.y),
      vec(axisPositions.x, halfCanvasSize.y),
    );

    ctx.save();
    ctx.lineWidth = RULER_LINE_WIDTH;
    ctx.strokeStyle = RULER_COLOR;
    ctx.stroke();
    ctx.restore();
  }
}
