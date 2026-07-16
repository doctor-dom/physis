import type { CalculatorResult } from "../../types";
import {
  cah2003Thresholds,
  cah2018Thresholds,
  cahIsraelThresholds,
  type Cah2003ThresholdRow,
  type Cah2018ThresholdRow,
  type CahIsraelThresholdRow,
} from "../../../data/cah/thresholds";

export type CahOhpUnit = "nmol/L" | "ng/dL" | "ng/mL";

/** 17-OHP: ng/dL per nmol/L (MW ~330.46 g/mol). */
export const NG_DL_PER_NMOL_L = 33.046;

/** 17-OHP: ng/mL per nmol/L (1 dL = 100 mL). */
export const NG_ML_PER_NMOL_L = NG_DL_PER_NMOL_L / 100;

export type Cah2018Stratification = "bw_only" | "ga_only" | "bw_and_ga";

export interface CahScreeningInput {
  ohp17: number;
  unit: CahOhpUnit;
  /** Optional — required for 2003 nomogram and for 2018 BW stratification. */
  birthWeightG?: number;
  /** Optional — required for 2018 GA stratification; with BW enables combined stratification. */
  gestationalAgeWeeks?: number;
  /** Optional — required for 2003 nomogram (Olgemöller birth weight + sample age table). */
  sampleAgeDays?: number;
}

export type Cah2003RiskLevel = "normal" | "elevated" | "markedly_elevated";
export type CahIsraelRiskLevel = "normal" | "repeat_requested" | "referral";

export interface Cah2018PercentileTierComparison {
  percentile: number;
  cutoffNmol: number;
  exceeded: boolean;
}

export interface Cah2018PercentileInsight {
  label: string;
  stratification: Cah2018Stratification;
  stratificationLabel: string;
  interpretation: string;
  ohpNmol: number;
  matchedRow: Cah2018ThresholdRow;
  estimatedPercentileLabel: string;
  tierComparisons: Cah2018PercentileTierComparison[];
  exceededPercentiles: number[];
  recommendWorkup: boolean;
}

export interface CahNomogram2003Result {
  nomogram: "2003";
  label: string;
  riskLevel: Cah2003RiskLevel;
  interpretation: string;
  ohpNmol: number;
  matchedRow: Cah2003ThresholdRow;
}

export interface CahNomogramIsraelResult {
  nomogram: "2018_israel";
  label: string;
  riskLevel: CahIsraelRiskLevel;
  interpretation: string;
  ohpNmol: number;
  matchedRow: CahIsraelThresholdRow;
  /** GA rounded up to whole weeks when provided; null if GA omitted. */
  gestationalAgeWeeksUsed: number | null;
  repeatRequestCutoffNmol: number;
  firstSampleReferralCutoffNmol: number | null;
  /** Highest repeat value still meeting >30% reduction rule (≤2500 g only). */
  maxRepeatNormalNmol: number | null;
  repeatNormalAbsoluteNmol: number | null;
  reductionMinPct: number | null;
}

export interface CahScreeningOutput {
  ohpNmol: number;
  ohpNgDl: number;
  nomogram2003: CahNomogram2003Result | null;
  nomogramIsrael: CahNomogramIsraelResult | null;
  /** Table 1 percentile context alongside Israeli screening when BW/GA available. */
  percentileInsight2018: Cah2018PercentileInsight | null;
  /** True if a screening method or percentile insight suggests further CAH workup. */
  cahSuspected: boolean;
  summary: string;
}

export function convertOhpToNmolL(value: number, unit: CahOhpUnit): number {
  switch (unit) {
    case "nmol/L":
      return value;
    case "ng/dL":
      return value / NG_DL_PER_NMOL_L;
    case "ng/mL":
      return value / NG_ML_PER_NMOL_L;
  }
}

export function convertOhpToNgDl(valueNmolL: number): number {
  return valueNmolL * NG_DL_PER_NMOL_L;
}

export function convertOhpToNgMl(valueNmolL: number): number {
  return valueNmolL * NG_ML_PER_NMOL_L;
}

function hasBirthWeight(input: CahScreeningInput): input is CahScreeningInput & { birthWeightG: number } {
  return input.birthWeightG != null && input.birthWeightG > 0;
}

function hasGestationalAge(
  input: CahScreeningInput,
): input is CahScreeningInput & { gestationalAgeWeeks: number } {
  return input.gestationalAgeWeeks != null && input.gestationalAgeWeeks > 0;
}

function hasSampleAge(input: CahScreeningInput): input is CahScreeningInput & { sampleAgeDays: number } {
  return input.sampleAgeDays != null && input.sampleAgeDays >= 0;
}

export function resolveCah2018Stratification(
  input: Pick<CahScreeningInput, "birthWeightG" | "gestationalAgeWeeks">,
): Cah2018Stratification | null {
  const hasBw = hasBirthWeight(input as CahScreeningInput);
  const hasGa = hasGestationalAge(input as CahScreeningInput);
  if (hasBw && hasGa) return "bw_and_ga";
  if (hasBw) return "bw_only";
  if (hasGa) return "ga_only";
  return null;
}

export function stratificationLabel(mode: Cah2018Stratification): string {
  switch (mode) {
    case "bw_and_ga":
      return "Both birth weight and gestational age (best-matching Table 1 row)";
    case "bw_only":
      return "Birth weight alone (best-matching Table 1 row)";
    case "ga_only":
      return "Gestational age alone (best-matching Table 1 row)";
  }
}

export function formatPercentileLabel(percentile: number): string {
  if (Number.isInteger(percentile)) {
    return `${percentile.toFixed(2)}th`;
  }
  return `${percentile}th`;
}

function sortedPercentileTiers(row: Cah2018ThresholdRow): Cah2018ThresholdRow["percentiles"] {
  return [...row.percentiles].sort((a, b) => a.percentile - b.percentile);
}

function find2003Row(
  birthWeightG: number,
  sampleAgeDays: number,
): Cah2003ThresholdRow {
  const row = cah2003Thresholds.find(
    (entry) =>
      entry.bwMinG != null &&
      birthWeightG >= entry.bwMinG &&
      birthWeightG <= entry.bwMaxG &&
      sampleAgeDays >= entry.ageMinDays &&
      sampleAgeDays <= entry.ageMaxDays,
  );
  if (!row) {
    throw new Error(
      "No 2003 nomogram row matches this birth weight and sample age.",
    );
  }
  return row;
}

function rowMatchesBw(row: Cah2018ThresholdRow, birthWeightG: number): boolean {
  return birthWeightG >= row.bwMinG && birthWeightG <= row.bwMaxG;
}

function rowMatchesGa(row: Cah2018ThresholdRow, gestationalAgeWeeks: number): boolean {
  return (
    gestationalAgeWeeks >= row.gaMinWeeks &&
    gestationalAgeWeeks <= row.gaMaxWeeks
  );
}

/** Narrower Table 1 rows win when multiple bins overlap (e.g. exact GA week vs range). */
function rowSpecificity(row: Cah2018ThresholdRow): number {
  const gaSpan =
    row.gaMaxWeeks >= 999 ? Number.POSITIVE_INFINITY : row.gaMaxWeeks - row.gaMinWeeks;
  const bwSpan =
    row.bwMaxG >= 99999 ? Number.POSITIVE_INFINITY : row.bwMaxG - row.bwMinG;
  return gaSpan + bwSpan;
}

function pickMostSpecificRow(rows: Cah2018ThresholdRow[]): Cah2018ThresholdRow {
  return rows.reduce((best, entry) =>
    rowSpecificity(entry) < rowSpecificity(best) ? entry : best,
  );
}

export function findCah2018Row(
  stratification: Cah2018Stratification,
  birthWeightG: number | undefined,
  gestationalAgeWeeks: number | undefined,
): Cah2018ThresholdRow {
  const pool = cah2018Thresholds.filter((entry) => entry.stratification === stratification);

  if (stratification === "bw_only") {
    const matches = pool.filter((entry) => rowMatchesBw(entry, birthWeightG!));
    if (matches.length === 0) {
      throw new Error("No 2018 Table 1 row matches this birth weight.");
    }
    return pickMostSpecificRow(matches);
  }

  if (stratification === "ga_only") {
    const matches = pool.filter((entry) => rowMatchesGa(entry, gestationalAgeWeeks!));
    if (matches.length === 0) {
      throw new Error("No 2018 Table 1 row matches this gestational age.");
    }
    return pickMostSpecificRow(matches);
  }

  const matches = pool.filter(
    (entry) =>
      rowMatchesBw(entry, birthWeightG!) &&
      rowMatchesGa(entry, gestationalAgeWeeks!),
  );
  if (matches.length === 0) {
    throw new Error(
      "No 2018 Table 1 row matches this birth weight and gestational age combination.",
    );
  }
  return pickMostSpecificRow(matches);
}

function rowMatchesBwIsrael(row: CahIsraelThresholdRow, birthWeightG: number): boolean {
  return birthWeightG >= row.bwMinG && birthWeightG <= row.bwMaxG;
}

function rowMatchesGaIsrael(row: CahIsraelThresholdRow, gestationalAgeWeeks: number): boolean {
  return (
    gestationalAgeWeeks >= row.gaMinWeeks &&
    gestationalAgeWeeks <= row.gaMaxWeeks
  );
}

function israelRowSpecificity(row: CahIsraelThresholdRow): number {
  const gaSpan =
    row.gaMaxWeeks >= 999 ? Number.POSITIVE_INFINITY : row.gaMaxWeeks - row.gaMinWeeks;
  const bwSpan =
    row.bwMaxG >= 99999 ? Number.POSITIVE_INFINITY : row.bwMaxG - row.bwMinG;
  return gaSpan + bwSpan;
}

export function findCahIsraelRow(
  birthWeightG: number,
  gestationalAgeWeeks: number | undefined,
): CahIsraelThresholdRow {
  const hasGa = gestationalAgeWeeks != null && gestationalAgeWeeks > 0;
  const gaWeeksUsed = hasGa ? Math.ceil(gestationalAgeWeeks) : null;

  const bwMatches = cahIsraelThresholds.filter((entry) =>
    rowMatchesBwIsrael(entry, birthWeightG),
  );

  const candidates = hasGa
    ? bwMatches.filter((entry) => rowMatchesGaIsrael(entry, gaWeeksUsed!))
    : bwMatches.filter((entry) => entry.matchesUnknownGa);

  if (candidates.length === 0) {
    throw new Error(
      "No Israeli Table 2 row matches this birth weight and gestational age combination.",
    );
  }

  return candidates.reduce((best, entry) =>
    israelRowSpecificity(entry) < israelRowSpecificity(best) ? entry : best,
  );
}

export function formatCahIsraelMatchedRow(row: CahIsraelThresholdRow): string {
  return row.rowLabel ?? `BW ${row.bwMinG}–${row.bwMaxG >= 99999 ? "∞" : row.bwMaxG} g`;
}

export function evaluateCahIsraelNomogram(
  ohpNmol: number,
  birthWeightG: number,
  gestationalAgeWeeks: number | undefined,
): CahNomogramIsraelResult {
  const matchedRow = findCahIsraelRow(birthWeightG, gestationalAgeWeeks);
  const hasGa = gestationalAgeWeeks != null && gestationalAgeWeeks > 0;
  const gestationalAgeWeeksUsed = hasGa ? Math.ceil(gestationalAgeWeeks) : null;
  const tableRow = formatCahIsraelMatchedRow(matchedRow);
  const {
    repeatRequestCutoffNmol,
    firstSampleReferralCutoffNmol,
    repeatNormalRule,
    repeatNormalAbsoluteNmol,
    reductionMinPct,
  } = matchedRow;

  const referralTriggered =
    firstSampleReferralCutoffNmol != null &&
    ohpNmol >= firstSampleReferralCutoffNmol;
  const repeatRequested = ohpNmol >= repeatRequestCutoffNmol;

  let riskLevel: CahIsraelRiskLevel;
  let interpretation: string;

  if (referralTriggered) {
    riskLevel = "referral";
    interpretation = `17-OHP is ≥ ${firstSampleReferralCutoffNmol} nmol/L on the first sample — refer for CAH evaluation per Israeli Table 2 (${tableRow}).`;
  } else if (repeatRequested) {
    riskLevel = "repeat_requested";
    interpretation = `17-OHP exceeds the Table 2 repeat-request cutoff for ${tableRow} (${repeatRequestCutoffNmol} nmol/L) — request a repeat sample per Israeli NBS algorithm.`;
  } else {
    riskLevel = "normal";
    interpretation = `17-OHP is below the Table 2 repeat-request cutoff for ${tableRow} (${repeatRequestCutoffNmol} nmol/L) — no repeat indicated by this algorithm.`;
  }

  const maxRepeatNormalNmol =
    repeatNormalRule === "reduction_gt_30" &&
    repeatRequested &&
    reductionMinPct != null
      ? ohpNmol * (1 - reductionMinPct / 100)
      : null;

  if (repeatRequested && repeatNormalRule === "reduction_gt_30" && maxRepeatNormalNmol != null) {
    interpretation += ` On repeat, a normal result requires >${reductionMinPct}% reduction from the initial ${ohpNmol.toFixed(1)} nmol/L — i.e. repeat 17-OHP below ${maxRepeatNormalNmol.toFixed(1)} nmol/L.`;
  } else if (repeatNormalRule === "absolute_lt" && repeatNormalAbsoluteNmol != null) {
    interpretation += ` On repeat, a normal result is 17-OHP < ${repeatNormalAbsoluteNmol} nmol/L (independent of the initial value).`;
    if (firstSampleReferralCutoffNmol != null) {
      interpretation += ` First-sample values ≥ ${firstSampleReferralCutoffNmol} nmol/L warrant CAH evaluation regardless of repeat criteria.`;
    }
  }

  return {
    nomogram: "2018_israel",
    label: "CAH-2018 Israeli NBS algorithm (Table 2)",
    riskLevel,
    interpretation,
    ohpNmol,
    matchedRow,
    gestationalAgeWeeksUsed,
    repeatRequestCutoffNmol,
    firstSampleReferralCutoffNmol,
    maxRepeatNormalNmol,
    repeatNormalAbsoluteNmol,
    reductionMinPct,
  };
}

export function formatCah2018MatchedRow(row: Cah2018ThresholdRow): string {
  if (row.rowLabel) {
    return row.rowLabel;
  }
  if (row.stratification === "bw_only") {
    return `BW ${row.bwMinG}–${row.bwMaxG >= 99999 ? "∞" : row.bwMaxG} g`;
  }
  if (row.stratification === "ga_only") {
    return `GA ${row.gaMinWeeks}–${row.gaMaxWeeks >= 999 ? "∞" : row.gaMaxWeeks} wk`;
  }
  return `GA ${row.gaMinWeeks}–${row.gaMaxWeeks >= 999 ? "∞" : row.gaMaxWeeks} wk, BW ${row.bwMinG}–${row.bwMaxG >= 99999 ? "∞" : row.bwMaxG} g`;
}

export function evaluateCah2018PercentileInsight(
  ohpNmol: number,
  stratification: Cah2018Stratification,
  birthWeightG: number | undefined,
  gestationalAgeWeeks: number | undefined,
): Cah2018PercentileInsight {
  const matchedRow = findCah2018Row(stratification, birthWeightG, gestationalAgeWeeks);
  const tiers = sortedPercentileTiers(matchedRow);
  const tableRow = formatCah2018MatchedRow(matchedRow);

  const tierComparisons = tiers.map((tier) => ({
    percentile: tier.percentile,
    cutoffNmol: tier.cutoffNmol,
    exceeded: ohpNmol > tier.cutoffNmol,
  }));
  const exceeded = tierComparisons.filter((tier) => tier.exceeded);
  const exceededPercentiles = exceeded.map((tier) => tier.percentile);
  const recommendWorkup = exceeded.length > 0;

  let estimatedPercentileLabel: string;
  if (exceeded.length === 0) {
    const lowest = tiers[0];
    estimatedPercentileLabel = `At or below ${formatPercentileLabel(lowest.percentile)} percentile (≤ ${lowest.cutoffNmol} nmol/L)`;
  } else if (exceeded.length === tiers.length) {
    const highest = tiers[tiers.length - 1];
    estimatedPercentileLabel = `Above ${formatPercentileLabel(highest.percentile)} percentile (> ${highest.cutoffNmol} nmol/L)`;
  } else {
    const highestExceeded = exceeded[exceeded.length - 1];
    const nextTier = tiers.find((tier) => tier.percentile > highestExceeded.percentile)!;
    estimatedPercentileLabel = `Above ${formatPercentileLabel(highestExceeded.percentile)} percentile (${highestExceeded.cutoffNmol}–${nextTier.cutoffNmol} nmol/L)`;
  }

  let interpretation: string;
  if (recommendWorkup) {
    const exceededLabels = exceeded
      .map((tier) => `${formatPercentileLabel(tier.percentile)} (${tier.cutoffNmol} nmol/L)`)
      .join(", ");
    interpretation = `17-OHP exceeds one or more Table 1 percentile thresholds for ${tableRow}: ${exceededLabels}. Consider further CAH workup in conjunction with the Israeli NBS algorithm and clinical context (Pode-Shakked 2019).`;
  } else {
    interpretation = `17-OHP does not exceed any published Table 1 percentile threshold for ${tableRow}. Estimated position: ${estimatedPercentileLabel}.`;
  }

  return {
    label: "Pode-Shakked 2019 Table 1 percentile insight",
    stratification,
    stratificationLabel: stratificationLabel(stratification),
    interpretation,
    ohpNmol,
    matchedRow,
    estimatedPercentileLabel,
    tierComparisons,
    exceededPercentiles,
    recommendWorkup,
  };
}

export function evaluateCah2003Nomogram(
  ohpNmol: number,
  birthWeightG: number,
  sampleAgeDays: number,
): CahNomogram2003Result {
  const matchedRow = find2003Row(birthWeightG, sampleAgeDays);
  const { normalMaxNmol, elevatedMaxNmol } = matchedRow;

  let riskLevel: Cah2003RiskLevel;
  let interpretation: string;

  if (ohpNmol <= normalMaxNmol) {
    riskLevel = "normal";
    interpretation =
      "17-OHP is within the normal range for birth weight and sample age (Olgemöller 2003). CAH is not suggested by this nomogram.";
  } else if (ohpNmol <= elevatedMaxNmol) {
    riskLevel = "elevated";
    interpretation =
      "17-OHP is elevated — CAH possible. Consider low-urgency recall and repeat sampling per Olgemöller 2003 tiers.";
  } else {
    riskLevel = "markedly_elevated";
    interpretation =
      "17-OHP is markedly elevated — CAH probable. Consider high-urgency recall and urgent pediatric endocrinology referral (Olgemöller 2003).";
  }

  return {
    nomogram: "2003",
    label: "CAH-2003 (birth weight + sample age)",
    riskLevel,
    interpretation,
    ohpNmol,
    matchedRow,
  };
}

/** Human-readable tier boundaries for Olgemöller 2003 matched-row footnotes. */
export function formatCah2003ThresholdSummary(row: Cah2003ThresholdRow): string {
  const { normalMaxNmol, elevatedMaxNmol } = row;
  if (elevatedMaxNmol <= normalMaxNmol) {
    return `normal ≤ ${normalMaxNmol} nmol/L; above ${normalMaxNmol} nmol/L = markedly elevated`;
  }
  return `normal ≤ ${normalMaxNmol} nmol/L; elevated > ${normalMaxNmol} and ≤ ${elevatedMaxNmol} nmol/L; markedly elevated > ${elevatedMaxNmol} nmol/L`;
}

export function calculateCahScreening(
  input: CahScreeningInput,
): CalculatorResult<CahScreeningOutput> {
  const { ohp17, unit } = input;

  if (ohp17 <= 0) {
    throw new Error("17-OHP must be greater than zero.");
  }
  if (input.birthWeightG != null && input.birthWeightG <= 0) {
    throw new Error("Birth weight must be greater than zero when provided.");
  }
  if (input.gestationalAgeWeeks != null) {
    if (input.gestationalAgeWeeks <= 0 || input.gestationalAgeWeeks > 45) {
      throw new Error("Enter gestational age between 1 and 45 weeks when provided.");
    }
  }
  if (input.sampleAgeDays != null && input.sampleAgeDays < 0) {
    throw new Error("Sample age cannot be negative.");
  }

  const canRun2003 = hasBirthWeight(input) && hasSampleAge(input);
  const canRunIsrael = hasBirthWeight(input);
  const stratification = resolveCah2018Stratification(input);
  const canRunPercentileInsight = stratification != null;

  if (!canRun2003 && !canRunIsrael && !canRunPercentileInsight) {
    throw new Error(
      "Enter birth weight for the Israeli NBS algorithm (and optional GA), birth weight and sample age for Olgemöller 2003, or birth weight and/or gestational age for Table 1 percentile insight.",
    );
  }

  const ohpNmol = convertOhpToNmolL(ohp17, unit);
  const ohpNgDl = convertOhpToNgDl(ohpNmol);

  const nomogram2003 = canRun2003
    ? evaluateCah2003Nomogram(ohpNmol, input.birthWeightG, input.sampleAgeDays)
    : null;

  const percentileInsight2018 = stratification
    ? evaluateCah2018PercentileInsight(
        ohpNmol,
        stratification,
        input.birthWeightG,
        input.gestationalAgeWeeks,
      )
    : null;

  const nomogramIsrael = canRunIsrael
    ? evaluateCahIsraelNomogram(
        ohpNmol,
        input.birthWeightG,
        input.gestationalAgeWeeks,
      )
    : null;

  const screeningAbnormal =
    nomogram2003?.riskLevel !== "normal" ||
    nomogramIsrael?.riskLevel === "referral";
  const percentileWorkup = percentileInsight2018?.recommendWorkup ?? false;

  const cahSuspected = screeningAbnormal || percentileWorkup;

  let summary: string;
  if (!cahSuspected) {
    summary =
      "Neither screening method nor Table 1 percentile thresholds suggest further CAH workup. Correlate with clinical findings and local screening protocol.";
  } else if (
    nomogram2003?.riskLevel === "markedly_elevated" ||
    nomogramIsrael?.riskLevel === "referral"
  ) {
    summary =
      "CAH is suspected on screening — prioritize urgent follow-up and endocrine evaluation.";
  } else if (percentileWorkup && !screeningAbnormal) {
    summary =
      "Table 1 percentile thresholds are exceeded — consider further CAH workup alongside the Israeli NBS algorithm result.";
  } else {
    summary =
      "At least one screening method or percentile threshold suggests further evaluation — follow recall / repeat testing per local protocol.";
  }

  return {
    value: {
      ohpNmol,
      ohpNgDl,
      nomogram2003,
      nomogramIsrael,
      percentileInsight2018,
      cahSuspected,
      summary,
    },
    interpretation: summary,
  };
}

export const CAH_2003_CITATION =
  "Olgemöller B, Roscher AA, Liebl B, Fingerhut R. J Clin Endocrinol Metab. 2003;88(12):5790-5794. doi:10.1210/jc.2002-021732";

export const CAH_2018_CITATION =
  "Pode-Shakked N, Blau A, Pode-Shakked B, et al. J Clin Endocrinol Metab. 2019;104(8):3172-3180. doi:10.1210/jc.2018-02468";

export const CAH_ISRAEL_CITATION = CAH_2018_CITATION;
