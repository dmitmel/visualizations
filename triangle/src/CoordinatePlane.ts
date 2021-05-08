import { Engine, GameObject } from './Engine';
import { Vector, deg2rad, vec1 } from './math';

const PIXELS_PER_UNIT = 100;

const ARROW_HEAD_LENGTH = 10;
const ARROW_HEAD_ANGLE = 30;

const AXIS_COLOR = '#000000';
const AXIS_LINE_WIDTH = 2;
const AXIS_MARGIN = vec1(AXIS_LINE_WIDTH / 2);
const AXIS_MARK_SIZE = AXIS_LINE_WIDTH * 8;
const AXIS_MARK_COUNT_POWER = 2;

const GRID_COLOR = '#cccccc';
const GRID_LINE_WIDTH = 1;

const MOUSE_GUIDES_COLOR = '#aaaaaa';
const MOUSE_GUIDES_LINE_WIDTH = 1;

export class CoordinatePlane implements GameObject {
  public constructor(private engine: Engine) {}

  public transformPoint(point: Vector): Vector {
    let { translation, scale } = this.engine.panZoom;
    return point.clone().multiply(scale).multiply(PIXELS_PER_UNIT).add(translation);
  }

  public render(): void {
    let { renderingContext: ctx, halfCanvasSize, mousePosition, panZoom } = this.engine;
    let { translation, scale } = panZoom;

    let axisPos = translation
      .clone()
      .clamp(
        halfCanvasSize.clone().negate().add(AXIS_MARGIN),
        halfCanvasSize.clone().subtract(AXIS_MARGIN),
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

    let marksPerUnit = Math.pow(
      AXIS_MARK_COUNT_POWER,
      Math.floor(Math.log(scale) / Math.log(AXIS_MARK_COUNT_POWER)),
    );

    function forEachMarkOnAxis(
      axis: 'x' | 'y',
      dir: 1 | -1,
      callback: (markPos: number) => void,
    ): void {
      let screenPxPerUnit = (scale * PIXELS_PER_UNIT) / marksPerUnit;
      let offset = translation[axis] - halfCanvasSize[axis];
      let visibleUnits = Math.min((halfCanvasSize[axis] - offset * dir) / screenPxPerUnit, 5);

      // console.log(axis, dir, visibleUnits);

      for (let i = 1; i <= visibleUnits; i++) {
        let markPos = offset + i * screenPxPerUnit * dir;
        callback(markPos);
      }
    }

    ctx.beginPath();

    function drawGridForAxis(axis: 'x' | 'y', dir: 1 | -1): void {
      forEachMarkOnAxis(axis, dir, (markPos) => {
        let lineStartPoint = halfCanvasSize.clone().negate();
        lineStartPoint[axis] = markPos;
        let lineEndPoint = halfCanvasSize.clone();
        lineEndPoint[axis] = markPos;
        ctx.moveTo(lineStartPoint.x, lineStartPoint.y);
        ctx.lineTo(lineEndPoint.x, lineEndPoint.y);
      });
    }

    drawGridForAxis('x', 1);
    // drawGridForAxis('x', -1);
    drawGridForAxis('y', 1);
    // drawGridForAxis('y', -1);

    ctx.save();
    ctx.lineWidth = GRID_LINE_WIDTH;
    ctx.strokeStyle = GRID_COLOR;
    ctx.stroke();
    ctx.restore();

    ctx.beginPath();

    function arrow(from: Vector, to: Vector): void {
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);

      let dir = from.clone().subtract(to).setLength(ARROW_HEAD_LENGTH);
      let p1 = dir.clone().rotate(deg2rad(ARROW_HEAD_ANGLE)).add(to);
      let p2 = dir.clone().rotate(deg2rad(-ARROW_HEAD_ANGLE)).add(to);

      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(to.x, to.y);
      ctx.lineTo(p2.x, p2.y);
    }

    function drawAxis(axis: 'x' | 'y', dir: 1 | -1): void {
      let startPoint = halfCanvasSize.clone().negate();
      startPoint[axis] = axisPos[axis];
      let endPoint = halfCanvasSize.clone();
      endPoint[axis] = axisPos[axis];
      arrow(startPoint, endPoint);

      forEachMarkOnAxis(axis, dir, (markPos) => {
        let halfMarkSizeVec = vec1(AXIS_MARK_SIZE / 2);
        let markStartPoint = axisPos.clone().subtract(halfMarkSizeVec);
        markStartPoint[axis] = markPos;
        let markEndPoint = axisPos.clone().add(halfMarkSizeVec);
        markEndPoint[axis] = markPos;
        ctx.moveTo(markStartPoint.x, markStartPoint.y);
        ctx.lineTo(markEndPoint.x, markEndPoint.y);
      });
    }

    drawAxis('x', 1);
    // drawAxis('x', -1);
    drawAxis('y', 1);
    // drawAxis('y', -1);

    ctx.save();
    ctx.lineWidth = AXIS_LINE_WIDTH;
    ctx.strokeStyle = AXIS_COLOR;
    ctx.stroke();
    ctx.restore();
  }
}
