import type { Sex } from "../../types";
import type { CalculatorResult } from "../../types";
import {
  ACUTE_SYMPTOMATIC_RISE_MMOL_FIRST_6H,
  getSodiumFluidLabel,
  getSodiumFluidNaMmoll,
  getTbwFraction,
  MAX_SODIUM_CORRECTION_MMOL_PER_24H,
  STANDARD_SODIUM_CORRECTION_MMOL_PER_24H,
  type SodiumAgeCategory,
  type SodiumFluidType,
} from "./sodiumFluids";

export type SodiumCorrectionGoal = "auto" | "raise" | "lower";

export interface SodiumCorrectionGuidanceInput {
  weightKg: number;
  ageCategory: SodiumAgeCategory;
  sex: Sex;
  serumSodiumMmoll: number;
  /** Desired correction magnitude in mmol/L per hour (always positive). */
  correctionRateMmollPerHr: number;
  fluidType: SodiumFluidType;
  correctionGoal?: SodiumCorrectionGoal;
}

export interface SodiumCorrectionGuidanceResult {
  serumSodiumMmoll: number;
  fluidType: SodiumFluidType;
  fluidLabel: string;
  fluidSodiumMmoll: number;
  tbwFraction: number;
  tbwLiters: number;
  changeInSerumSodiumPerLiter: number;
  signedCorrectionRateMmollPerHr: number;
  correctionDirection: "raise" | "lower";
  fluidRateMlPerHr: number;
  fluidVolumeLitersPer24Hr: number;
  projectedSodiumChangeMmollPer24Hr: number;
  warnings: string[];
}

const HYPONATREMIA_THRESHOLD = 135;
const HYPERNATREMIA_THRESHOLD = 145;

function resolveCorrectionDirection(
  serumSodiumMmoll: number,
  fluidSodiumMmoll: number,
  goal: SodiumCorrectionGoal,
): "raise" | "lower" {
  if (goal === "raise") return "raise";
  if (goal === "lower") return "lower";

  if (serumSodiumMmoll < HYPONATREMIA_THRESHOLD) return "raise";
  if (serumSodiumMmoll > HYPERNATREMIA_THRESHOLD) return "lower";

  return fluidSodiumMmoll >= serumSodiumMmoll ? "raise" : "lower";
}

function buildClinicalWarnings(
  input: SodiumCorrectionGuidanceInput,
  result: Omit<SodiumCorrectionGuidanceResult, "warnings">,
): string[] {
  const warnings: string[] = [];
  const { serumSodiumMmoll, correctionRateMmollPerHr, fluidType } = input;
  const {
    correctionDirection,
    changeInSerumSodiumPerLiter,
    projectedSodiumChangeMmollPer24Hr,
    fluidSodiumMmoll,
  } = result;

  if (changeInSerumSodiumPerLiter === 0) {
    warnings.push("Selected fluid sodium matches serum sodium; choose a different fluid.");
  }

  if (
    correctionDirection === "raise" &&
    fluidSodiumMmoll <= serumSodiumMmoll
  ) {
    warnings.push(
      "Selected fluid will not raise serum sodium relative to the current level.",
    );
  }

  if (
    correctionDirection === "lower" &&
    fluidSodiumMmoll >= serumSodiumMmoll
  ) {
    warnings.push(
      "Selected fluid will not lower serum sodium relative to the current level.",
    );
  }

  const projectedChangeAbsMmollPer24Hr = Math.abs(projectedSodiumChangeMmollPer24Hr);

  if (projectedChangeAbsMmollPer24Hr > MAX_SODIUM_CORRECTION_MMOL_PER_24H) {
    const changeVerb = correctionDirection === "raise" ? "rise" : "change";
    const complication =
      correctionDirection === "raise"
        ? "risk of osmotic demyelination"
        : "risk of neurologic complications from overly rapid correction";
    warnings.push(
      `Projected 24-hour ${changeVerb} (${projectedChangeAbsMmollPer24Hr.toFixed(1)} mmol/L) exceeds the maximum of ${MAX_SODIUM_CORRECTION_MMOL_PER_24H} mmol/L per 24 hours — ${complication}.`,
    );
  }

  warnings.push(
    `For hypo- or hypernatremia, expert guidance generally targets correction by no more than ${STANDARD_SODIUM_CORRECTION_MMOL_PER_24H.min}–${STANDARD_SODIUM_CORRECTION_MMOL_PER_24H.max} mmol/L per 24 hours. Do not exceed ${MAX_SODIUM_CORRECTION_MMOL_PER_24H} mmol/L in any 24-hour period.`,
  );

  if (correctionDirection === "raise") {
    if (correctionRateMmollPerHr > 0.5) {
      warnings.push(
        "Hyponatremia: correction rate exceeds 0.5 mmol/L per hour — reserve for brief symptomatic correction, then slow the rate.",
      );
    }

    const projectedSixHourRise = correctionRateMmollPerHr * 6;
    if (
      projectedSixHourRise > ACUTE_SYMPTOMATIC_RISE_MMOL_FIRST_6H.max &&
      fluidType !== "hypertonic3"
    ) {
      warnings.push(
        "Hyponatremia: for acute symptomatic cases, consider 3% hypertonic saline per local protocol for an initial 4–6 mmol/L rise in the first 6 hours, then reduce to a slower maintenance rate.",
      );
    }

    if (serumSodiumMmoll < HYPONATREMIA_THRESHOLD) {
      warnings.push(
        "Hyponatremia: chronic hyponatremia (>48 h) warrants especially cautious correction. Frequent serum sodium monitoring is essential.",
      );
    }
  }

  if (correctionDirection === "lower") {
    warnings.push(
      "Hypernatremia: correction requires free water replacement; monitor sodium and neurologic status closely with frequent labs.",
    );
  }

  warnings.push(
    "Suggested infusion rates are a starting point only — there is no substitute for close serum sodium monitoring in severe disorders.",
  );

  return warnings;
}

/**
 * IV fluid rate (mL/hr) = (1000 × correction rate, mmol/L/hr) / change in serum sodium,
 * where change in serum sodium = (fluid Na − serum Na) / (TBW + 1).
 */
export function calculateSodiumCorrectionGuidance(
  input: SodiumCorrectionGuidanceInput,
): CalculatorResult<SodiumCorrectionGuidanceResult> {
  const {
    weightKg,
    ageCategory,
    sex,
    serumSodiumMmoll,
    correctionRateMmollPerHr,
    fluidType,
    correctionGoal = "auto",
  } = input;

  if (weightKg <= 0) {
    throw new Error("Enter a weight greater than zero.");
  }
  if (serumSodiumMmoll <= 0) {
    throw new Error("Enter a valid serum sodium.");
  }
  if (correctionRateMmollPerHr <= 0) {
    throw new Error("Correction rate must be greater than zero.");
  }

  const tbwFraction = getTbwFraction(ageCategory, sex);
  const tbwLiters = weightKg * tbwFraction;
  const fluidSodiumMmoll = getSodiumFluidNaMmoll(fluidType);
  const changeInSerumSodiumPerLiter =
    (fluidSodiumMmoll - serumSodiumMmoll) / (tbwLiters + 1);

  if (changeInSerumSodiumPerLiter === 0) {
    throw new Error(
      "Selected fluid sodium equals serum sodium — choose a different fluid.",
    );
  }

  const correctionDirection = resolveCorrectionDirection(
    serumSodiumMmoll,
    fluidSodiumMmoll,
    correctionGoal,
  );

  const signedCorrectionRateMmollPerHr =
    correctionDirection === "raise"
      ? correctionRateMmollPerHr
      : -correctionRateMmollPerHr;

  if (
    (correctionDirection === "raise" && changeInSerumSodiumPerLiter < 0) ||
    (correctionDirection === "lower" && changeInSerumSodiumPerLiter > 0)
  ) {
    throw new Error(
      "Selected fluid opposes the intended correction direction — choose a different fluid or correction goal.",
    );
  }

  const fluidRateMlPerHr =
    (1000 * signedCorrectionRateMmollPerHr) / changeInSerumSodiumPerLiter;

  if (!Number.isFinite(fluidRateMlPerHr) || fluidRateMlPerHr <= 0) {
    throw new Error("Unable to calculate a positive infusion rate with these inputs.");
  }

  const fluidVolumeLitersPer24Hr = (fluidRateMlPerHr * 24) / 1000;
  const projectedSodiumChangeMmollPer24Hr =
    correctionRateMmollPerHr * 24 * (correctionDirection === "raise" ? 1 : -1);

  const baseResult = {
    serumSodiumMmoll,
    fluidType,
    fluidLabel: getSodiumFluidLabel(fluidType),
    fluidSodiumMmoll,
    tbwFraction,
    tbwLiters,
    changeInSerumSodiumPerLiter,
    signedCorrectionRateMmollPerHr,
    correctionDirection,
    fluidRateMlPerHr,
    fluidVolumeLitersPer24Hr,
    projectedSodiumChangeMmollPer24Hr,
  };

  const warnings = buildClinicalWarnings(input, baseResult);

  const directionLabel =
    correctionDirection === "raise" ? "increase" : "decrease";

  return {
    value: {
      ...baseResult,
      warnings,
    },
    interpretation: `Infuse ${baseResult.fluidLabel} at ${fluidRateMlPerHr.toFixed(1)} mL/hr to ${directionLabel} serum sodium by ${correctionRateMmollPerHr.toFixed(2)} mmol/L per hour (TBW ${tbwLiters.toFixed(1)} L).`,
    warning: warnings.find(
      (w) =>
        w.includes("osmotic demyelination") ||
        w.includes("neurologic complications") ||
        w.includes("Hyponatremia: correction rate exceeds 0.5"),
    ),
  };
}

export function formatSodiumRate(value: number): string {
  return `${value.toFixed(2)} mmol/L/hr`;
}

export function formatFluidRateMlPerHr(value: number): string {
  return `${value.toFixed(1)} mL/hr`;
}
