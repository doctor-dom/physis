/** Shared normogram interpolation and percentile utilities. */

export const NORMOGRAM_PERCENTILE_CURVES = [3, 5, 10, 25, 50, 75, 90, 95, 97] as const;
export type NormogramPercentile = (typeof NORMOGRAM_PERCENTILE_CURVES)[number];

export interface NormogramPoint {
  x: number;
  y: number;
}

export interface NormogramCurve {
  percentile: NormogramPercentile;
  label: string;
  points: NormogramPoint[];
}

export interface NormogramExtraCurve {
  label: string;
  points: NormogramPoint[];
  stroke?: string;
  dash?: string;
}

export interface NormogramChartScale {
  width?: number;
  height?: number;
  tickFontSize?: number;
  axisFontSize?: number;
  curveLabelFontSize?: number;
  margin?: { top: number; right: number; bottom: number; left: number };
}

export interface NormogramPatientPoint {
  x: number;
  y: number;
  percentile: number;
  sds: number;
}

export interface NormogramResult {
  curves: NormogramCurve[];
  lowCurve: NormogramCurve;
  highCurve: NormogramCurve;
  patient: NormogramPatientPoint;
  xLabel: string;
  yLabel: string;
  xUnit: string;
  yUnit: string;
}

const P = 0.2316419;
const B1 = 0.319381530;
const B2 = -0.356563782;
const B3 = 1.781477937;
const B4 = -1.821255978;
const B5 = 1.330274429;

/** Abramowitz & Stegun approximation for standard normal CDF. */
export function normalCdf(z: number): number {
  if (z === 0) return 0.5;
  const t = 1 / (1 + P * Math.abs(z));
  const pdf = Math.exp(-0.5 * z * z) / Math.sqrt(2 * Math.PI);
  let cdf =
    1 -
    pdf *
      (B1 * t +
        B2 * t ** 2 +
        B3 * t ** 3 +
        B4 * t ** 4 +
        B5 * t ** 5);
  if (z < 0) cdf = 1 - cdf;
  return Math.min(1, Math.max(0, cdf));
}

export function sdsToPercentile(sds: number): number {
  return normalCdf(sds) * 100;
}

export function formatPercentile(value: number): string {
  if (!Number.isFinite(value)) return "—";
  if (value < 0.1) return "<0.1";
  if (value > 99.9) return ">99.9";
  return value.toFixed(1);
}

export function formatSds(sds: number): string {
  if (!Number.isFinite(sds)) return "—";
  const rounded = Math.round(sds * 100) / 100;
  if (rounded > 0) return `+${rounded.toFixed(2)}`;
  return rounded.toFixed(2);
}

export function formatPercentileAndSds(percentile: number, sds: number): string {
  return `${formatPercentile(percentile)} percentile · SDS (Z-score) ${formatSds(sds)}`;
}

export function linearInterpolate(
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  x: number,
): number {
  if (x1 === x0) return y0;
  return y0 + ((x - x0) * (y1 - y0)) / (x1 - x0);
}

export function interpolateOnGrid(
  xGrid: readonly number[],
  yGrid: readonly number[],
  x: number,
): number {
  if (xGrid.length === 0) return NaN;
  if (x <= xGrid[0]) {
    return xGrid.length > 1
      ? linearInterpolate(xGrid[0], yGrid[0], xGrid[1], yGrid[1], x)
      : yGrid[0];
  }
  const last = xGrid.length - 1;
  if (x >= xGrid[last]) {
    return last > 0
      ? linearInterpolate(xGrid[last - 1], yGrid[last - 1], xGrid[last], yGrid[last], x)
      : yGrid[last];
  }
  for (let i = 0; i < last; i++) {
    if (x >= xGrid[i] && x <= xGrid[i + 1]) {
      return linearInterpolate(xGrid[i], yGrid[i], xGrid[i + 1], yGrid[i + 1], x);
    }
  }
  return yGrid[last];
}

export function inverseInterpolateOnGrid(
  yGrid: readonly number[],
  xGrid: readonly number[],
  y: number,
): number {
  if (yGrid.length === 0) return NaN;
  if (y <= yGrid[0]) {
    return yGrid.length > 1
      ? linearInterpolate(yGrid[0], xGrid[0], yGrid[1], xGrid[1], y)
      : xGrid[0];
  }
  const last = yGrid.length - 1;
  if (y >= yGrid[last]) {
    return last > 0
      ? linearInterpolate(yGrid[last - 1], xGrid[last - 1], yGrid[last], xGrid[last], y)
      : xGrid[last];
  }
  for (let i = 0; i < last; i++) {
    if (y >= yGrid[i] && y <= yGrid[i + 1]) {
      return linearInterpolate(yGrid[i], xGrid[i], yGrid[i + 1], xGrid[i + 1], y);
    }
  }
  return xGrid[last];
}

export function buildPercentileCurves(
  rows: readonly { x: number; percentiles: Partial<Record<NormogramPercentile, number>> }[],
  options?: { low?: NormogramPercentile; high?: NormogramPercentile },
): NormogramCurve[] {
  const low = options?.low ?? 5;
  const high = options?.high ?? 95;
  const selected = NORMOGRAM_PERCENTILE_CURVES.filter((p) => p >= low && p <= high);
  return selected.map((percentile) => ({
    percentile,
    label: `${percentile}${percentile === 50 ? "th (median)" : "th"} percentile`,
    points: rows
      .filter((row) => row.percentiles[percentile] != null)
      .map((row) => ({
        x: row.x,
        y: row.percentiles[percentile] as number,
      })),
  }));
}

export function percentileFromCentileCurves(
  x: number,
  measurement: number,
  curves: NormogramCurve[],
): { percentile: number; sds: number } {
  const percentileValues = curves.map((curve) => ({
    percentile: curve.percentile,
    value: interpolateOnGrid(
      curve.points.map((p) => p.x),
      curve.points.map((p) => p.y),
      x,
    ),
  }));

  if (percentileValues.some((entry) => !Number.isFinite(entry.value))) {
    return { percentile: NaN, sds: NaN };
  }

  const values = percentileValues.map((entry) => entry.value);
  const percentiles = percentileValues.map((entry) => entry.percentile);

  if (measurement <= values[0]) {
    const percentile = Math.max(0.1, inverseInterpolateOnGrid(values, percentiles, measurement));
    const p50 = interpolateOnGrid(percentiles, values, 50);
    const p84 = interpolateOnGrid(percentiles, values, 84.13);
    const sd = p84 - p50;
    const sds = sd > 0 ? (measurement - p50) / sd : sdsFromPercentile(percentile);
    return { percentile, sds };
  }
  if (measurement >= values[values.length - 1]) {
    const percentile = Math.min(99.9, inverseInterpolateOnGrid(values, percentiles, measurement));
    const p50 = interpolateOnGrid(percentiles, values, 50);
    const p84 = interpolateOnGrid(percentiles, values, 84.13);
    const sd = p84 - p50;
    const sds = sd > 0 ? (measurement - p50) / sd : sdsFromPercentile(percentile);
    return { percentile, sds };
  }

  const percentile = inverseInterpolateOnGrid(values, percentiles, measurement);
  const p50 = interpolateOnGrid(percentiles, values, 50);
  const p84 = interpolateOnGrid(percentiles, values, 84.13);
  const sd = p84 - p50;
  const sds = sd > 0 ? (measurement - p50) / sd : sdsFromPercentile(percentile);
  return { percentile, sds };
}

/** Approximate SDS from percentile using inverse normal CDF. */
export function sdsFromPercentile(percentile: number): number {
  const p = Math.min(0.9999, Math.max(0.0001, percentile / 100));
  if (p === 0.5) return 0;
  const a = [
    -3.969683028665376e1, 2.209460984245205e2, -2.759285104469138e2,
    1.383577518672690e2, -3.066479806614716e1, 2.506628277459239e0,
  ];
  const b = [
    -5.447609879822406e1, 1.615858368580409e2, -1.556989798598866e2,
    6.680131188771972e1, -1.328068155288572e1,
  ];
  const c = [
    -7.784894002430293e-3, -3.22396458041136e-1, -2.400758227161838e0,
    -2.549732539343734e0, 4.374664141464968e0, 2.938163982698783e0,
  ];
  const d = [7.784695709091636e-3, 3.224671290700398e-1, 2.445134137142996e0, 3.754408661907416e0];
  const pLow = 0.02425;
  const pHigh = 1 - pLow;
  let q: number;
  let r: number;
  if (p < pLow) {
    q = Math.sqrt(-2 * Math.log(p));
    return (
      (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
      ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1)
    );
  }
  if (p <= pHigh) {
    q = p - 0.5;
    r = q * q;
    return (
      (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q /
      (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1)
    );
  }
  q = Math.sqrt(-2 * Math.log(1 - p));
  return -(
    (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
    ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1)
  );
}

export function percentileFromMeanSd(
  measurement: number,
  mean: number,
  sd: number,
): { percentile: number; sds: number } {
  if (sd <= 0) return { percentile: NaN, sds: NaN };
  const sds = (measurement - mean) / sd;
  return { percentile: sdsToPercentile(sds), sds };
}

/** Z-score for 10th/90th decile (one-sided tail = 10%). */
export const DECILE_Z = 1.28155;

export function percentileFromDeciles(
  measurement: number,
  low: number,
  median: number,
  high: number,
  decileZ = DECILE_Z,
): { percentile: number; sds: number } {
  if (high <= low || median < low || median > high) {
    return { percentile: NaN, sds: NaN };
  }
  const upperSd = (high - median) / decileZ;
  const lowerSd = (median - low) / decileZ;
  if (upperSd <= 0 || lowerSd <= 0) return { percentile: NaN, sds: NaN };
  const sd = measurement >= median ? upperSd : lowerSd;
  const sds = (measurement - median) / sd;
  return { percentile: sdsToPercentile(sds), sds };
}
export function percentileFromP5P50P95(
  measurement: number,
  p5: number,
  p50: number,
  p95: number,
): { percentile: number; sds: number } {
  if (p95 <= p5) return { percentile: NaN, sds: NaN };
  const sd = (p95 - p5) / (2 * 1.64485);
  const sds = (measurement - p50) / sd;
  return { percentile: sdsToPercentile(sds), sds };
}

export function clampChartDomain(
  values: number[],
  paddingRatio = 0.08,
): { min: number; max: number } {
  const finite = values.filter(Number.isFinite);
  if (finite.length === 0) return { min: 0, max: 1 };
  const min = Math.min(...finite);
  const max = Math.max(...finite);
  const pad = Math.max((max - min) * paddingRatio, 0.2);
  return { min: min - pad, max: max + pad };
}
