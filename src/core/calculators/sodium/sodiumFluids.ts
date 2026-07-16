export type SodiumAgeCategory = "child" | "adult" | "elderly";

export type SodiumFluidType =
  | "lr"
  | "ns"
  | "halfNs"
  | "quarterNs"
  | "d5w"
  | "hypertonic3";

export interface SodiumFluidOption {
  id: SodiumFluidType;
  label: string;
  naMmoll: number;
}

/** Sodium content (mmol/L) per fluids-Na.md; 3% saline added for symptomatic hyponatremia guidance. */
export const SODIUM_FLUID_OPTIONS: SodiumFluidOption[] = [
  { id: "lr", label: "Lactated Ringer's", naMmoll: 130 },
  { id: "ns", label: "Normal saline (0.9%)", naMmoll: 154 },
  { id: "halfNs", label: "0.45% NaCl (½ NS)", naMmoll: 77 },
  { id: "quarterNs", label: "0.2% NaCl (¼ NS)", naMmoll: 34 },
  { id: "d5w", label: "D5W", naMmoll: 0 },
  { id: "hypertonic3", label: "3% hypertonic saline", naMmoll: 513 },
];

export function getSodiumFluidNaMmoll(fluidType: SodiumFluidType): number {
  const fluid = SODIUM_FLUID_OPTIONS.find((f) => f.id === fluidType);
  if (!fluid) {
    throw new Error("Unknown fluid type.");
  }
  return fluid.naMmoll;
}

export function getSodiumFluidLabel(fluidType: SodiumFluidType): string {
  return SODIUM_FLUID_OPTIONS.find((f) => f.id === fluidType)!.label;
}

/** Total body water fraction by age and sex (fluids-Na.md). */
export function getTbwFraction(
  ageCategory: SodiumAgeCategory,
  sex: "male" | "female",
): number {
  switch (ageCategory) {
    case "child":
      return 0.6;
    case "adult":
      return sex === "male" ? 0.6 : 0.5;
    case "elderly":
      return sex === "male" ? 0.5 : 0.45;
  }
}

export const SODIUM_CORRECTION_RATE_PRESETS = [
  {
    value: "0.25",
    label: "Standard correction — 6 mmol/L per 24 h (hypo/hypernatremia)",
  },
  {
    value: "0.33",
    label: "Standard correction — 8 mmol/L per 24 h (hypo/hypernatremia)",
  },
  {
    value: "0.5",
    label: "Hyponatremia — severe chronic limit (0.5 mmol/L per hr)",
  },
  {
    value: "1",
    label: "Hyponatremia — acute symptomatic initial (~1 mmol/L per hr, brief)",
  },
  { value: "custom", label: "Custom rate" },
] as const;

export const MAX_SODIUM_CORRECTION_MMOL_PER_24H = 8;
export const STANDARD_SODIUM_CORRECTION_MMOL_PER_24H = { min: 6, max: 8 };
export const ACUTE_SYMPTOMATIC_RISE_MMOL_FIRST_6H = { min: 4, max: 6 };

/** @deprecated Use MAX_SODIUM_CORRECTION_MMOL_PER_24H */
export const MAX_SODIUM_RISE_MMOL_PER_24H = MAX_SODIUM_CORRECTION_MMOL_PER_24H;
