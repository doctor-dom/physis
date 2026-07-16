import type { CalculatorResult } from "../../types";
import {
  BP_HEIGHT_PERCENTILES,
  BP_TIER_LABELS,
  bpAgeTables,
  type BpSex,
  type BpTierKey,
} from "../../../data/bp/tables";

export type BpHeightUnit = "cm" | "in";

export type BpClassification =
  | "normal"
  | "elevated"
  | "stage1"
  | "stage2";

export interface PediatricBpInput {
  sex: BpSex;
  ageYears: number;
  height: number;
  heightUnit: BpHeightUnit;
  sbp: number;
  dbp: number;
}

export interface BpThresholdRow {
  tierKey: BpTierKey;
  tierLabel: string;
  sbpThreshold: number;
  dbpThreshold: number;
  sbpExceeded: boolean;
  dbpExceeded: boolean;
}

export interface PediatricBpOutput {
  ageYearsUsed: number;
  heightCm: number;
  heightPercentile: number;
  heightPercentileLabel: string;
  thresholds: BpThresholdRow[];
  sbpClassification: BpClassification;
  dbpClassification: BpClassification;
  overallClassification: BpClassification;
  sbpPercentileEstimate: string;
  dbpPercentileEstimate: string;
  interpretation: string;
}

const TIER_ORDER: BpTierKey[] = ["p50", "p90", "p95", "p95plus12"];
const CLASSIFICATION_RANK: Record<BpClassification, number> = {
  normal: 0,
  elevated: 1,
  stage1: 2,
  stage2: 3,
};

function linearInterpolate(x0: number, y0: number, x1: number, y1: number, x: number): number {
  if (x1 === x0) return y0;
  return y0 + ((x - x0) * (y1 - y0)) / (x1 - x0);
}

function interpolateOnGrid(xGrid: readonly number[], yGrid: readonly number[], x: number): number {
  if (x <= xGrid[0]) {
    return linearInterpolate(xGrid[0], yGrid[0], xGrid[1], yGrid[1], x);
  }
  const last = xGrid.length - 1;
  if (x >= xGrid[last]) {
    return linearInterpolate(xGrid[last - 1], yGrid[last - 1], xGrid[last], yGrid[last], x);
  }
  for (let i = 0; i < last; i++) {
    if (x >= xGrid[i] && x <= xGrid[i + 1]) {
      return linearInterpolate(xGrid[i], yGrid[i], xGrid[i + 1], yGrid[i + 1], x);
    }
  }
  return yGrid[last];
}

function inverseInterpolateOnGrid(yGrid: readonly number[], xGrid: readonly number[], y: number): number {
  if (y <= yGrid[0]) {
    return linearInterpolate(yGrid[0], xGrid[0], yGrid[1], xGrid[1], y);
  }
  const last = yGrid.length - 1;
  if (y >= yGrid[last]) {
    return linearInterpolate(yGrid[last - 1], xGrid[last - 1], yGrid[last], xGrid[last], y);
  }
  for (let i = 0; i < last; i++) {
    if (y >= yGrid[i] && y <= yGrid[i + 1]) {
      return linearInterpolate(yGrid[i], xGrid[i], yGrid[i + 1], xGrid[i + 1], y);
    }
  }
  return xGrid[last];
}

function findAgeRow(sex: BpSex, ageYears: number) {
  const ageYearsUsed = Math.min(17, Math.max(1, Math.round(ageYears)));
  const row = bpAgeTables.find((entry) => entry.sex === sex && entry.ageYears === ageYearsUsed);
  if (!row) {
    throw new Error(`No BP table row for sex and age ${ageYearsUsed}.`);
  }
  return { row, ageYearsUsed };
}

function thresholdAtHeightPercentile(
  row: (typeof bpAgeTables)[number],
  heightPercentile: number,
  tierKey: BpTierKey,
): { sbp: number; dbp: number } {
  const pctGrid = BP_HEIGHT_PERCENTILES as readonly number[];
  const tier = row.tiers[tierKey];
  return {
    sbp: Math.round(interpolateOnGrid(pctGrid, tier.sbp, heightPercentile)),
    dbp: Math.round(interpolateOnGrid(pctGrid, tier.dbp, heightPercentile)),
  };
}

function classifyBp(value: number, p90: number, p95: number, p95plus12: number): BpClassification {
  if (value < p90) return "normal";
  if (value < p95) return "elevated";
  if (value < p95plus12) return "stage1";
  return "stage2";
}

function maxClassification(a: BpClassification, b: BpClassification): BpClassification {
  return CLASSIFICATION_RANK[a] >= CLASSIFICATION_RANK[b] ? a : b;
}

function formatHeightPercentile(p: number): string {
  if (p < 5) return "< 5th height percentile";
  if (p > 95) return "> 95th height percentile";
  return `${p.toFixed(1)}th height percentile`;
}


function estimateComponentPercentileLabel(
  value: number,
  p50: number,
  p90: number,
  p95: number,
  p95plus12: number,
): string {
  if (value < p50) return "< 50th BP percentile";
  if (value < p90) return "50th–89th BP percentile";
  if (value < p95) return "90th–94th BP percentile";
  if (value < p95plus12) return "95th percentile to stage 2 threshold";
  return "≥ stage 2 threshold (95th + 12 mm Hg)";
}

function classificationLabel(c: BpClassification): string {
  switch (c) {
    case "normal":
      return "Normal BP";
    case "elevated":
      return "Elevated BP (≥ 90th percentile)";
    case "stage1":
      return "Stage 1 hypertension (≥ 95th percentile)";
    case "stage2":
      return "Stage 2 hypertension (≥ 95th percentile + 12 mm Hg)";
  }
}

export function convertHeightToCm(height: number, unit: BpHeightUnit): number {
  return unit === "cm" ? height : height * 2.54;
}

export interface HeightPercentilePreview {
  ageYearsUsed: number;
  heightCm: number;
  heightPercentile: number;
  heightPercentileLabel: string;
}

export function lookupHeightPercentile(
  sex: BpSex,
  ageYears: number,
  height: number,
  heightUnit: BpHeightUnit,
): HeightPercentilePreview | null {
  if (ageYears <= 0 || ageYears > 17 || height <= 0) {
    return null;
  }

  const heightCm = convertHeightToCm(height, heightUnit);
  const { row, ageYearsUsed } = findAgeRow(sex, ageYears);
  const heightPercentile = inverseInterpolateOnGrid(
    row.sbpHeightsCm,
    BP_HEIGHT_PERCENTILES as readonly number[],
    heightCm,
  );

  return {
    ageYearsUsed,
    heightCm,
    heightPercentile,
    heightPercentileLabel: formatHeightPercentile(heightPercentile),
  };
}

export function calculatePediatricBpPercentiles(
  input: PediatricBpInput,
): CalculatorResult<PediatricBpOutput> {
  const { sex, ageYears, height, heightUnit, sbp, dbp } = input;

  if (ageYears <= 0 || ageYears > 17) {
    throw new Error("Age must be between 1 and 17 years for the AAP 2017 BP tables.");
  }
  if (height <= 0) {
    throw new Error("Height must be greater than zero.");
  }
  if (sbp <= 0 || dbp <= 0) {
    throw new Error("SBP and DBP must be greater than zero.");
  }
  if (dbp >= sbp) {
    throw new Error("DBP must be less than SBP.");
  }

  const heightCm = convertHeightToCm(height, heightUnit);
  const { row, ageYearsUsed } = findAgeRow(sex, ageYears);
  const heightPercentile = inverseInterpolateOnGrid(
    row.sbpHeightsCm,
    BP_HEIGHT_PERCENTILES as readonly number[],
    heightCm,
  );

  const thresholds: BpThresholdRow[] = TIER_ORDER.map((tierKey) => {
    const { sbp: sbpThreshold, dbp: dbpThreshold } = thresholdAtHeightPercentile(
      row,
      heightPercentile,
      tierKey,
    );
    return {
      tierKey,
      tierLabel: BP_TIER_LABELS[tierKey],
      sbpThreshold,
      dbpThreshold,
      sbpExceeded: sbp >= sbpThreshold,
      dbpExceeded: dbp >= dbpThreshold,
    };
  });

  const p90 = thresholds.find((t) => t.tierKey === "p90")!;
  const p95 = thresholds.find((t) => t.tierKey === "p95")!;
  const p95plus12 = thresholds.find((t) => t.tierKey === "p95plus12")!;

  const sbpClassification = classifyBp(
    sbp,
    p90.sbpThreshold,
    p95.sbpThreshold,
    p95plus12.sbpThreshold,
  );
  const dbpClassification = classifyBp(
    dbp,
    p90.dbpThreshold,
    p95.dbpThreshold,
    p95plus12.dbpThreshold,
  );
  const overallClassification = maxClassification(sbpClassification, dbpClassification);

  const p50 = thresholds.find((t) => t.tierKey === "p50")!;
  const sbpPercentileEstimate = estimateComponentPercentileLabel(
    sbp,
    p50.sbpThreshold,
    p90.sbpThreshold,
    p95.sbpThreshold,
    p95plus12.sbpThreshold,
  );
  const dbpPercentileEstimate = estimateComponentPercentileLabel(
    dbp,
    p50.dbpThreshold,
    p90.dbpThreshold,
    p95.dbpThreshold,
    p95plus12.dbpThreshold,
  );

  const interpretation =
    overallClassification === "normal"
      ? `Blood pressure is below the 90th percentile for a ${sex === "male" ? "boy" : "girl"} age ${ageYearsUsed} at ${formatHeightPercentile(heightPercentile)} (${heightCm.toFixed(1)} cm) — normal per AAP 2017 Table ${sex === "male" ? "4" : "5"}.`
      : `${classificationLabel(overallClassification)} based on the higher of SBP (${sbpPercentileEstimate}) and DBP (${dbpPercentileEstimate}) per AAP 2017 guidelines.`;

  return {
    value: {
      ageYearsUsed,
      heightCm,
      heightPercentile,
      heightPercentileLabel: formatHeightPercentile(heightPercentile),
      thresholds,
      sbpClassification,
      dbpClassification,
      overallClassification,
      sbpPercentileEstimate,
      dbpPercentileEstimate,
      interpretation,
    },
    interpretation,
  };
}

export { BP_DATA_CITATION } from "../../../data/bp/tables";
