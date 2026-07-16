/** Clinical guidance from data/calc/TRP-CaCr.txt */

export const TRP_FORMULA_TEXT =
  "TRP = 1 − [(uPhos × sCr) ÷ (sPhos × uCr)]";

/** Not specified in TRP-CaCr.txt; retained as standard clinical interpretation. */
export const TRP_PHOSPHORUS_WASTING_THRESHOLD = 0.85;

export const TRP_BANNER_GUIDANCE = [
  TRP_FORMULA_TEXT,
  `Clinical interpretation: TRP < ${TRP_PHOSPHORUS_WASTING_THRESHOLD} suggests excess renal phosphate wasting. TRP-CaCr.txt documents the formula only; the ${TRP_PHOSPHORUS_WASTING_THRESHOLD} threshold is applied from standard clinical practice.`,
] as const;

export const CCR_FORMULA_TEXT =
  "Ca/Cr clearance ratio = (UCa × SCr) ÷ (SCa × UCr), with UCa, SCa, SCr, and UCr in mg/dL.";

/** FHH likely when below this value (per TRP-CaCr.txt). */
export const CCR_FHH_LIKELY_THRESHOLD = 0.01;

/** CaSR gene testing should be considered at or below this value (per TRP-CaCr.txt). */
export const CCR_CASR_TEST_THRESHOLD = 0.02;

export const CCR_BANNER_GUIDANCE = [
  "Ca/Cr clearance ratio < 0.01: FHH is likely — rule out hypovitaminosis D, low salt or calcium intake, significant renal disease, and lithium or thiazide diuretic exposure.",
  "Ca/Cr clearance ratio > 0.01: FHH is unlikely; primary hyperparathyroidism is more likely when hypercalcemic.",
  "All patients with Ca/Cr clearance ratio ≤ 0.020 should be considered for CaSR gene testing (< 0.01 in ~80% of FHH cases).",
  "Use mg/dL for urinary calcium, serum calcium, and creatinine values.",
] as const;

export const CCR_UCA_CR_PERCENTILE_NOTE =
  "Age-specific 95th percentile molar UCa/Cr (mg/mg) differs from this clearance ratio: <7 mo 0.86; 7–18 mo 0.60; 19 mo–6 y 0.42; adults 0.22.";

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
      "CCR < 0.01 — familial hypocalciuric hypercalcemia (FHH) is likely. Rule out " +
      "hypovitaminosis D, low salt or calcium intake, significant renal disease, and " +
      "lithium or thiazide diuretic exposure. Consider CaSR gene testing."
    );
  }

  if (ccr <= CCR_CASR_TEST_THRESHOLD) {
    return (
      "CCR > 0.01 — FHH is unlikely; primary hyperparathyroidism is more likely if " +
      "hypercalcemic. Because CCR ≤ 0.020, consider CaSR gene testing per reference guidance."
    );
  }

  return (
    "CCR > 0.02 — FHH is unlikely. Primary hyperparathyroidism is the more likely " +
    "cause of hypercalcemia when clinically appropriate."
  );
}
