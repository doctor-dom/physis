import type { CalculatorResult } from "../../types";
import {
  splChildBulgaria,
  type SplChildCentileRow,
} from "../../../data/gonad-auxology/splChildBulgaria";
import { splChildUsaFeldman } from "../../../data/gonad-auxology/splChildUsaFeldman";
import { splChildUsaSchonfeld } from "../../../data/gonad-auxology/splChildUsaSchonfeld";
import {
  buildPercentileCurves,
  clampChartDomain,
  formatPercentileAndSds,
  interpolateOnGrid,
  percentileFromDeciles,
  percentileFromP5P50P95,
  type NormogramCurve,
  type NormogramResult,
} from "./normogramUtils";

export const SPL_CHILD_BULGARIA_CITATION =
  "Tomova A et al. Growth and Development of Male External Genitalia. Arch Pediatr Adolesc Med. 2010;164(12):1152-1157.";
export const SPL_CHILD_USA_SCHONFELD_CITATION =
  "Schonfeld WA, Beebe GW. Normal Growth and Variation in the Male Genitalia from Birth to Maturity. J Urol. 1942;48(6):759-777.";
export const SPL_CHILD_USA_FELDMAN_CITATION =
  "Aaronson IA. Micropenis: Medical and Surgical Implications. J Urol. 1994;152(4):4-14. (Feldman & Smith newborn data; prepubertal age bands.)";

export interface SplChildInput {
  ageYears: number;
  splCm: number;
}

export interface SplChildReferenceResult extends NormogramResult {
  referenceId: "bulgaria" | "usa-schonfeld" | "usa-feldman";
  referenceLabel: string;
  citation: string;
}

export interface SplChildCombinedResult {
  ageYears: number;
  splCm: number;
  references: SplChildReferenceResult[];
}

function bulgariaRowsByAge() {
  const ages = [...new Set(splChildBulgaria.map((r) => r.ageYears))].sort((a, b) => a - b);
  return ages.map((age) => {
    const pick = (centile: 5 | 50 | 95) =>
      splChildBulgaria.find((r) => r.ageYears === age && r.centile === centile)!.splCm;
    return {
      x: age,
      percentiles: {
        5: pick(5),
        50: pick(50),
        95: pick(95),
      },
    };
  });
}

function schonfeldRowsByAge() {
  return splChildUsaSchonfeld.map((row) => ({
    x: row.ageYears,
    percentiles: {
      10: row.p10Cm,
      50: row.p50Cm,
      90: row.p90Cm,
    },
  }));
}

function feldmanRowsByAge() {
  return splChildUsaFeldman.map((row) => ({
    x: row.ageYears,
    percentiles: {
      5: row.p5Cm,
      50: row.p50Cm,
      95: row.p95Cm,
    },
  }));
}

function interpolateBulgariaCentiles(ageYears: number): { p5: number; p50: number; p95: number } {
  const ages = [...new Set(splChildBulgaria.map((r) => r.ageYears))].sort((a, b) => a - b);
  const pick = (centile: SplChildCentileRow["centile"]) => {
    const grid = ages.map((age) => {
      const row = splChildBulgaria.find((r) => r.ageYears === age && r.centile === centile);
      return row!.splCm;
    });
    return interpolateOnGrid(ages, grid, ageYears);
  };
  return { p5: pick(5), p50: pick(50), p95: pick(95) };
}

function interpolateSchonfeldDeciles(ageYears: number): { p10: number; p50: number; p90: number } {
  const ages = splChildUsaSchonfeld.map((r) => r.ageYears);
  const pick = (field: "p10Cm" | "p50Cm" | "p90Cm") =>
    interpolateOnGrid(
      ages,
      splChildUsaSchonfeld.map((r) => r[field]),
      ageYears,
    );
  return { p10: pick("p10Cm"), p50: pick("p50Cm"), p90: pick("p90Cm") };
}

function interpolateFeldmanCentiles(ageYears: number): { p5: number; p50: number; p95: number } {
  const ages = splChildUsaFeldman.map((r) => r.ageYears);
  const pick = (field: "p5Cm" | "p50Cm" | "p95Cm") =>
    interpolateOnGrid(
      ages,
      splChildUsaFeldman.map((r) => r[field]),
      ageYears,
    );
  return { p5: pick("p5Cm"), p50: pick("p50Cm"), p95: pick("p95Cm") };
}

function buildBulgariaResult(ageYears: number, splCm: number): SplChildReferenceResult {
  const curves = buildPercentileCurves(bulgariaRowsByAge(), { low: 5, high: 95 });
  const centiles = interpolateBulgariaCentiles(ageYears);
  const stats = percentileFromP5P50P95(splCm, centiles.p5, centiles.p50, centiles.p95);

  return {
    referenceId: "bulgaria",
    referenceLabel: "Bulgaria (Tomova et al.)",
    citation: SPL_CHILD_BULGARIA_CITATION,
    curves,
    lowCurve: curves.find((c) => c.percentile === 5)!,
    highCurve: curves.find((c) => c.percentile === 95)!,
    patient: { x: ageYears, y: splCm, ...stats },
    xLabel: "Age",
    yLabel: "Stretched penile length",
    xUnit: "years",
    yUnit: "cm",
  };
}

function buildSchonfeldResult(ageYears: number, splCm: number): SplChildReferenceResult {
  const curves = buildPercentileCurves(schonfeldRowsByAge(), { low: 10, high: 90 });
  const deciles = interpolateSchonfeldDeciles(ageYears);
  const stats = percentileFromDeciles(splCm, deciles.p10, deciles.p50, deciles.p90);

  return {
    referenceId: "usa-schonfeld",
    referenceLabel: "USA (Schonfeld & Beebe)",
    citation: SPL_CHILD_USA_SCHONFELD_CITATION,
    curves,
    lowCurve: curves.find((c) => c.percentile === 10)!,
    highCurve: curves.find((c) => c.percentile === 90)!,
    patient: { x: ageYears, y: splCm, ...stats },
    xLabel: "Age",
    yLabel: "Stretched penile length",
    xUnit: "years",
    yUnit: "cm",
  };
}

function buildFeldmanResult(ageYears: number, splCm: number): SplChildReferenceResult {
  const curves = buildPercentileCurves(feldmanRowsByAge(), { low: 5, high: 95 });
  const centiles = interpolateFeldmanCentiles(ageYears);
  const stats = percentileFromP5P50P95(splCm, centiles.p5, centiles.p50, centiles.p95);

  return {
    referenceId: "usa-feldman",
    referenceLabel: "USA (Feldman / Aaronson)",
    citation: SPL_CHILD_USA_FELDMAN_CITATION,
    curves,
    lowCurve: curves.find((c) => c.percentile === 5)!,
    highCurve: curves.find((c) => c.percentile === 95)!,
    patient: { x: ageYears, y: splCm, ...stats },
    xLabel: "Age",
    yLabel: "Stretched penile length",
    xUnit: "years",
    yUnit: "cm",
  };
}

export function calculateSplChild(input: SplChildInput): CalculatorResult<SplChildCombinedResult> {
  const { ageYears, splCm } = input;
  if (ageYears < 0 || ageYears > 19) {
    throw new Error("Age must be between 0 and 19 years for these nomograms.");
  }
  if (splCm <= 0) {
    throw new Error("Stretched penile length must be greater than zero.");
  }

  const bulgaria = buildBulgariaResult(ageYears, splCm);
  const usaSchonfeld = buildSchonfeldResult(ageYears, splCm);
  const usaFeldman = buildFeldmanResult(ageYears, splCm);

  return {
    value: {
      ageYears,
      splCm,
      references: [bulgaria, usaSchonfeld, usaFeldman],
    },
    interpretation: `SPL ${splCm.toFixed(2)} cm at age ${ageYears.toFixed(2)} y — Bulgaria ${formatPercentileAndSds(bulgaria.patient.percentile, bulgaria.patient.sds)}; USA (Schonfeld) ${formatPercentileAndSds(usaSchonfeld.patient.percentile, usaSchonfeld.patient.sds)}; USA (Feldman) ${formatPercentileAndSds(usaFeldman.patient.percentile, usaFeldman.patient.sds)}.`,
  };
}

export function splChildChartDomain(result: NormogramResult) {
  const values = result.curves.flatMap((c) => c.points.map((p) => p.y));
  values.push(result.patient.y);
  const xValues = result.curves[0]?.points.map((p) => p.x) ?? [result.patient.x];
  return {
    x: clampChartDomain(xValues, 0.02),
    y: clampChartDomain(values),
  };
}

export function pickSplChildCurves(curves: NormogramCurve[], low = 5, high = 95) {
  return {
    low: curves.find((c) => c.percentile === low)!,
    median: curves.find((c) => c.percentile === 50)!,
    high: curves.find((c) => c.percentile === high)!,
  };
}
