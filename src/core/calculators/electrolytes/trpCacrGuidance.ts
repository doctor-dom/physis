/** Clinical guidance from data/calc/TRP-CaCr.txt */

export const TRP_FORMULA_TEXT =
  "TRP = 1 − [(uPhos × sCr) ÷ (sPhos × uCr)]; use the same phosphate unit (mg/dL) for serum and urine.";

/** Not specified in TRP-CaCr.txt; retained as standard clinical interpretation. */
export const TRP_PHOSPHORUS_WASTING_THRESHOLD = 0.85;

export const TRP_INTERPRETATION_TOOLTIP =
  "TRP < 0.85 suggests excess phosphorus wasting / hyperparathyroidism (per TRP-CaCr.txt).";

export const CCR_FORMULA_TEXT =
  "Ca/Cr clearance ratio = (UCa × SCr) ÷ (SCa × UCr), with UCa, SCa, SCr, and UCr in mg/dL.";

/** FHH likely when below this value (per TRP-CaCr.txt). */
export const CCR_FHH_LIKELY_THRESHOLD = 0.01;

/** CaSR gene testing should be considered at or below this value (per TRP-CaCr.txt). */
export const CCR_CASR_TEST_THRESHOLD = 0.02;

export const CCR_FHH_UNLIKELY_TOOLTIP =
  "Ca/Cr clearance ratio > 0.01: FHH is unlikely. The patient most likely has primary hyperparathyroidism when hypercalcemic.";

export const CCR_FHH_LIKELY_TOOLTIP =
  "Ca/Cr clearance ratio < 0.01: FHH is likely. Rule out hypovitaminosis D, low salt intake, low calcium intake, significant renal disease, and lithium or thiazide diuretic exposure.";

export const CCR_CASR_TEST_TOOLTIP =
  "All patients with calcium/creatinine clearance ratio of 0.020 or less should be tested for mutations in the CaSR gene.";

export const SPOT_UCA_UCR_FORMULA_TEXT = "Spot UCa/UCr ratio = UCa ÷ UCr (mg/mg when both in mg/dL).";

export const SPOT_UCA_UCR_NEPHROCALCINOSIS_THRESHOLD = 0.2;

export const SPOT_UCA_UCR_SEVERE_THRESHOLD = 0.5;

export const SPOT_UCA_UCR_NEPHROCALCINOSIS_TOOLTIP =
  "When spot UCa/UCr ratio is > 0.2 there is a higher predisposition to nephrocalcinosis.";

export const SPOT_UCA_UCR_PERCENTILE_HEADING =
  "95th percentile molar UCa/Cr (mg/mg) by age:";

export const SPOT_UCA_UCR_PERCENTILE_CUTOFFS = [
  { ageLabel: "<7 months", value: "0.86" },
  { ageLabel: "7–18 months", value: "0.60" },
  { ageLabel: "19 months–6 years", value: "0.42" },
  { ageLabel: "Adults", value: "0.22" },
] as const;

export const SPOT_UCA_UCR_FHH_NOTE_TOOLTIP =
  "The UCa/UCr clearance ratio is less than 0.01 in 80% of FHH cases — use the Ca/Cr clearance ratio (CCR) above for that calculation.";

export const TTKG_FORMULA_TEXT =
  "Transtubular potassium gradient (TTKG) = (uK ÷ sK) ÷ (uOsm ÷ sOsm).";

export const TTKG_VALIDITY_TOOLTIP =
  "TTKG is only valid when urine osmolality (uOsm) > 300 mOsm/kg and urine potassium (uK) > 25 mEq/L.";

export const TTKG_MINERALOCORTICOID_TOOLTIP =
  "In the setting of hyperkalemia, TTKG < 7 indicates mineralocorticoid deficiency.";

export const TTKG_UOSM_MIN = 300;
export const TTKG_UK_MIN = 25;
export const TTKG_MINERALOCORTICOID_DEFICIENCY_THRESHOLD = 7;

export type ResultFlagStatus = "normal" | "abnormal" | "caution" | "neutral";

export function getTrpFlagStatus(trp: number): "normal" | "abnormal" {
  return trp < TRP_PHOSPHORUS_WASTING_THRESHOLD ? "abnormal" : "normal";
}

/** Flags CCR ≤ 0.02 per CaSR testing / FHH guidance in TRP-CaCr.txt. */
export function getCcrFlagStatus(ccr: number): "normal" | "abnormal" {
  return ccr <= CCR_CASR_TEST_THRESHOLD ? "abnormal" : "normal";
}

export function getSpotUcaUcrFlagStatus(
  ratio: number,
): "normal" | "caution" | "abnormal" {
  if (ratio > SPOT_UCA_UCR_SEVERE_THRESHOLD) return "abnormal";
  if (ratio > SPOT_UCA_UCR_NEPHROCALCINOSIS_THRESHOLD) return "caution";
  return "normal";
}

/** Abnormal when valid and below mineralocorticoid-deficiency threshold (hyperkalemia context). */
export function getTtkgFlagStatus(
  ttkg: number,
  valid: boolean,
): ResultFlagStatus {
  if (!valid) return "neutral";
  return ttkg < TTKG_MINERALOCORTICOID_DEFICIENCY_THRESHOLD ? "abnormal" : "normal";
}

export type CcrInterpretationCategory =
  | "fhh_likely"
  | "casr_testing_zone"
  | "fhh_unlikely";

export function classifyCcr(ccr: number): CcrInterpretationCategory {
  if (ccr < CCR_FHH_LIKELY_THRESHOLD) return "fhh_likely";
  if (ccr <= CCR_CASR_TEST_THRESHOLD) return "casr_testing_zone";
  return "fhh_unlikely";
}

export function interpretCcr(ccr: number): string {
  if (ccr < CCR_FHH_LIKELY_THRESHOLD) {
    return (
      "Ca/Cr clearance ratio < 0.01 — familial hypocalciuric hypercalcemia (FHH) is likely. Rule out " +
      "hypovitaminosis D, low salt or calcium intake, significant renal disease, and lithium or " +
      "thiazide diuretic exposure. Consider CaSR gene testing."
    );
  }

  if (ccr <= CCR_CASR_TEST_THRESHOLD) {
    return (
      "Ca/Cr clearance ratio > 0.01 — FHH is unlikely; primary hyperparathyroidism is more likely if " +
      "hypercalcemic. Because the ratio is ≤ 0.020, consider CaSR gene testing."
    );
  }

  return (
    "Ca/Cr clearance ratio > 0.02 — FHH is unlikely. Primary hyperparathyroidism is the more likely " +
    "cause of hypercalcemia when clinically appropriate."
  );
}

export function interpretTrp(trp: number): string {
  if (trp < TRP_PHOSPHORUS_WASTING_THRESHOLD) {
    return `TRP < ${TRP_PHOSPHORUS_WASTING_THRESHOLD} — suggests excess phosphorus wasting / hyperparathyroidism.`;
  }
  return `TRP ≥ ${TRP_PHOSPHORUS_WASTING_THRESHOLD} — no suggestive renal phosphate wasting on this measure.`;
}

export function interpretSpotUcaUcr(ratio: number): string {
  if (ratio > SPOT_UCA_UCR_SEVERE_THRESHOLD) {
    return `Spot UCa/UCr ${ratio.toFixed(3)} — markedly elevated (>${SPOT_UCA_UCR_SEVERE_THRESHOLD}); high predisposition to nephrocalcinosis. Compare to age-specific 95th percentiles.`;
  }
  if (ratio > SPOT_UCA_UCR_NEPHROCALCINOSIS_THRESHOLD) {
    return `Spot UCa/UCr ${ratio.toFixed(3)} — higher predisposition to nephrocalcinosis (ratio > ${SPOT_UCA_UCR_NEPHROCALCINOSIS_THRESHOLD}). Compare to age-specific 95th percentiles.`;
  }
  return `Spot UCa/UCr ${ratio.toFixed(3)} — compare to age-specific 95th percentiles (<7 mo 0.86; 7–18 mo 0.60; 19 mo–6 y 0.42; adults 0.22).`;
}

export function interpretTtkg(ttkg: number, valid: boolean): string {
  if (!valid) {
    return `TTKG ${ttkg.toFixed(2)} calculated, but validity criteria not met (requires uOsm > ${TTKG_UOSM_MIN} and uK > ${TTKG_UK_MIN}). Interpret with caution.`;
  }
  if (ttkg < TTKG_MINERALOCORTICOID_DEFICIENCY_THRESHOLD) {
    return `TTKG < ${TTKG_MINERALOCORTICOID_DEFICIENCY_THRESHOLD} — in hyperkalemia, suggests mineralocorticoid deficiency.`;
  }
  return `TTKG ≥ ${TTKG_MINERALOCORTICOID_DEFICIENCY_THRESHOLD} — mineralocorticoid deficiency is less suggested by this measure (interpret in clinical context, especially serum potassium).`;
}
