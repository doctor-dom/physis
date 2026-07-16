import type { CalculatorResult } from "../../types";
import {
  getSteroidPotency,
  type SteroidPotencyEntry,
} from "../../../data/steroid/potencies";
import { formatMgM2PerDay } from "./calculateSteroidWeanSchedule";

export interface SteroidDoseInput {
  steroidId: string;
  /** Total daily dose of selected steroid (mg/day). */
  dailyDoseMg: number;
  bsaM2: number;
}

export interface SteroidDoseOutput {
  steroid: SteroidPotencyEntry;
  dailyDoseMg: number;
  hctEquivalentMgPerDay: number;
  hctEquivalentMgPerM2PerDay: number;
}

/** Hydrocortisone-equivalent daily dose = daily dose × relative HCT potency. */
export function calculateSteroidDose(
  input: SteroidDoseInput,
): CalculatorResult<SteroidDoseOutput> {
  const steroid = getSteroidPotency(input.steroidId);
  if (!steroid) {
    throw new Error("Select a valid steroid.");
  }
  if (input.dailyDoseMg <= 0) {
    throw new Error("Total daily dose must be greater than zero.");
  }
  if (input.bsaM2 <= 0) {
    throw new Error("BSA must be greater than zero.");
  }

  const hctEquivalentMgPerDay = input.dailyDoseMg * steroid.hctPotency;
  const hctEquivalentMgPerM2PerDay = hctEquivalentMgPerDay / input.bsaM2;

  return {
    value: {
      steroid,
      dailyDoseMg: input.dailyDoseMg,
      hctEquivalentMgPerDay,
      hctEquivalentMgPerM2PerDay,
    },
    interpretation: `${steroid.label} ${formatMgM2PerDay(input.dailyDoseMg / input.bsaM2)} ≈ ${formatMgM2PerDay(hctEquivalentMgPerM2PerDay)} hydrocortisone equivalent.`,
  };
}
