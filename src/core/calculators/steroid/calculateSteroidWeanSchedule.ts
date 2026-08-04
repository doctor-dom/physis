import type { SteroidDoseOutput } from "./calculateSteroidDose";

/**
 * Steroid wean dosing rules:
 * - PO hydrocortisone (wean/maintenance/stress): 1.25 mg increments; prefer equal TID,
 *   then AM-larger TID, then BID (omit evening), then morning-only.
 * - IV hydrocortisone (wean/stress): equal QID, each dose to 1 decimal place.
 * - Anesthesia / severe illness (100 mg/m², max 100 mg): single-dose ceil rules;
 *   follow-up PO on 5 mg tablets (equal-first); follow-up IV QID whole mg.
 */

export const HCT_WEAN_THRESHOLD_MG_M2 = 30;
export const WEAN_STAGE_MG_M2 = [30, 20, 10, 8, 5, 3] as const;
export const PO_HCT_DOSE_INCREMENT_MG = 1.25;
/** @deprecated Use PO_HCT_DOSE_INCREMENT_MG — PO-only rule. */
export const DOSE_INCREMENT_MG = PO_HCT_DOSE_INCREMENT_MG;
/** Anesthesia / severe-illness PO tablet increment (ceil). */
export const PO_ANESTHESIA_TABLET_MG = 5;

export const IV_DOSE_DECIMAL_PLACES = 1;

export const MAINTENANCE_MG_M2_MIN = 8;
export const MAINTENANCE_MG_M2_MAX = 10;
export const STRESS_MG_M2 = 30;
export const ANESTHESIA_MG_M2 = 100;
export const ANESTHESIA_MAX_MG = 100;
/** Below this raw single dose (mg), ceil to whole mg; at/above, ceil to 5 mg. */
export const ANESTHESIA_WHOLE_MG_CEIL_BELOW = 25;

export const STRESS_DOSE_INDICATIONS =
  "Use stress dosing for fever, emesis, significant injury, or severe diarrhea.";

export interface PoTidDoses {
  morning: number;
  midday: number;
  evening: number;
  totalDaily: number;
  schedule: "tid" | "bid";
}

export interface IvQidDoses {
  dose1: number;
  dose2: number;
  dose3: number;
  dose4: number;
  totalDaily: number;
}

export interface WeanStageRow {
  /** Target hydrocortisone dose (mg/m²/day). */
  targetMgPerM2PerDay: number;
  /** Unrounded target total daily dose (mg/day). */
  targetTotalDailyMg: number;
  /** Actual mg/m²/day after PO dose rounding (1.25 mg increments). */
  actualPoMgPerM2PerDay: number;
  /** Actual mg/m²/day from IV QID split (1 decimal place per dose; no PO increment rule). */
  actualIvMgPerM2PerDay: number;
  po: PoTidDoses;
  iv: IvQidDoses;
}

export interface TransitionToWean {
  currentSteroidLabel: string;
  /** Current steroid total daily dose (mg/day). */
  currentSteroidDoseMg: number;
  /** Current steroid dose (mg/m²/day). */
  currentSteroidMgPerM2PerDay: number;
  /** Hydrocortisone-equivalent dose (mg/m²/day). */
  hctEquivalentMgPerM2PerDay: number;
  /** Hydrocortisone-equivalent total daily (mg/day). */
  hctEquivalentMgPerDay: number;
  atOrBelowWeanThreshold: boolean;
  /** Rounded daily dose of current steroid to reach wean threshold (prescribing). */
  thresholdCurrentSteroidDoseMg?: number;
  /** mg/m²/day of current steroid at recommended dose. */
  thresholdCurrentSteroidMgPerM2PerDay?: number;
  /** HCT-equivalent mg/day at recommended dose. */
  thresholdHctDoseMg?: number;
  /** HCT-equivalent mg/m²/day at recommended dose (≥ 30). */
  thresholdHctMgPerM2PerDay?: number;
}

export interface MaintenanceDosing {
  targetMgPerM2PerDay: number;
  targetTotalDailyMg: number;
  actualMgPerM2PerDay: number;
  po: PoTidDoses;
}

export interface StressDosing {
  targetMgPerM2PerDay: number;
  targetTotalDailyMg: number;
  actualPoMgPerM2PerDay: number;
  actualIvMgPerM2PerDay: number;
  po: PoTidDoses;
  iv: IvQidDoses;
}

export interface AnesthesiaDosing {
  singleDoseMg: number;
  /** Target intensity for single dose (mg/m²), before absolute max. */
  singleDoseTargetMgPerM2: number;
  /** Actual single-dose intensity after rounding (mg/m²). */
  singleDoseMgPerM2: number;
  followUpTotalDailyMg: number;
  followUpTargetMgPerM2PerDay: number;
  followUpActualPoMgPerM2PerDay: number;
  followUpActualIvMgPerM2PerDay: number;
  followUpPo: PoTidDoses;
  followUpIv: IvQidDoses;
}

export interface SteroidWeanSchedule {
  bsaM2: number;
  /** When false, structured wean tables are omitted (no existing steroid entered). */
  includeWeanSchedule: boolean;
  transition: TransitionToWean | null;
  weanStages: WeanStageRow[];
  maintenance: MaintenanceDosing[];
  stress: StressDosing;
  anesthesia: AnesthesiaDosing;
}

function nearlyEqual(a: number, b: number, eps = 1e-9): boolean {
  return Math.abs(a - b) < eps;
}

/** Round PO hydrocortisone to nearest 1.25 mg; values below 1.25 mg become 0. */
export function roundPoSteroidDoseMg(doseMg: number): number {
  if (doseMg < PO_HCT_DOSE_INCREMENT_MG) return 0;
  return (
    Math.round(doseMg / PO_HCT_DOSE_INCREMENT_MG) * PO_HCT_DOSE_INCREMENT_MG
  );
}

/** @deprecated Use roundPoSteroidDoseMg */
export const roundSteroidDoseMg = roundPoSteroidDoseMg;

export function roundToDoseIncrement(
  doseMg: number,
  increment: number,
  mode: "nearest" | "ceil" = "nearest",
): number {
  if (doseMg <= 0) return 0;
  if (mode === "ceil") {
    return Math.ceil(doseMg / increment - 1e-12) * increment;
  }
  return Math.round(doseMg / increment) * increment;
}

/** IV doses round to one decimal place (formulation constraint; not PO 1.25 mg increments). */
export function roundIvSteroidDoseMg(doseMg: number): number {
  if (doseMg <= 0) return 0;
  const factor = 10 ** IV_DOSE_DECIMAL_PLACES;
  return Math.round(doseMg * factor) / factor;
}

/** Anesthesia follow-up IV: nearest whole mg. */
export function roundIvWholeMg(doseMg: number): number {
  if (doseMg <= 0) return 0;
  return Math.round(doseMg);
}

export function dailyMgFromMgM2(mgPerM2: number, bsaM2: number): number {
  return mgPerM2 * bsaM2;
}

export function actualMgPerM2PerDay(totalDailyMg: number, bsaM2: number): number {
  return totalDailyMg / bsaM2;
}

/**
 * Prefer equal doses on an increment grid:
 * 1) equal TID when total units divisible by 3
 * 2) unequal TID with morning ≥ midday ≥ evening
 * 3) equal BID, else morning-larger BID
 * 4) morning-only
 */
export function splitPoEqualPreferred(
  totalDailyMg: number,
  increment: number,
  options?: { totalRounding?: "nearest" | "ceil" },
): PoTidDoses {
  const totalRounding = options?.totalRounding ?? "nearest";
  let total = roundToDoseIncrement(totalDailyMg, increment, totalRounding);
  if (totalRounding === "nearest" && total > 0 && total < increment) {
    total = 0;
  }
  if (total <= 0) {
    return { morning: 0, midday: 0, evening: 0, totalDaily: 0, schedule: "tid" };
  }

  const units = Math.round(total / increment);

  if (units >= 3 && units % 3 === 0) {
    const each = (units / 3) * increment;
    return {
      morning: each,
      midday: each,
      evening: each,
      totalDaily: each * 3,
      schedule: "tid",
    };
  }

  if (units >= 3) {
    const base = Math.floor(units / 3);
    let rem = units % 3;
    let mU = base;
    let midU = base;
    let eU = base;
    while (rem > 0) {
      if (mU <= midU && mU <= eU) {
        mU += 1;
      } else if (midU <= eU) {
        midU += 1;
      } else {
        eU += 1;
      }
      rem -= 1;
    }
    const sorted = [mU, midU, eU].sort((a, b) => b - a);
    return {
      morning: sorted[0] * increment,
      midday: sorted[1] * increment,
      evening: sorted[2] * increment,
      totalDaily: units * increment,
      schedule: "tid",
    };
  }

  if (units >= 2) {
    if (units % 2 === 0) {
      const each = (units / 2) * increment;
      return {
        morning: each,
        midday: each,
        evening: 0,
        totalDaily: each * 2,
        schedule: "bid",
      };
    }
    const morningU = Math.ceil(units / 2);
    const middayU = units - morningU;
    return {
      morning: morningU * increment,
      midday: middayU * increment,
      evening: 0,
      totalDaily: units * increment,
      schedule: "bid",
    };
  }

  return {
    morning: units * increment,
    midday: 0,
    evening: 0,
    totalDaily: units * increment,
    schedule: "bid",
  };
}

/** PO hydrocortisone for wean / maintenance / stress — equal-first on 1.25 mg. */
export function splitPoHydrocortisoneTid(totalDailyMg: number): PoTidDoses {
  return splitPoEqualPreferred(totalDailyMg, PO_HCT_DOSE_INCREMENT_MG, {
    totalRounding: "nearest",
  });
}

/** Anesthesia follow-up PO — equal-first on 5 mg tablet steps (ceil total). */
export function splitPoAnesthesiaTid(totalDailyMg: number): PoTidDoses {
  return splitPoEqualPreferred(totalDailyMg, PO_ANESTHESIA_TABLET_MG, {
    totalRounding: "ceil",
  });
}

/**
 * IV hydrocortisone QID — equal split of target daily dose, each dose to 1 decimal place.
 * Unlike PO, IV is not restricted to 1.25 mg tablet increments.
 */
export function splitIvHydrocortisoneQid(totalDailyMg: number): IvQidDoses {
  if (totalDailyMg <= 0) {
    return { dose1: 0, dose2: 0, dose3: 0, dose4: 0, totalDaily: 0 };
  }

  const perDose = totalDailyMg / 4;
  const dose1 = roundIvSteroidDoseMg(perDose);
  const dose2 = roundIvSteroidDoseMg(perDose);
  const dose3 = roundIvSteroidDoseMg(perDose);
  const dose4 = roundIvSteroidDoseMg(totalDailyMg - dose1 - dose2 - dose3);

  return {
    dose1,
    dose2,
    dose3,
    dose4,
    totalDaily: dose1 + dose2 + dose3 + dose4,
  };
}

/** Anesthesia follow-up IV QID — equal split, each dose nearest whole mg. */
export function splitIvHydrocortisoneQidWholeMg(totalDailyMg: number): IvQidDoses {
  if (totalDailyMg <= 0) {
    return { dose1: 0, dose2: 0, dose3: 0, dose4: 0, totalDaily: 0 };
  }

  const perDose = totalDailyMg / 4;
  const dose1 = roundIvWholeMg(perDose);
  const dose2 = roundIvWholeMg(perDose);
  const dose3 = roundIvWholeMg(perDose);
  const dose4 = Math.max(0, roundIvWholeMg(totalDailyMg - dose1 - dose2 - dose3));

  return {
    dose1,
    dose2,
    dose3,
    dose4,
    totalDaily: dose1 + dose2 + dose3 + dose4,
  };
}

/**
 * Anesthesia / severe illness single IV/IM dose:
 * raw = min(100, 100 × BSA); if raw < 25 ceil to integer, else ceil to 5 mg.
 */
export function anesthesiaSingleDoseMg(bsaM2: number): number {
  const raw = Math.min(ANESTHESIA_MAX_MG, ANESTHESIA_MG_M2 * bsaM2);
  if (raw <= 0) return 0;
  if (raw < ANESTHESIA_WHOLE_MG_CEIL_BELOW) {
    return Math.ceil(raw - 1e-12);
  }
  return Math.ceil(raw / 5 - 1e-12) * 5;
}

/** Prefer whole numbers; otherwise one decimal place. */
export function roundPreferWholeOrOneDecimal(value: number): number {
  const roundedWhole = Math.round(value);
  if (Math.abs(value - roundedWhole) < 0.06) {
    return roundedWhole;
  }
  return Math.round(value * 10) / 10;
}

export function recommendWeanThresholdCurrentSteroidDose(
  hctPotency: number,
  bsaM2: number,
): {
  doseMg: number;
  steroidMgPerM2PerDay: number;
  hctMgPerM2PerDay: number;
  hctDoseMg: number;
} {
  let doseMg = roundPreferWholeOrOneDecimal(
    (HCT_WEAN_THRESHOLD_MG_M2 * bsaM2) / hctPotency,
  );
  if (doseMg <= 0) {
    doseMg = 0.1;
  }

  let hctMgPerM2PerDay = (doseMg * hctPotency) / bsaM2;
  let guard = 0;
  while (hctMgPerM2PerDay + 1e-9 < HCT_WEAN_THRESHOLD_MG_M2 && guard < 200) {
    doseMg = Math.round((doseMg + 0.1) * 10) / 10;
    hctMgPerM2PerDay = (doseMg * hctPotency) / bsaM2;
    guard += 1;
  }

  doseMg = roundPreferWholeOrOneDecimal(doseMg);
  hctMgPerM2PerDay = (doseMg * hctPotency) / bsaM2;
  guard = 0;
  while (hctMgPerM2PerDay + 1e-9 < HCT_WEAN_THRESHOLD_MG_M2 && guard < 200) {
    doseMg = roundPreferWholeOrOneDecimal(doseMg + 0.1);
    hctMgPerM2PerDay = (doseMg * hctPotency) / bsaM2;
    guard += 1;
  }

  return {
    doseMg,
    steroidMgPerM2PerDay: doseMg / bsaM2,
    hctMgPerM2PerDay,
    hctDoseMg: doseMg * hctPotency,
  };
}

export function buildTransitionToWean(
  steroid: SteroidDoseOutput,
  bsaM2: number,
): TransitionToWean {
  const atOrBelowWeanThreshold =
    steroid.hctEquivalentMgPerM2PerDay <= HCT_WEAN_THRESHOLD_MG_M2;

  const base: TransitionToWean = {
    currentSteroidLabel: steroid.steroid.label,
    currentSteroidDoseMg: steroid.dailyDoseMg,
    currentSteroidMgPerM2PerDay: steroid.dailyDoseMg / bsaM2,
    hctEquivalentMgPerM2PerDay: steroid.hctEquivalentMgPerM2PerDay,
    hctEquivalentMgPerDay: steroid.hctEquivalentMgPerDay,
    atOrBelowWeanThreshold,
  };

  if (atOrBelowWeanThreshold) {
    return base;
  }

  const recommendation = recommendWeanThresholdCurrentSteroidDose(
    steroid.steroid.hctPotency,
    bsaM2,
  );

  return {
    ...base,
    thresholdCurrentSteroidDoseMg: recommendation.doseMg,
    thresholdCurrentSteroidMgPerM2PerDay: recommendation.steroidMgPerM2PerDay,
    thresholdHctDoseMg: recommendation.hctDoseMg,
    thresholdHctMgPerM2PerDay: recommendation.hctMgPerM2PerDay,
  };
}

export function buildSteroidWeanSchedule(
  bsaM2: number,
  currentSteroid: SteroidDoseOutput | null,
): SteroidWeanSchedule {
  if (bsaM2 <= 0) {
    throw new Error("BSA must be greater than zero.");
  }

  const weanStages: WeanStageRow[] = WEAN_STAGE_MG_M2.map((mgPerM2) => {
    const targetTotalDailyMg = dailyMgFromMgM2(mgPerM2, bsaM2);
    const po = splitPoHydrocortisoneTid(targetTotalDailyMg);
    const iv = splitIvHydrocortisoneQid(targetTotalDailyMg);
    return {
      targetMgPerM2PerDay: mgPerM2,
      targetTotalDailyMg,
      actualPoMgPerM2PerDay: actualMgPerM2PerDay(po.totalDaily, bsaM2),
      actualIvMgPerM2PerDay: actualMgPerM2PerDay(iv.totalDaily, bsaM2),
      po,
      iv,
    };
  });

  const maintenance: MaintenanceDosing[] = [
    MAINTENANCE_MG_M2_MIN,
    MAINTENANCE_MG_M2_MAX,
  ].map((mgPerM2) => {
    const targetTotalDailyMg = dailyMgFromMgM2(mgPerM2, bsaM2);
    const po = splitPoHydrocortisoneTid(targetTotalDailyMg);
    return {
      targetMgPerM2PerDay: mgPerM2,
      targetTotalDailyMg,
      actualMgPerM2PerDay: actualMgPerM2PerDay(po.totalDaily, bsaM2),
      po,
    };
  });

  const stressTargetTotal = dailyMgFromMgM2(STRESS_MG_M2, bsaM2);
  const stressPo = splitPoHydrocortisoneTid(stressTargetTotal);
  const stressIv = splitIvHydrocortisoneQid(stressTargetTotal);
  const stress: StressDosing = {
    targetMgPerM2PerDay: STRESS_MG_M2,
    targetTotalDailyMg: stressTargetTotal,
    actualPoMgPerM2PerDay: actualMgPerM2PerDay(stressPo.totalDaily, bsaM2),
    actualIvMgPerM2PerDay: actualMgPerM2PerDay(stressIv.totalDaily, bsaM2),
    po: stressPo,
    iv: stressIv,
  };

  const followUpTotal = anesthesiaSingleDoseMg(bsaM2);
  const followUpPo = splitPoAnesthesiaTid(followUpTotal);
  const followUpIv = splitIvHydrocortisoneQidWholeMg(followUpTotal);
  const anesthesiaTargetMgM2 = Math.min(
    ANESTHESIA_MG_M2,
    ANESTHESIA_MAX_MG / bsaM2,
  );
  const anesthesia: AnesthesiaDosing = {
    singleDoseMg: followUpTotal,
    singleDoseTargetMgPerM2: ANESTHESIA_MG_M2,
    singleDoseMgPerM2: followUpTotal / bsaM2,
    followUpTotalDailyMg: followUpTotal,
    followUpTargetMgPerM2PerDay: anesthesiaTargetMgM2,
    followUpActualPoMgPerM2PerDay: actualMgPerM2PerDay(followUpPo.totalDaily, bsaM2),
    followUpActualIvMgPerM2PerDay: actualMgPerM2PerDay(followUpIv.totalDaily, bsaM2),
    followUpPo,
    followUpIv,
  };

  return {
    bsaM2,
    includeWeanSchedule: currentSteroid !== null,
    transition: currentSteroid
      ? buildTransitionToWean(currentSteroid, bsaM2)
      : null,
    weanStages,
    maintenance,
    stress,
    anesthesia,
  };
}

export function formatSteroidDoseMg(doseMg: number): string {
  if (doseMg === 0) return "0 mg";
  const rounded =
    doseMg % 1 === 0 ? doseMg.toFixed(0) : doseMg.toFixed(2).replace(/\.?0+$/, "");
  return `${rounded} mg`;
}

export function formatDailyMg(doseMg: number): string {
  if (doseMg === 0) return "0 mg/day";
  const rounded =
    doseMg % 1 === 0 ? doseMg.toFixed(0) : doseMg.toFixed(2).replace(/\.?0+$/, "");
  return `${rounded} mg/day`;
}

export function formatIvSteroidDoseMg(doseMg: number): string {
  if (doseMg <= 0) return "0 mg";
  const rounded =
    Number.isInteger(doseMg) || nearlyEqual(doseMg, Math.round(doseMg))
      ? Math.round(doseMg)
      : roundIvSteroidDoseMg(doseMg);
  const text =
    rounded % 1 === 0
      ? rounded.toFixed(0)
      : rounded.toFixed(IV_DOSE_DECIMAL_PLACES);
  return `${text} mg`;
}

export function formatMgM2PerDay(mgPerM2: number): string {
  const rounded = roundPreferWholeOrOneDecimal(mgPerM2);
  const text =
    rounded % 1 === 0 ? rounded.toFixed(0) : rounded.toFixed(1);
  return `${text} mg/m²/day`;
}

export function formatDailyDoseWithMgM2(
  totalDailyMg: number,
  bsaM2: number,
): string {
  return formatMgM2PerDay(actualMgPerM2PerDay(totalDailyMg, bsaM2));
}

export function formatIvDailyDoseWithMgM2(
  totalDailyMg: number,
  bsaM2: number,
): string {
  return formatMgM2PerDay(actualMgPerM2PerDay(totalDailyMg, bsaM2));
}

export function formatDoseMgAndMgM2(
  doseMg: number,
  mgPerM2PerDay: number,
): string {
  return `${formatDailyMg(doseMg)} (${formatMgM2PerDay(mgPerM2PerDay)})`;
}
