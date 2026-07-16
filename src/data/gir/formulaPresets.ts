export const GIR_DEXTROSE_PRESETS = [
  { value: "5", label: "D5W (5%)" },
  { value: "10", label: "D10W (10%)" },
  { value: "12.5", label: "D12.5W (12.5%)" },
  { value: "15", label: "D15W (15%)" },
  { value: "20", label: "D20W (20%)" },
  { value: "custom", label: "Custom %" },
] as const;

export { girFormulas, GIR_KCAL_PER_OZ_OPTIONS } from "./formulas";
