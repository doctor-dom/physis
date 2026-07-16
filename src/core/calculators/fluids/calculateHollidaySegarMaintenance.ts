import type { CalculatorResult } from "../../types";

export interface HollidaySegarMaintenanceInput {
  weightKg: number;
}

export interface HollidaySegarWeightTier {
  label: string;
  weightKg: number;
  rateMlPerKgPerDay: number;
  volumeMlPerDay: number;
}

export interface HollidaySegarMaintenanceResult {
  weightKg: number;
  tiers: HollidaySegarWeightTier[];
  totalMlPerDay: number;
  totalMlPerHr: number;
}

function tierVolume(weightInTierKg: number, rateMlPerKgPerDay: number): number {
  return weightInTierKg * rateMlPerKgPerDay;
}

/**
 * Holliday-Segar maintenance fluids for children:
 * 100 mL/kg/day for the first 10 kg, 50 mL/kg/day for the next 10 kg,
 * 20 mL/kg/day for each kg above 20 kg.
 */
export function calculateHollidaySegarMaintenance(
  input: HollidaySegarMaintenanceInput,
): CalculatorResult<HollidaySegarMaintenanceResult> {
  const { weightKg } = input;

  if (weightKg <= 0) {
    throw new Error("Enter a weight greater than zero.");
  }

  const firstTierKg = Math.min(weightKg, 10);
  const secondTierKg = Math.min(Math.max(weightKg - 10, 0), 10);
  const thirdTierKg = Math.max(weightKg - 20, 0);

  const tiers: HollidaySegarWeightTier[] = [
    {
      label: "First 10 kg",
      weightKg: firstTierKg,
      rateMlPerKgPerDay: 100,
      volumeMlPerDay: tierVolume(firstTierKg, 100),
    },
    {
      label: "Next 10 kg (11–20 kg)",
      weightKg: secondTierKg,
      rateMlPerKgPerDay: 50,
      volumeMlPerDay: tierVolume(secondTierKg, 50),
    },
    {
      label: "Each kg above 20 kg",
      weightKg: thirdTierKg,
      rateMlPerKgPerDay: 20,
      volumeMlPerDay: tierVolume(thirdTierKg, 20),
    },
  ];

  const totalMlPerDay = tiers.reduce((sum, tier) => sum + tier.volumeMlPerDay, 0);
  const totalMlPerHr = totalMlPerDay / 24;

  return {
    value: {
      weightKg,
      tiers,
      totalMlPerDay,
      totalMlPerHr,
    },
    interpretation: `Maintenance IV fluid rate: ${totalMlPerHr.toFixed(1)} mL/hr (${Math.round(totalMlPerDay)} mL/day). Adjust for clinical context, losses, and deficit replacement.`,
  };
}

export function formatMaintenanceRateMlPerHr(value: number): string {
  return `${value.toFixed(1)} mL/hr`;
}

export function formatMaintenanceVolumeMlPerDay(value: number): string {
  return `${Math.round(value)} mL/day`;
}
