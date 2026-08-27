export interface FloodFillResult {
  canvas: HTMLCanvasElement;
  left: number;
  top: number;
}

function colorMatch(
  data: Uint8ClampedArray,
  idx: number,
  r: number,
  g: number,
  b: number,
  a: number,
  tolerance: number
) {
  return (
    Math.abs(data[idx] - r) <= tolerance &&
    Math.abs(data[idx + 1] - g) <= tolerance &&
    Math.abs(data[idx + 2] - b) <= tolerance &&
    Math.abs(data[idx + 3] - a) <= tolerance
  );
}

export function floodFillOverlay(
  source: ImageData,
  startX: number,
  startY: number,
  fillR: number,
  fillG: number,
  fillB: number,
  fillA = 255,
  tolerance = 28
): FloodFillResult | null {
  const w = source.width;
  const h = source.height;
  const x0 = Math.floor(startX);
  const y0 = Math.floor(startY);
  if (x0 < 0 || y0 < 0 || x0 >= w || y0 >= h) return null;

  const src = source.data;
  const startIdx = (y0 * w + x0) * 4;
  const tr = src[startIdx];
  const tg = src[startIdx + 1];
  const tb = src[startIdx + 2];
  const ta = src[startIdx + 3];

  if (colorMatch(src, startIdx, fillR, fillG, fillB, fillA, 0) && ta === fillA) {
    return null;
  }

  const overlay = new ImageData(w, h);
  const dst = overlay.data;
  const visited = new Uint8Array(w * h);
  const stack: number[] = [x0, y0];

  let minX = x0;
  let minY = y0;
  let maxX = x0;
  let maxY = y0;
  let filled = 0;

  const matches = (x: number, y: number) => {
    const i = (y * w + x) * 4;
    return colorMatch(src, i, tr, tg, tb, ta, tolerance);
  };

  while (stack.length) {
    const y = stack.pop() as number;
    let x = stack.pop() as number;
    while (x >= 0 && matches(x, y) && !visited[y * w + x]) x -= 1;
    x += 1;

    let spanUp = false;
    let spanDown = false;

    while (x < w && matches(x, y) && !visited[y * w + x]) {
      const vi = y * w + x;
      visited[vi] = 1;
      const di = vi * 4;
      dst[di] = fillR;
      dst[di + 1] = fillG;
      dst[di + 2] = fillB;
      dst[di + 3] = fillA;
      filled += 1;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;

      if (y > 0) {
        const up = !visited[(y - 1) * w + x] && matches(x, y - 1);
        if (!spanUp && up) {
          stack.push(x, y - 1);
          spanUp = true;
        } else if (spanUp && !up) {
          spanUp = false;
        }
      }
      if (y < h - 1) {
        const down = !visited[(y + 1) * w + x] && matches(x, y + 1);
        if (!spanDown && down) {
          stack.push(x, y + 1);
          spanDown = true;
        } else if (spanDown && !down) {
          spanDown = false;
        }
      }
      x += 1;
    }
  }

  if (filled === 0) return null;

  const cropW = maxX - minX + 1;
  const cropH = maxY - minY + 1;
  const cropped = document.createElement('canvas');
  cropped.width = cropW;
  cropped.height = cropH;
  const ctx = cropped.getContext('2d');
  if (!ctx) return null;

  const piece = ctx.createImageData(cropW, cropH);
  const pd = piece.data;
  for (let row = 0; row < cropH; row += 1) {
    const srcOff = ((minY + row) * w + minX) * 4;
    const dstOff = row * cropW * 4;
    pd.set(dst.subarray(srcOff, srcOff + cropW * 4), dstOff);
  }
  ctx.putImageData(piece, 0, 0);

  return { canvas: cropped, left: minX, top: minY };
}
