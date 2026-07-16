import type { CalculatorResult } from "../../types";

export type BsaMethod = "haycock" | "weight-only" | "direct";

export interface BsaInput {
  weightKg?: number;
  heightCm?: number;
  bsaM2Direct?: number;
}

export interface BsaOutput {
  bsaM2: number;
  method: BsaMethod;
  methodLabel: string;
}

/** Weight-only estimate (m²): [(kg × 4) + 7] / [kg + 90] */
export function calculateBsaFromWeightKg(weightKg: number): number {
  if (weightKg <= 0) throw new Error("Weight must be greater than zero.");
  return (weightKg * 4 + 7) / (weightKg + 90);
}

/** Haycock (1978): BSA (m²) = 0.024265 × W^0.5378 × H^0.3964 */
export function calculateBsaHaycock(weightKg: number, heightCm: number): number {
  if (weightKg <= 0) throw new Error("Weight must be greater than zero.");
  if (heightCm <= 0) throw new Error("Height must be greater than zero.");
  return (
    0.024265 *
    Math.pow(weightKg, 0.5378) *
    Math.pow(heightCm, 0.3964)
  );
}

export function calculateBsa(input: BsaInput): CalculatorResult<BsaOutput> {
  if (input.bsaM2Direct !== undefined && !Number.isNaN(input.bsaM2Direct)) {
    if (input.bsaM2Direct <= 0) {
      throw new Error("BSA must be greater than zero.");
    }
    return {
      value: {
        bsaM2: input.bsaM2Direct,
        method: "direct",
        methodLabel: "Entered directly",
      },
      interpretation: `Body surface area: ${input.bsaM2Direct.toFixed(3)} m² (direct entry).`,
    };
  }

  const weight = input.weightKg;
  if (weight === undefined || Number.isNaN(weight) || weight <= 0) {
    throw new Error("Enter weight (kg) or BSA (m²).");
  }

  const height = input.heightCm;
  if (height !== undefined && !Number.isNaN(height) && height > 0) {
    const bsaM2 = calculateBsaHaycock(weight, height);
    return {
      value: {
        bsaM2,
        method: "haycock",
        methodLabel: "Haycock (weight + height)",
      },
      interpretation: `Body surface area: ${bsaM2.toFixed(3)} m² (Haycock: 0.024265 × W^0.5378 × H^0.3964).`,
    };
  }

  const bsaM2 = calculateBsaFromWeightKg(weight);
  return {
    value: {
      bsaM2,
      method: "weight-only",
      methodLabel: "Weight-only estimate",
    },
    interpretation: `Body surface area: ${bsaM2.toFixed(3)} m² ([(kg × 4) + 7] / [kg + 90]).`,
    warning:
      "Height not provided — BSA estimated from weight alone. Add height for Haycock BSA if available.",
  };
}
