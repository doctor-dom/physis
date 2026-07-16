/**
 * Map clinical values to SVG coordinates on CDC 2–20 stature/weight charts.
 *
 * Stature uses a split panel (see CDC Set 1 layout):
 * - X (age): ages 2–11 use left year columns; ages 12–20 use upper-right year columns.
 * - Y (height cm): ages 2–11 (and ages 12–20 when height < 150 cm) use the left axis
 *   (80–165 cm). Ages 12–20 with height ≥ 150 cm use the right axis (150–195/185 cm).
 *
 * Weight uses marked age columns (2–20 y) with split kg Y-axes:
 * - X from weight-age landmark columns (interpolated). Y from kg anchors (left/right scale).
 *
 * Bump when calibration logic changes.
 */
export const CDC_PLOT_CAL_VERSION = 5;

export interface CdcWeightAgeColumn {
  age: number;
  x: number;
}

export interface CdcKgAnchor {
  kg: number;
  y: number;
}

export interface CdcWeightSegment {
  kgMin: number;
  kgMax: number;
  kgAnchors: readonly CdcKgAnchor[];
}

export interface CdcWeightAxes {
  ageMin: number;
  ageMax: number;
  /** Hand-marked age column x positions (may be sparse, e.g. ages 2,4,…,20). */
  ageColumns: readonly CdcWeightAgeColumn[];
  splitKg: number;
  left: CdcWeightSegment;
  right: CdcWeightSegment;
}

export interface CdcPlotRegion {
  left: number;
  width: number;
  yMaxTop: number;
  yMinTop: number;
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
}

export interface CdcCmAnchor {
  cm: number;
  /** Pixel row in the chart PNG (y grows downward). */
  y: number;
}

export interface CdcStatureSegment {
  ageMin: number;
  ageMax: number;
  /** X pixel of each integer age from ageMin through ageMax. */
  ageColumnsPx: readonly number[];
  cmMin: number;
  cmMax: number;
  cmAnchors: readonly CdcCmAnchor[];
}

export interface CdcStatureAxes {
  /** Ages >= splitAge use the right segment. */
  splitAge: number;
  left: CdcStatureSegment;
  right: CdcStatureSegment;
}

export interface CdcChartPoint {
  x: number;
  y: number;
}

export function dataToStaturePoint(
  axes: CdcStatureAxes,
  ageYears: number,
  heightCm: number,
): CdcChartPoint {
  const ageSegment = ageYears >= axes.splitAge ? axes.right : axes.left;
  const cmSegment = cmSegmentForAgeAndHeight(axes, ageYears, heightCm);
  return {
    x: ageToColumnPx(ageSegment, ageYears),
    y: cmToRowPx(cmSegment, heightCm),
  };
}

export function dataToWeightPoint(
  axes: CdcWeightAxes,
  ageYears: number,
  weightKg: number,
): CdcChartPoint {
  const kgSegment =
    weightKg >= axes.splitKg ? axes.right : axes.left;
  return {
    x: ageToWeightColumnPx(axes, ageYears),
    y: kgToRowPx(kgSegment, weightKg),
  };
}

/** Ages 12–20 use the right cm axis when height ≥ 150 cm; otherwise the left axis. */
function cmSegmentForAgeAndHeight(
  axes: CdcStatureAxes,
  ageYears: number,
  heightCm: number,
): CdcStatureSegment {
  if (ageYears >= axes.splitAge && heightCm >= axes.right.cmMin) {
    return axes.right;
  }
  return axes.left;
}

export function dataToPlotPoint(
  region: CdcPlotRegion,
  ageYears: number,
  value: number,
  imageWidth: number,
  imageHeight: number,
): CdcChartPoint {
  const plotLeft = region.left * imageWidth;
  const plotWidth = region.width * imageWidth;
  const yTop = region.yMaxTop * imageHeight;
  const yBottom = region.yMinTop * imageHeight;

  const ageClamped = clamp(ageYears, region.xMin, region.xMax);
  const valueClamped = clamp(value, region.yMin, region.yMax);

  const xFrac = (ageClamped - region.xMin) / (region.xMax - region.xMin);
  const yFrac = (valueClamped - region.yMin) / (region.yMax - region.yMin);

  return {
    x: plotLeft + xFrac * plotWidth,
    y: yTop + (1 - yFrac) * (yBottom - yTop),
  };
}

function ageToWeightColumnPx(axes: CdcWeightAxes, ageYears: number): number {
  const age = clamp(ageYears, axes.ageMin, axes.ageMax);
  const cols = axes.ageColumns;
  if (!cols.length) return 0;
  if (age <= cols[0].age) return cols[0].x;
  const last = cols[cols.length - 1];
  if (age >= last.age) return last.x;
  for (let i = 0; i < cols.length - 1; i++) {
    const a = cols[i];
    const b = cols[i + 1];
    if (age >= a.age && age <= b.age) {
      const t = (age - a.age) / (b.age - a.age);
      return lerp(a.x, b.x, t);
    }
  }
  return last.x;
}

function ageToColumnPx(segment: CdcStatureSegment, ageYears: number): number {
  const age = clamp(ageYears, segment.ageMin, segment.ageMax);
  const cols = segment.ageColumnsPx;
  const t = (age - segment.ageMin) / (segment.ageMax - segment.ageMin);
  const f = t * (cols.length - 1);
  const i0 = Math.floor(f);
  const i1 = Math.min(i0 + 1, cols.length - 1);
  return lerp(cols[i0], cols[i1], f - i0);
}

function kgToRowPx(segment: CdcWeightSegment, weightKg: number): number {
  const kg = clamp(weightKg, segment.kgMin, segment.kgMax);
  return valueToRowPx(segment.kgAnchors, kg, "kg");
}

function cmToRowPx(segment: CdcStatureSegment, heightCm: number): number {
  const cm = clamp(heightCm, segment.cmMin, segment.cmMax);
  return valueToRowPx(segment.cmAnchors, cm, "cm");
}

function valueToRowPx(
  anchors: readonly { y: number; cm?: number; kg?: number }[],
  value: number,
  key: "cm" | "kg",
): number {
  for (let i = 0; i < anchors.length - 1; i++) {
    const a = anchors[i];
    const b = anchors[i + 1];
    const aVal = a[key]!;
    const bVal = b[key]!;
    if (value >= aVal && value <= bVal) {
      const t = (value - aVal) / (bVal - aVal);
      return lerp(a.y, b.y, t);
    }
  }
  return anchors[anchors.length - 1].y;
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
