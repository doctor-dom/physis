import type { CalculatorResult } from "../../types";
import { clitoralNormogram, type ClitoralNormogramRow } from "../../../data/gonad-auxology/clitoralNormogram";
import {
  buildPercentileCurves,
  clampChartDomain,
  formatPercentileAndSds,
  interpolateOnGrid,
  inverseInterpolateOnGrid,
  sdsToPercentile,
  type NormogramResult,
} from "./normogramUtils";

export const CLITORAL_CITATION =
  "Alaei M et al. The Nomogram of Clitoral Length and Width in Iranian Term and Preterm Neonates. Front Endocrinol (Lausanne). 2020;11:297.";

export type ClitoralMeasurementKind = "length" | "width";

export interface ClitoralDimensionInput {
  gestationalAgeWeeks: number;
  lengthCm?: number;
  widthCm?: number;
}

export interface ClitoralMeasurementResult extends NormogramResult {
  kind: ClitoralMeasurementKind;
}

export interface ClitoralDimensionResult {
  gestationalAgeWeeks: number;
  measurements: ClitoralMeasurementResult[];
}

function sdPointsForRow(row: ClitoralNormogramRow, kind: ClitoralMeasurementKind) {
  const mean = kind === "length" ? row.meanLengthCm : row.meanWidthCm;
  const p1 = kind === "length" ? row.lengthP1SdCm : row.widthP1SdCm;
  const p2 = kind === "length" ? row.lengthP2SdCm : row.widthP2SdCm;
  const p3 = kind === "length" ? row.lengthP3SdCm : row.widthP3SdCm;
  const step1 = p1 - mean;
  const step2 = p2 - p1;
  const step3 = p3 - p2;

  return [
    { sds: -3, value: mean - (step1 + step2 + step3) },
    { sds: -2, value: mean - (step1 + step2) },
    { sds: -1, value: mean - step1 },
    { sds: 0, value: mean },
    { sds: 1, value: p1 },
    { sds: 2, value: p2 },
    { sds: 3, value: p3 },
  ];
}

function percentileFromSdScale(
  gaWeeks: number,
  measurement: number,
  kind: ClitoralMeasurementKind,
): { percentile: number; sds: number } {
  const nearestRow = clitoralNormogram.reduce((best, row) =>
    Math.abs(row.gaWeeks - gaWeeks) < Math.abs(best.gaWeeks - gaWeeks) ? row : best,
  );
  const scale = sdPointsForRow(nearestRow, kind);

  const values = scale.map((p) => p.value);
  const sdsGrid = scale.map((p) => p.sds);

  if (measurement <= values[0]) {
    const sds = inverseInterpolateOnGrid(values, sdsGrid, measurement);
    return { sds, percentile: sdsToPercentile(sds) };
  }
  if (measurement >= values[values.length - 1]) {
    const sds = inverseInterpolateOnGrid(values, sdsGrid, measurement);
    return { sds, percentile: sdsToPercentile(sds) };
  }

  const sds = inverseInterpolateOnGrid(values, sdsGrid, measurement);
  return { sds, percentile: sdsToPercentile(sds) };
}

function buildClitoralCurves(kind: ClitoralMeasurementKind) {
  const percentileMap: Record<number, number> = {
    3: -1.88079,
    5: -1.64485,
    50: 0,
    95: 1.64485,
    97: 1.88079,
  };

  const rows = clitoralNormogram.map((row) => {
    const scale = sdPointsForRow(row, kind);
    const mean = scale.find((p) => p.sds === 0)!.value;
    const sd = scale.find((p) => p.sds === 1)!.value - mean;
    const percentiles: Partial<Record<3 | 5 | 50 | 95 | 97, number>> = {};
    for (const [pct, z] of Object.entries(percentileMap)) {
      percentiles[Number(pct) as 3 | 5 | 50 | 95 | 97] = mean + z * sd;
    }
    return { x: row.gaWeeks, percentiles };
  });

  return buildPercentileCurves(rows, { low: 5, high: 95 });
}

function buildMeasurementResult(
  kind: ClitoralMeasurementKind,
  gestationalAgeWeeks: number,
  valueCm: number,
): ClitoralMeasurementResult {
  const curves = buildClitoralCurves(kind);
  const { percentile, sds } = percentileFromSdScale(gestationalAgeWeeks, valueCm, kind);
  const lowCurve = curves.find((c) => c.percentile === 5)!;
  const highCurve = curves.find((c) => c.percentile === 95)!;

  return {
    kind,
    curves,
    lowCurve,
    highCurve,
    patient: {
      x: gestationalAgeWeeks,
      y: valueCm,
      percentile,
      sds,
    },
    xLabel: "Gestational age",
    yLabel: kind === "length" ? "Clitoral length" : "Clitoral width",
    xUnit: "weeks",
    yUnit: "cm",
  };
}

export function calculateClitoralDimension(
  input: ClitoralDimensionInput,
): CalculatorResult<ClitoralDimensionResult> {
  const { gestationalAgeWeeks, lengthCm, widthCm } = input;
  if (gestationalAgeWeeks < 28 || gestationalAgeWeeks > 42) {
    throw new Error("Gestational age must be between 28 and 42 weeks for this nomogram.");
  }
  if ((lengthCm == null || lengthCm <= 0) && (widthCm == null || widthCm <= 0)) {
    throw new Error("Enter clitoral length and/or width.");
  }

  const measurements: ClitoralMeasurementResult[] = [];
  if (lengthCm != null && lengthCm > 0) {
    measurements.push(buildMeasurementResult("length", gestationalAgeWeeks, lengthCm));
  }
  if (widthCm != null && widthCm > 0) {
    measurements.push(buildMeasurementResult("width", gestationalAgeWeeks, widthCm));
  }

  const parts = measurements.map(
    (m) =>
      `${m.yLabel} ${m.patient.y.toFixed(2)} cm → ${formatPercentileAndSds(m.patient.percentile, m.patient.sds)}`,
  );

  return {
    value: { gestationalAgeWeeks, measurements },
    interpretation: parts.join("; ") + ".",
  };
}

export function clitoralChartDomain(result: NormogramResult) {
  const values = result.curves.flatMap((c) => c.points.map((p) => p.y));
  values.push(result.patient.y);
  const xValues = result.curves[0]?.points.map((p) => p.x) ?? [result.patient.x];
  return {
    x: clampChartDomain(xValues, 0.02),
    y: clampChartDomain(values),
  };
}

/** Interpolate mean at GA for display (unused in primary path but kept for extensions). */
export function clitoralMeanAtGa(gaWeeks: number, kind: ClitoralMeasurementKind): number {
  const grid = clitoralNormogram.map((r) => r.gaWeeks);
  const values = clitoralNormogram.map((r) =>
    kind === "length" ? r.meanLengthCm : r.meanWidthCm,
  );
  return interpolateOnGrid(grid, values, gaWeeks);
}
