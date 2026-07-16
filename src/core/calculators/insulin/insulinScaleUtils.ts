export const DEFAULT_ROW_CADENCE_MG_DL = 50;
export const ALTERNATE_ROW_CADENCE_MG_DL = 100;
export const MAX_BG_MG_DL = 500;

export type RoundingDirection = "up" | "down" | "nearest" | "none";

export interface BgRangeRow {
  label: string;
  low: number;
  high: number;
  index: number;
}

export function getRoundingDirection(raw: number, rounded: number): RoundingDirection {
  if (raw === rounded) return "none";
  if (rounded > raw) return "up";
  if (rounded < raw) return "down";
  return "nearest";
}

export function roundToIncrement(
  value: number,
  increment: number,
): { rounded: number; direction: RoundingDirection } {
  if (increment <= 0) {
    throw new Error("Rounding increment must be greater than zero.");
  }
  const rounded = Math.round(value / increment) * increment;
  return { rounded, direction: getRoundingDirection(value, rounded) };
}

/** Standard MDI scale: first row 70–100, then +cadence. */
export function generateMdiBgRanges(rowCadenceMgDl: number): BgRangeRow[] {
  return generateBgRanges(rowCadenceMgDl, 70, 100);
}

/** Diluted insulin scale: first row 70–target, then +cadence from target+1. */
export function generateDilutedBgRanges(
  rowCadenceMgDl: number,
  bgTargetMgDl = 120,
): BgRangeRow[] {
  if (bgTargetMgDl <= 70) {
    throw new Error("BG target must be greater than 70 mg/dL.");
  }
  return generateBgRanges(rowCadenceMgDl, 70, bgTargetMgDl);
}

function generateBgRanges(
  rowCadenceMgDl: number,
  firstRowLow: number,
  firstRowHigh: number,
): BgRangeRow[] {
  if (rowCadenceMgDl <= 0) {
    throw new Error("Row cadence must be greater than zero.");
  }

  const rows: BgRangeRow[] = [
    {
      label: `${firstRowLow}-${firstRowHigh}`,
      low: firstRowLow,
      high: firstRowHigh,
      index: 0,
    },
  ];

  let nextLow = firstRowHigh + 1;
  while (nextLow <= MAX_BG_MG_DL) {
    const high = Math.min(nextLow + rowCadenceMgDl - 1, MAX_BG_MG_DL);
    rows.push({
      label: `${nextLow}-${high}`,
      low: nextLow,
      high,
      index: rows.length,
    });
    nextLow += rowCadenceMgDl;
  }

  return rows;
}

export function findRowIndexForThreshold(
  rows: BgRangeRow[],
  thresholdMgDl: number,
): number {
  const containing = rows.findIndex(
    (row) => row.low <= thresholdMgDl && row.high >= thresholdMgDl,
  );
  if (containing >= 0) return containing;

  const next = rows.findIndex((row) => row.low >= thresholdMgDl);
  if (next >= 0) return next;

  throw new Error(
    `Correction threshold ${thresholdMgDl} mg/dL is above the generated scale maximum.`,
  );
}

export function formatInsulinDose(value: number): string {
  const rounded = Math.round(value * 100) / 100;
  if (rounded % 1 === 0) return rounded.toFixed(0);
  if (rounded % 0.5 === 0) return rounded.toFixed(1);
  return rounded.toFixed(2);
}

export function formatRoundingDirection(direction: RoundingDirection): string {
  switch (direction) {
    case "up":
      return "rounded up";
    case "down":
      return "rounded down";
    case "nearest":
      return "rounded to nearest";
    default:
      return "no rounding";
  }
}
