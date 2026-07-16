import type { ChartPoint } from "./types";

/**
 * Linear interpolation between sorted chart points.
 * Returns y at x; extrapolates linearly beyond endpoints when allowExtrapolation is true.
 */
export function linearInterpolate(
  points: ChartPoint[],
  x: number,
  allowExtrapolation = false,
): number {
  if (points.length === 0) {
    throw new Error("Chart has no data points");
  }

  const sorted = [...points].sort((a, b) => a.x - b.x);

  if (x <= sorted[0].x) {
    if (!allowExtrapolation && x < sorted[0].x) {
      return sorted[0].y;
    }
    if (sorted.length === 1) return sorted[0].y;
    const [p0, p1] = [sorted[0], sorted[1]];
    const slope = (p1.y - p0.y) / (p1.x - p0.x);
    return p0.y + slope * (x - p0.x);
  }

  if (x >= sorted[sorted.length - 1].x) {
    if (!allowExtrapolation && x > sorted[sorted.length - 1].x) {
      return sorted[sorted.length - 1].y;
    }
    if (sorted.length === 1) return sorted[0].y;
    const p0 = sorted[sorted.length - 2];
    const p1 = sorted[sorted.length - 1];
    const slope = (p1.y - p0.y) / (p1.x - p0.x);
    return p1.y + slope * (x - p1.x);
  }

  for (let i = 0; i < sorted.length - 1; i++) {
    const left = sorted[i];
    const right = sorted[i + 1];
    if (x >= left.x && x <= right.x) {
      const fraction = (x - left.x) / (right.x - left.x);
      return left.y + fraction * (right.y - left.y);
    }
  }

  return sorted[sorted.length - 1].y;
}

/**
 * Interpolate a coefficient from an age-keyed chart when age falls between tabulated ages.
 */
export function interpolateByAge(
  chart: { ageYears: number; value: number }[],
  ageYears: number,
): number {
  return linearInterpolate(
    chart.map((row) => ({ x: row.ageYears, y: row.value })),
    ageYears,
  );
}

/**
 * Bilinear interpolation on a rectangular grid (e.g. SMS → bone age lookup).
 */
export function bilinearInterpolate(
  xValues: number[],
  yValues: number[],
  grid: number[][],
  x: number,
  y: number,
): number {
  const xs = [...xValues].sort((a, b) => a - b);
  const ys = [...yValues].sort((a, b) => a - b);

  const clampX = Math.max(xs[0], Math.min(xs[xs.length - 1], x));
  const clampY = Math.max(ys[0], Math.min(ys[ys.length - 1], y));

  let x0Idx = 0;
  for (let i = 0; i < xs.length - 1; i++) {
    if (clampX >= xs[i] && clampX <= xs[i + 1]) {
      x0Idx = i;
      break;
    }
    if (clampX > xs[i + 1]) x0Idx = i + 1;
  }

  let y0Idx = 0;
  for (let i = 0; i < ys.length - 1; i++) {
    if (clampY >= ys[i] && clampY <= ys[i + 1]) {
      y0Idx = i;
      break;
    }
    if (clampY > ys[i + 1]) y0Idx = i + 1;
  }

  const x0 = xs[x0Idx];
  const x1 = xs[Math.min(x0Idx + 1, xs.length - 1)];
  const y0 = ys[y0Idx];
  const y1 = ys[Math.min(y0Idx + 1, ys.length - 1)];

  const q11 = grid[y0Idx][x0Idx];
  const q21 = grid[y0Idx][Math.min(x0Idx + 1, xs.length - 1)];
  const q12 = grid[Math.min(y0Idx + 1, ys.length - 1)][x0Idx];
  const q22 =
    grid[Math.min(y0Idx + 1, ys.length - 1)][Math.min(x0Idx + 1, xs.length - 1)];

  const denomX = x1 - x0;
  const denomY = y1 - y0;

  if (denomX === 0 && denomY === 0) return q11;
  if (denomX === 0) {
    const ty = denomY === 0 ? 0 : (clampY - y0) / denomY;
    return q11 + ty * (q12 - q11);
  }
  if (denomY === 0) {
    const tx = (clampX - x0) / denomX;
    return q11 + tx * (q21 - q11);
  }

  const tx = (clampX - x0) / denomX;
  const ty = (clampY - y0) / denomY;

  const r1 = q11 + tx * (q21 - q11);
  const r2 = q12 + tx * (q22 - q12);
  return r1 + ty * (r2 - r1);
}
