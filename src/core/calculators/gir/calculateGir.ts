import type { CalculatorResult } from "../../types";

export const GIR_NORMAL_MIN_MG_KG_MIN = 5;
export const GIR_NORMAL_MAX_MG_KG_MIN = 8;
export const GIR_CHI_THRESHOLD_MG_KG_MIN = 10;

export interface GirCalculationInput {
  weightKg: number;
  /** Dextrose concentration (%), e.g. 10 for D10W. Omit or 0 if no IV fluids. */
  ivDextrosePercent?: number;
  /** IV infusion rate (mL/hr). */
  ivRateMlPerHr?: number;
  /** Carbohydrate (g/100 mL) at the feed's caloric density. */
  enteralChoGPer100Ml?: number;
  /** Enteral average delivery rate (mL/hr). */
  enteralRateMlPerHr?: number;
}

export interface GirCalculationOutput {
  ivGirMgKgMin: number;
  enteralGirMgKgMin: number;
  totalGirMgKgMin: number;
}

/**
 * IV GIR (mg/kg/min) = [dextrose (%) × rate (mL/hr) × 10] ÷ [60 × weight (kg)]
 */
export function calculateIvGir(
  dextrosePercent: number,
  rateMlPerHr: number,
  weightKg: number,
): number {
  if (weightKg <= 0) throw new Error("Weight must be greater than zero.");
  if (dextrosePercent < 0 || rateMlPerHr < 0) {
    throw new Error("Dextrose concentration and IV rate cannot be negative.");
  }
  return (dextrosePercent * rateMlPerHr * 10) / (60 * weightKg);
}

/**
 * Enteral GIR (mg/kg/min) = [CHO (g/100 mL) × rate (mL/hr) × 10] ÷ [60 × weight (kg)]
 */
export function calculateEnteralGir(
  choGPer100Ml: number,
  rateMlPerHr: number,
  weightKg: number,
): number {
  if (weightKg <= 0) throw new Error("Weight must be greater than zero.");
  if (choGPer100Ml < 0 || rateMlPerHr < 0) {
    throw new Error("Carbohydrate content and feed rate cannot be negative.");
  }
  return (choGPer100Ml * rateMlPerHr * 10) / (60 * weightKg);
}

/** Scale CHO (g/100 mL) from 20 kcal/oz to a target caloric density. */
export function scaleChoForCaloricDensity(
  choGPer100MlAt20KcalOz: number,
  kcalPerOz: number,
): number {
  if (kcalPerOz <= 0) throw new Error("Caloric density must be greater than zero.");
  return choGPer100MlAt20KcalOz * (kcalPerOz / 20);
}

/** mg/mL → g/100 mL (used in enteral GIR equation). */
export function choMgPerMlToGPer100Ml(choMgPerMl: number): number {
  return choMgPerMl / 10;
}

export interface GirFormulaEntry {
  id: string;
  label: string;
  /** CHO (mg/mL) by caloric density (kcal/oz), from enteral-GIR.csv */
  choMgPerMl: Partial<Record<number, number>>;
  refs?: string;
}

/**
 * Resolve CHO (g/100 mL) for a formula at a given caloric density.
 * Uses tabulated values when available; otherwise scales from 20 kcal/oz.
 */
export function getFormulaChoGPer100Ml(
  formula: GirFormulaEntry,
  kcalPerOz: number,
): number {
  const tabulated =
    formula.choMgPerMl[kcalPerOz] ??
    formula.choMgPerMl[String(kcalPerOz) as unknown as number];
  if (tabulated !== undefined) {
    return choMgPerMlToGPer100Ml(tabulated);
  }

  const at20 =
    formula.choMgPerMl[20] ??
    formula.choMgPerMl[String(20) as unknown as number];
  if (at20 === undefined) {
    throw new Error(`No CHO data at 20 kcal/oz for ${formula.label}.`);
  }

  return scaleChoForCaloricDensity(choMgPerMlToGPer100Ml(at20), kcalPerOz);
}

/** Bolus feeds: average continuous-equivalent rate (mL/hr). */
export function bolusToAverageRateMlPerHr(
  bolusVolumeMl: number,
  intervalHours: number,
): number {
  if (bolusVolumeMl < 0 || intervalHours <= 0) {
    throw new Error("Bolus volume and interval must be valid positive values.");
  }
  return bolusVolumeMl / intervalHours;
}

function buildClinicalGuidance(totalGir: number): {
  interpretation: string;
  warning?: string;
} {
  const range = `${GIR_NORMAL_MIN_MG_KG_MIN}–${GIR_NORMAL_MAX_MG_KG_MIN} mg/kg/min`;

  let interpretation: string;
  let warning: string | undefined;

  if (totalGir > GIR_CHI_THRESHOLD_MG_KG_MIN) {
    interpretation = `Total GIR exceeds ${GIR_CHI_THRESHOLD_MG_KG_MIN} mg/kg/min. Typical neonatal maintenance is ${range}.`;
    warning =
      "GIR > 10 mg/kg/min: consider congenital hyperinsulinism (CHI), especially if required to maintain euglycemia. Recalculate when advancing feeds or weaning IV dextrose.";
  } else if (totalGir > GIR_NORMAL_MAX_MG_KG_MIN) {
    interpretation = `Total GIR is above the usual neonatal maintenance range (${range}) but ≤ ${GIR_CHI_THRESHOLD_MG_KG_MIN} mg/kg/min. Higher rates may be needed for refractory hypoglycemia.`;
  } else if (totalGir >= GIR_NORMAL_MIN_MG_KG_MIN) {
    interpretation = `Total GIR is within the typical neonatal maintenance range (${range}).`;
  } else {
    interpretation = `Total GIR is below the typical neonatal utilization range (${range}). Confirm inputs if this is unexpected.`;
  }

  return { interpretation, warning };
}

export function calculateGir(
  input: GirCalculationInput,
): CalculatorResult<GirCalculationOutput> {
  const { weightKg } = input;
  if (weightKg <= 0) throw new Error("Weight must be greater than zero.");

  const ivPercent = input.ivDextrosePercent ?? 0;
  const ivRate = input.ivRateMlPerHr ?? 0;
  const enteralCho = input.enteralChoGPer100Ml ?? 0;
  const enteralRate = input.enteralRateMlPerHr ?? 0;

  const hasIv = ivPercent > 0 && ivRate > 0;
  const hasEnteral = enteralCho > 0 && enteralRate > 0;

  if (!hasIv && !hasEnteral) {
    throw new Error(
      "Enter IV dextrose and/or enteral feed details to calculate GIR.",
    );
  }

  const ivGir = hasIv ? calculateIvGir(ivPercent, ivRate, weightKg) : 0;
  const enteralGir = hasEnteral
    ? calculateEnteralGir(enteralCho, enteralRate, weightKg)
    : 0;
  const totalGir = ivGir + enteralGir;

  const parts: string[] = [];
  if (hasIv) parts.push(`IV ${ivGir.toFixed(1)} mg/kg/min`);
  if (hasEnteral) parts.push(`enteral ${enteralGir.toFixed(1)} mg/kg/min`);
  const breakdown =
    hasIv && hasEnteral
      ? `Combined GIR: ${parts.join(" + ")} = ${totalGir.toFixed(1)} mg/kg/min.`
      : `GIR: ${totalGir.toFixed(1)} mg/kg/min (${parts[0] ?? ""}).`;

  const guidance = buildClinicalGuidance(totalGir);

  return {
    value: {
      ivGirMgKgMin: ivGir,
      enteralGirMgKgMin: enteralGir,
      totalGirMgKgMin: totalGir,
    },
    interpretation: `${breakdown} ${guidance.interpretation}`,
    warning: guidance.warning,
  };
}
