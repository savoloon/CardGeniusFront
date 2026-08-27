import { BaseBrush, FabricImage } from 'fabric';
import type { Canvas, Point } from 'fabric';

function roundRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

abstract class OverlayStrokeBrush extends BaseBrush {
  protected minX = Infinity;
  protected minY = Infinity;
  protected maxX = -Infinity;
  protected maxY = -Infinity;

  protected resetBounds() {
    this.minX = Infinity;
    this.minY = Infinity;
    this.maxX = -Infinity;
    this.maxY = -Infinity;
  }

  protected expandBounds(x: number, y: number, pad: number) {
    this.minX = Math.min(this.minX, x - pad);
    this.minY = Math.min(this.minY, y - pad);
    this.maxX = Math.max(this.maxX, x + pad);
    this.maxY = Math.max(this.maxY, y + pad);
  }

  protected commitOverlay() {
    const canvas = this.canvas;
    if (!Number.isFinite(this.minX)) {
      canvas.clearContext(canvas.contextTop);
      return;
    }

    const pad = Math.ceil(this.width) + 2;
    const left = Math.max(0, Math.floor(this.minX - pad));
    const top = Math.max(0, Math.floor(this.minY - pad));
    const right = Math.min(canvas.getWidth(), Math.ceil(this.maxX + pad));
    const bottom = Math.min(canvas.getHeight(), Math.ceil(this.maxY + pad));
    const width = Math.max(1, right - left);
    const height = Math.max(1, bottom - top);

    const upper = canvas.upperCanvasEl;
    const retina = canvas.getRetinaScaling();
    const tmp = document.createElement('canvas');
    tmp.width = Math.max(1, Math.round(width * retina));
    tmp.height = Math.max(1, Math.round(height * retina));
    const ctx = tmp.getContext('2d');
    if (!ctx) {
      canvas.clearContext(canvas.contextTop);
      return;
    }

    ctx.drawImage(
      upper,
      Math.round(left * retina),
      Math.round(top * retina),
      Math.round(width * retina),
      Math.round(height * retina),
      0,
      0,
      tmp.width,
      tmp.height
    );

    const img = new FabricImage(tmp, {
      left,
      top,
      scaleX: width / tmp.width,
      scaleY: height / tmp.height,
      selectable: false,
      evented: false,
      objectCaching: true,
    });

    canvas.clearContext(canvas.contextTop);
    canvas.fire('before:path:created', { path: img });
    canvas.add(img);
    canvas.fire('path:created', { path: img });
    canvas.requestRenderAll();
  }
}

export type StampKind = 'calligraphy' | 'marker';

export class StampBrush extends OverlayStrokeBrush {
  kind: StampKind = 'calligraphy';
  private lastX = 0;
  private lastY = 0;
  private drawing = false;

  constructor(canvas: Canvas, kind: StampKind) {
    super(canvas);
    this.kind = kind;
  }

  private spacing() {
    return this.kind === 'calligraphy'
      ? Math.max(0.8, this.width * 0.1)
      : Math.max(1, this.width * 0.16);
  }

  private stamp(x: number, y: number) {
    const ctx = this.canvas.contextTop;
    this._saveAndTransform(ctx);
    ctx.fillStyle = this.color;
    ctx.translate(x, y);

    if (this.kind === 'calligraphy') {
      ctx.rotate(-Math.PI / 4);
      ctx.beginPath();
      ctx.ellipse(0, 0, this.width / 2, Math.max(0.75, this.width / 9), 0, 0, Math.PI * 2);
      ctx.fill();
      this.expandBounds(x, y, this.width / 2);
    } else {
      ctx.rotate(-Math.PI / 5);
      const w = this.width * 1.15;
      const h = Math.max(2.5, this.width * 0.38);
      roundRectPath(ctx, -w / 2, -h / 2, w, h, h * 0.45);
      ctx.fill();
      this.expandBounds(x, y, Math.max(w, h) / 2);
    }

    ctx.restore();
  }

  private stampLine(x0: number, y0: number, x1: number, y1: number) {
    const dist = Math.hypot(x1 - x0, y1 - y0);
    const step = this.spacing();
    const n = Math.max(1, Math.ceil(dist / step));
    for (let i = 1; i <= n; i++) {
      const t = i / n;
      this.stamp(x0 + (x1 - x0) * t, y0 + (y1 - y0) * t);
    }
  }

  onMouseDown(pointer: Point) {
    this.drawing = true;
    this.resetBounds();
    this.canvas.clearContext(this.canvas.contextTop);
    this.stamp(pointer.x, pointer.y);
    this.lastX = pointer.x;
    this.lastY = pointer.y;
  }

  onMouseMove(pointer: Point) {
    if (!this.drawing) return;
    if (this.limitedToCanvasSize && this._isOutSideCanvas(pointer)) return;
    this.stampLine(this.lastX, this.lastY, pointer.x, pointer.y);
    this.lastX = pointer.x;
    this.lastY = pointer.y;
  }

  onMouseUp() {
    this.drawing = false;
    this.commitOverlay();
    return false;
  }

  _render() {
    /* incremental stamps already on contextTop */
  }
}

export class Airbrush extends OverlayStrokeBrush {
  private drawing = false;

  constructor(canvas: Canvas) {
    super(canvas);
  }

  private spray(x: number, y: number) {
    const ctx = this.canvas.contextTop;
    this._saveAndTransform(ctx);
    ctx.fillStyle = this.color;
    const radius = this.width / 2;
    const count = Math.max(12, Math.round(this.width * 2.2));

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = Math.sqrt(Math.random()) * radius;
      const px = x + Math.cos(angle) * r;
      const py = y + Math.sin(angle) * r;
      const size = Math.random() * 1.6 + 0.4;
      ctx.globalAlpha = 0.12 + Math.random() * 0.5;
      ctx.fillRect(px, py, size, size);
    }

    ctx.restore();
    this.expandBounds(x, y, radius + 2);
  }

  onMouseDown(pointer: Point) {
    this.drawing = true;
    this.resetBounds();
    this.canvas.clearContext(this.canvas.contextTop);
    this.spray(pointer.x, pointer.y);
  }

  onMouseMove(pointer: Point) {
    if (!this.drawing) return;
    if (this.limitedToCanvasSize && this._isOutSideCanvas(pointer)) return;
    this.spray(pointer.x, pointer.y);
  }

  onMouseUp() {
    this.drawing = false;
    this.commitOverlay();
    return false;
  }

  _render() {
    /* incremental spray already on contextTop */
  }
}
