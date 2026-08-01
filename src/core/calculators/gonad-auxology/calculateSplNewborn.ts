import type { CalculatorResult } from "../../types";
import { splNewbornUsaFeldman } from "../../../data/gonad-auxology/splNewbornUsaFeldman";
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
  type NormogramExtraCurve,
  type NormogramResult,
} from "./normogramUtils";

export const SPL_NEWBORN_HALIL_CITATION =
  "Halil H, Oğuz ŞS. Establishment of normative data for stretched penile length in Turkish preterm and term newborns. Turk J Pediatr. 2017;59(3):269-273.";

export const SPL_NEWBORN_FELDMAN_CITATION =
  "Feldman KW, Smith DW. Fetal phallic growth and penile standards for newborn male infants. J Pediatr. 1975;86(3):395-398. Summarized in Aaronson IA. Micropenis. J Urol. 1994;152(4):4-14.";

/** @deprecated Use SPL_NEWBORN_HALIL_CITATION */
export const SPL_NEWBORN_CITATION = SPL_NEWBORN_HALIL_CITATION;

export interface SplNewbornInput {
  gestationalAgeWeeks: number;
  splCm: number;
}

export interface SplNewbornReferenceResult extends NormogramResult {
  referenceId: "turkey-halil" | "usa-feldman";
  referenceLabel: string;
  citation: string;
  extraCurves?: NormogramExtraCurve[];
}

export interface SplNewbornCombinedResult {
  gestationalAgeWeeks: number;
  splCm: number;
  references: SplNewbornReferenceResult[];
}

const P5_Z = 1.64485;
const P95_Z = 1.64485;

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

function feldmanNewbornRowsByGa() {
  return splNewbornUsaFeldman.map((row) => ({
    x: row.gaWeeks,
    percentiles: {
      5: row.meanCm - P5_Z * row.sdCm,
      50: row.meanCm,
      95: row.meanCm + P95_Z * row.sdCm,
    },
  }));
}

function feldmanNewbornM2_5Curve(): NormogramExtraCurve {
  return {
    label: "−2.5 SD",
    points: splNewbornUsaFeldman.map((row) => ({ x: row.gaWeeks, y: row.m2_5SdCm })),
    stroke: "#dc2626",
    dash: "4 4",
  };
}

function buildHalilResult(gestationalAgeWeeks: number, splCm: number): SplNewbornReferenceResult {
  const rows = splPrematurityTurkey.map(rowToPercentiles);
  const curves = buildPercentileCurves(rows, { low: 5, high: 95 });
  const gaGrid = splPrematurityTurkey.map((r) => r.gaWeeks);
  const meanAtGa = interpolateOnGrid(
    gaGrid,
    splPrematurityTurkey.map((r) => r.meanCm),
    gestationalAgeWeeks,
  );
  const sdAtGa = interpolateOnGrid(
    gaGrid,
    splPrematurityTurkey.map((r) => r.sdCm),
    gestationalAgeWeeks,
  );
  const { percentile, sds } = percentileFromMeanSd(splCm, meanAtGa, sdAtGa);

  return {
    referenceId: "turkey-halil",
    referenceLabel: "Turkey (Halil et al., preterm/term)",
    citation: SPL_NEWBORN_HALIL_CITATION,
    curves,
    lowCurve: curves.find((c) => c.percentile === 5)!,
    highCurve: curves.find((c) => c.percentile === 95)!,
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
  };
}

function buildFeldmanNewbornResult(
  gestationalAgeWeeks: number,
  splCm: number,
): SplNewbornReferenceResult {
  const curves = buildPercentileCurves(feldmanNewbornRowsByGa(), { low: 5, high: 95 });
  const gaGrid = splNewbornUsaFeldman.map((r) => r.gaWeeks);
  const meanAtGa = interpolateOnGrid(
    gaGrid,
    splNewbornUsaFeldman.map((r) => r.meanCm),
    gestationalAgeWeeks,
  );
  const sdAtGa = interpolateOnGrid(
    gaGrid,
    splNewbornUsaFeldman.map((r) => r.sdCm),
    gestationalAgeWeeks,
  );
  const { percentile, sds } = percentileFromMeanSd(splCm, meanAtGa, sdAtGa);

  return {
    referenceId: "usa-feldman",
    referenceLabel: "USA (Feldman & Smith / Aaronson)",
    citation: SPL_NEWBORN_FELDMAN_CITATION,
    curves,
    lowCurve: curves.find((c) => c.percentile === 5)!,
    highCurve: curves.find((c) => c.percentile === 95)!,
    extraCurves: [feldmanNewbornM2_5Curve()],
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
  };
}

export function calculateSplNewborn(
  input: SplNewbornInput,
): CalculatorResult<SplNewbornCombinedResult> {
  const { gestationalAgeWeeks, splCm } = input;
  if (gestationalAgeWeeks < 26 || gestationalAgeWeeks > 41) {
    throw new Error("Gestational age must be between 26 and 41 weeks for these nomograms.");
  }
  if (splCm <= 0) {
    throw new Error("Stretched penile length must be greater than zero.");
  }

  const halil = buildHalilResult(gestationalAgeWeeks, splCm);
  const feldman = buildFeldmanNewbornResult(gestationalAgeWeeks, splCm);

  return {
    value: {
      gestationalAgeWeeks,
      splCm,
      references: [halil, feldman],
    },
    interpretation: `SPL ${splCm.toFixed(2)} cm at ${gestationalAgeWeeks} weeks gestation — Turkey (Halil) ${formatPercentileAndSds(halil.patient.percentile, halil.patient.sds)}; USA (Feldman) ${formatPercentileAndSds(feldman.patient.percentile, feldman.patient.sds)}.`,
  };
}

export function splNewbornChartDomain(
  result: NormogramResult,
  extraCurves: NormogramExtraCurve[] = [],
) {
  const values = result.curves.flatMap((c) => c.points.map((p) => p.y));
  values.push(result.patient.y);
  for (const curve of extraCurves) {
    values.push(...curve.points.map((p) => p.y));
  }
  const xValues = result.curves[0]?.points.map((p) => p.x) ?? [result.patient.x];
  return {
    x: clampChartDomain(xValues, 0.02),
    y: clampChartDomain(values),
  };
}
