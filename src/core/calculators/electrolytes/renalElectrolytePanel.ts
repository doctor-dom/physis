import type { CalculatorResult } from "../../types";
import type { CalciumClearanceRatioResult } from "../calciumClearanceRatio";
import { calculateCalciumClearanceRatio } from "../calciumClearanceRatio";
import { calculateTubularResorptionPhosphate } from "../tubularResorptionPhosphate";
import {
  interpretSpotUcaUcr,
  interpretTtkg,
  SPOT_UCA_UCR_NEPHROCALCINOSIS_THRESHOLD,
  SPOT_UCA_UCR_SEVERE_THRESHOLD,
  TTKG_UK_MIN,
  TTKG_UOSM_MIN,
} from "./trpCacrGuidance";

export interface RenalElectrolytePanelInput {
  phosUrine?: number;
  phosSerum?: number;
  caUrine?: number;
  caSerum?: number;
  creatSerum?: number;
  creatUrine?: number;
  kUrine?: number;
  kSerum?: number;
  osmUrine?: number;
  osmSerum?: number;
}

export interface TtkgResult {
  ttkg: number;
  valid: boolean;
}

type PanelMetricResult<T> = CalculatorResult<T> | { error: string };

export interface RenalElectrolytePanelResult {
  trp: PanelMetricResult<number> | null;
  ccr: PanelMetricResult<CalciumClearanceRatioResult> | null;
  spotUcaUcr: PanelMetricResult<number> | null;
  ttkg: PanelMetricResult<TtkgResult> | null;
}

function calculateSpotUcaUcr(uCa: number, uCr: number): CalculatorResult<number> {
  if (uCr <= 0) {
    throw new Error("Urine creatinine must be greater than zero.");
  }
  const ratio = uCa / uCr;
  return {
    value: ratio,
    interpretation: interpretSpotUcaUcr(ratio),
    warning:
      ratio > SPOT_UCA_UCR_SEVERE_THRESHOLD
        ? `Spot UCa/UCr > ${SPOT_UCA_UCR_SEVERE_THRESHOLD} — markedly elevated; high predisposition to nephrocalcinosis.`
        : ratio > SPOT_UCA_UCR_NEPHROCALCINOSIS_THRESHOLD
          ? `Spot UCa/UCr > ${SPOT_UCA_UCR_NEPHROCALCINOSIS_THRESHOLD} — higher predisposition to nephrocalcinosis.`
          : undefined,
  };
}

function calculateTtkg(
  uK: number,
  sK: number,
  uOsm: number,
  sOsm: number,
): CalculatorResult<TtkgResult> {
  if (sK <= 0 || sOsm <= 0) {
    throw new Error("Serum potassium and serum osmolality must be greater than zero.");
  }
  const ttkg = (uK / sK) / (uOsm / sOsm);
  const valid = uOsm > TTKG_UOSM_MIN && uK > TTKG_UK_MIN;
  return {
    value: { ttkg, valid },
    interpretation: interpretTtkg(ttkg, valid),
    warning: valid
      ? undefined
      : `TTKG requires uOsm > ${TTKG_UOSM_MIN} mOsm/kg and uK > ${TTKG_UK_MIN} mEq/L.`,
  };
}

function safeCalculate<T>(
  fn: () => CalculatorResult<T>,
): PanelMetricResult<T> {
  try {
    return fn();
  } catch (e) {
    return { error: (e as Error).message };
  }
}

export function calculateRenalElectrolytePanel(
  input: RenalElectrolytePanelInput,
): RenalElectrolytePanelResult {
  const {
    phosUrine,
    phosSerum,
    caUrine,
    caSerum,
    creatSerum,
    creatUrine,
    kUrine,
    kSerum,
    osmUrine,
    osmSerum,
  } = input;

  const trp =
    phosUrine !== undefined &&
    phosSerum !== undefined &&
    creatSerum !== undefined &&
    creatUrine !== undefined
      ? safeCalculate(() =>
          calculateTubularResorptionPhosphate({
            phosUrine,
            phosSerum,
            creatSerum,
            creatUrine,
          }),
        )
      : null;

  const ccr =
    caUrine !== undefined &&
    caSerum !== undefined &&
    creatSerum !== undefined &&
    creatUrine !== undefined
      ? safeCalculate(() =>
          calculateCalciumClearanceRatio({
            caUrine,
            caSerum,
            creatSerum,
            creatUrine,
          }),
        )
      : null;

  const spotUcaUcr =
    caUrine !== undefined && creatUrine !== undefined
      ? safeCalculate(() => calculateSpotUcaUcr(caUrine, creatUrine))
      : null;

  const ttkg =
    kUrine !== undefined &&
    kSerum !== undefined &&
    osmUrine !== undefined &&
    osmSerum !== undefined
      ? safeCalculate(() => calculateTtkg(kUrine, kSerum, osmUrine, osmSerum))
      : null;

  return { trp, ccr, spotUcaUcr, ttkg };
}

function isError<T>(
  result: PanelMetricResult<T> | null,
): result is { error: string } {
  return result !== null && "error" in result;
}

export function panelHasAnyResult(result: RenalElectrolytePanelResult): boolean {
  return Boolean(result.trp || result.ccr || result.spotUcaUcr || result.ttkg);
}

export { isError as renalPanelResultIsError };
