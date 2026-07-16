import type { CalculatorResult } from "../../types";
import {
  splPrematurityTurkey,
  type SplPrematurityTurkeyRow,
} from "../../../data/gonad-auxology/splPrematurityTurkey";
import {
  buildPercentileCurves,
  clampChartDomain,
  formatPercentileAndSds,
  interpolateOnGrid,
  percentileFromMeanSd,
  type NormogramResult,
} from "./normogramUtils";

export const SPL_NEWBORN_CITATION =
  "Halil H, Oğuz ŞS. Establishment of normative data for stretched penile length in Turkish preterm and term newborns. Turk J Pediatr. 2017;59(3):269-273.";

export interface SplNewbornInput {
  gestationalAgeWeeks: number;
  splCm: number;
}

function rowToPercentiles(row: SplPrematurityTurkeyRow) {
  return {
    x: row.gaWeeks,
    percentiles: {
      3: row.p3Cm,
      5: row.p5Cm,
      10: row.p10Cm,
      25: row.p25Cm,
      50: row.p50Cm,
      75: row.p75Cm,
      90: row.p90Cm,
      95: row.p95Cm,
      97: row.p97Cm,
    },
  };
}

export function calculateSplNewborn(
  input: SplNewbornInput,
): CalculatorResult<NormogramResult> {
  const { gestationalAgeWeeks, splCm } = input;
  if (gestationalAgeWeeks < 26 || gestationalAgeWeeks > 41) {
    throw new Error("Gestational age must be between 26 and 41 weeks for this nomogram.");
  }
  if (splCm <= 0) {
    throw new Error("Stretched penile length must be greater than zero.");
  }

  const rows = splPrematurityTurkey.map(rowToPercentiles);
  const curves = buildPercentileCurves(rows, { low: 5, high: 95 });
  const gaGrid = splPrematurityTurkey.map((r) => r.gaWeeks);
  const meanAtGa = interpolateOnGrid(gaGrid, splPrematurityTurkey.map((r) => r.meanCm), gestationalAgeWeeks);
  const sdAtGa = interpolateOnGrid(gaGrid, splPrematurityTurkey.map((r) => r.sdCm), gestationalAgeWeeks);
  const { percentile, sds } = percentileFromMeanSd(splCm, meanAtGa, sdAtGa);

  const lowCurve = curves.find((c) => c.percentile === 5)!;
  const highCurve = curves.find((c) => c.percentile === 95)!;
  const p50AtGa = interpolateOnGrid(
    splPrematurityTurkey.map((r) => r.gaWeeks),
    splPrematurityTurkey.map((r) => r.p50Cm),
    gestationalAgeWeeks,
  );

  return {
    value: {
      curves,
      lowCurve,
      highCurve,
      patient: {
        x: gestationalAgeWeeks,
        y: splCm,
        percentile,
        sds,
      },
      xLabel: "Gestational age",
      yLabel: "Stretched penile length",
      xUnit: "weeks",
      yUnit: "cm",
    },
    interpretation: `SPL ${splCm.toFixed(2)} cm at ${gestationalAgeWeeks} weeks gestation → ${formatPercentileAndSds(percentile, sds)} (median reference ${p50AtGa.toFixed(2)} cm).`,
  };
}

export function splNewbornChartDomain(result: NormogramResult) {
  const values = result.curves.flatMap((c) => c.points.map((p) => p.y));
  values.push(result.patient.y);
  const xValues = result.curves[0]?.points.map((p) => p.x) ?? [result.patient.x];
  return {
    x: clampChartDomain(xValues, 0.02),
    y: clampChartDomain(values),
  };
}
