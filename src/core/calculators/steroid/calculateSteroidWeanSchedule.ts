import type { SteroidDoseOutput } from "./calculateSteroidDose";

/**
 * Steroid wean dosing rules:
 * - PO hydrocortisone: all doses rounded to 1.25 mg increments (tablet size).
 * - IV hydrocortisone: split to target daily dose, each dose rounded to 1 decimal place.
 */

export const HCT_WEAN_THRESHOLD_MG_M2 = 30;
export const WEAN_STAGE_MG_M2 = [30, 20, 10, 8, 5, 3] as const;
export const BID_WEAN_STAGES_MG_M2 = new Set<number>([8, 5, 3]);
export const PO_HCT_DOSE_INCREMENT_MG = 1.25;
/** @deprecated Use PO_HCT_DOSE_INCREMENT_MG — PO-only rule. */
export const DOSE_INCREMENT_MG = PO_HCT_DOSE_INCREMENT_MG;

export const IV_DOSE_DECIMAL_PLACES = 1;

export const MAINTENANCE_MG_M2_MIN = 8;
export const MAINTENANCE_MG_M2_MAX = 10;
export const STRESS_MG_M2 = 30;
export const ANESTHESIA_MG_M2 = 100;
export const ANESTHESIA_MAX_MG = 100;

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
  /** Current steroid dose (mg/m²/day). */
  currentSteroidMgPerM2PerDay: number;
  /** Hydrocortisone-equivalent dose (mg/m²/day). */
  hctEquivalentMgPerM2PerDay: number;
  atOrBelowWeanThreshold: boolean;
  /** Rounded daily dose of current steroid to reach wean threshold (prescribing). */
  thresholdCurrentSteroidDoseMg?: number;
  /** mg/m²/day of current steroid at recommended dose. */
  thresholdCurrentSteroidMgPerM2PerDay?: number;
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

/** Round PO hydrocortisone to nearest 1.25 mg; values below 1.25 mg become 0. */
export function roundPoSteroidDoseMg(doseMg: number): number {
  if (doseMg < PO_HCT_DOSE_INCREMENT_MG) return 0;
  return (
    Math.round(doseMg / PO_HCT_DOSE_INCREMENT_MG) * PO_HCT_DOSE_INCREMENT_MG
  );
}

/** @deprecated Use roundPoSteroidDoseMg */
export const roundSteroidDoseMg = roundPoSteroidDoseMg;

function roundPoTotalDailyMg(doseMg: number): number {
  if (doseMg <= 0) return 0;
  return Math.max(
    PO_HCT_DOSE_INCREMENT_MG,
    Math.round(doseMg / PO_HCT_DOSE_INCREMENT_MG) * PO_HCT_DOSE_INCREMENT_MG,
  );
}

/** IV doses round to one decimal place (formulation constraint; not PO 1.25 mg increments). */
export function roundIvSteroidDoseMg(doseMg: number): number {
  if (doseMg <= 0) return 0;
  const factor = 10 ** IV_DOSE_DECIMAL_PLACES;
  return Math.round(doseMg * factor) / factor;
}

export function dailyMgFromMgM2(mgPerM2: number, bsaM2: number): number {
  return mgPerM2 * bsaM2;
}

export function actualMgPerM2PerDay(totalDailyMg: number, bsaM2: number): number {
  return totalDailyMg / bsaM2;
}

/** PO hydrocortisone TID, or BID (evening omitted) for lower wean stages. */
export function splitPoHydrocortisoneTid(
  totalDailyMg: number,
  useBid: boolean,
): PoTidDoses {
  const total = roundPoTotalDailyMg(totalDailyMg);

  if (useBid) {
    let morning = roundPoSteroidDoseMg(total * 0.55);
    if (morning === 0 && total >= PO_HCT_DOSE_INCREMENT_MG) {
      morning = PO_HCT_DOSE_INCREMENT_MG;
    }
    let midday = roundPoSteroidDoseMg(total - morning);
    if (midday === 0 && total - morning >= PO_HCT_DOSE_INCREMENT_MG) {
      midday = roundPoSteroidDoseMg(total - morning);
    }
    if (morning + midday !== total) {
      midday = Math.max(0, roundPoSteroidDoseMg(total - morning));
      if (midday === 0 && total > morning) {
        morning = total;
      }
    }
    if (midday > morning) {
      const swap = morning;
      morning = midday;
      midday = swap;
    }

    return {
      morning,
      midday,
      evening: 0,
      totalDaily: morning + midday,
      schedule: "bid",
    };
  }

  let morning = roundPoSteroidDoseMg(total * 0.5);
  if (morning === 0 && total >= PO_HCT_DOSE_INCREMENT_MG) {
    morning = PO_HCT_DOSE_INCREMENT_MG;
  }

  let midday = roundPoSteroidDoseMg((total - morning) / 2);
  let evening = roundPoSteroidDoseMg(total - morning - midday);

  if (evening > 0 && evening < PO_HCT_DOSE_INCREMENT_MG) {
    evening = 0;
  }
  if (midday > 0 && midday < PO_HCT_DOSE_INCREMENT_MG) {
    midday = 0;
  }

  if (midday === 0 && evening === 0) {
    morning = total;
  } else if (evening === 0) {
    midday = roundPoSteroidDoseMg(total - morning);
    if (midday === 0) {
      morning = total;
    }
  } else {
    const adjustedEvening = total - morning - midday;
    evening =
      adjustedEvening >= PO_HCT_DOSE_INCREMENT_MG
        ? roundPoSteroidDoseMg(adjustedEvening)
        : 0;
    if (evening === 0) {
      midday = roundPoSteroidDoseMg(total - morning);
    }
  }

  if (midday > morning) {
    const swap = morning;
    morning = midday;
    midday = swap;
  }
  if (evening > morning) {
    const swap = morning;
    morning = evening;
    evening = swap;
  }
  if (evening > midday && evening > 0) {
    const swap = midday;
    midday = evening;
    evening = swap;
  }

  const sum = morning + midday + evening;
  if (sum !== total && total > 0) {
    morning = Math.max(morning, roundPoSteroidDoseMg(total - midday - evening));
  }

  return {
    morning,
    midday,
    evening,
    totalDaily: morning + midday + evening,
    schedule: "tid",
  };
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

export function anesthesiaSingleDoseMg(bsaM2: number): number {
  const raw = Math.min(ANESTHESIA_MAX_MG, ANESTHESIA_MG_M2 * bsaM2);
  return roundIvSteroidDoseMg(raw);
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
    currentSteroidMgPerM2PerDay: steroid.dailyDoseMg / bsaM2,
    hctEquivalentMgPerM2PerDay: steroid.hctEquivalentMgPerM2PerDay,
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
    const useBid = BID_WEAN_STAGES_MG_M2.has(mgPerM2);
    const po = splitPoHydrocortisoneTid(targetTotalDailyMg, useBid);
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
    const po = splitPoHydrocortisoneTid(targetTotalDailyMg, false);
    return {
      targetMgPerM2PerDay: mgPerM2,
      targetTotalDailyMg,
      actualMgPerM2PerDay: actualMgPerM2PerDay(po.totalDaily, bsaM2),
      po,
    };
  });

  const stressTargetTotal = dailyMgFromMgM2(STRESS_MG_M2, bsaM2);
  const stressPo = splitPoHydrocortisoneTid(stressTargetTotal, false);
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
  const followUpPo = splitPoHydrocortisoneTid(followUpTotal, false);
  const followUpIv = splitIvHydrocortisoneQid(followUpTotal);
  const anesthesiaTargetMgM2 = Math.min(ANESTHESIA_MG_M2, ANESTHESIA_MAX_MG / bsaM2);
  const anesthesia: AnesthesiaDosing = {
    singleDoseMg: followUpTotal,
    singleDoseMgPerM2: Math.min(ANESTHESIA_MG_M2, followUpTotal / bsaM2),
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

export function formatIvSteroidDoseMg(doseMg: number): string {
  if (doseMg <= 0) return "0 mg";
  const rounded = roundIvSteroidDoseMg(doseMg);
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
