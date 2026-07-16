/** Relative glucocorticoid potency vs hydrocortisone (HCT = 1.0). */
export interface SteroidPotencyEntry {
  id: string;
  label: string;
  hctPotency: number;
}

export const STEROID_POTENCIES: SteroidPotencyEntry[] = [
  { id: "betamethasone", label: "Betamethasone", hctPotency: 25.0 },
  { id: "dexamethasone", label: "Dexamethasone", hctPotency: 40.0 },
  { id: "hydrocortisone", label: "Hydrocortisone / HCT", hctPotency: 1.0 },
  { id: "methylprednisolone", label: "Methylprednisolone", hctPotency: 5.0 },
  {
    id: "prednisone",
    label: "Prednisone / Prednisolone",
    hctPotency: 4.0,
  },
];

export function getSteroidPotency(id: string): SteroidPotencyEntry | undefined {
  return STEROID_POTENCIES.find((s) => s.id === id);
}
