export const CM_PER_INCH = 2.54;
export const KG_PER_LB = 0.45359237;

export function inchesToCm(inches: number): number {
  return inches * CM_PER_INCH;
}

export function cmToInches(cm: number): number {
  return cm / CM_PER_INCH;
}

export function poundsToKg(lbs: number): number {
  return lbs * KG_PER_LB;
}

export function kgToPounds(kg: number): number {
  return kg / KG_PER_LB;
}

export function formatCm(cm: number, digits = 1): string {
  return `${cm.toFixed(digits)} cm`;
}

export function formatInchesFromCm(cm: number, digits = 1): string {
  return `${cmToInches(cm).toFixed(digits)} in`;
}
