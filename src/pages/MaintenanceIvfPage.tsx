import { useMemo, useState } from "react";
import {
  CalculatorReferenceFooter,
  CalculatorShell,
  ResultCard,
} from "../components/FormFields";
import { UnitWeightInput } from "../components/UnitInputs";
import {
  calculateHollidaySegarMaintenance,
  formatMaintenanceRateMlPerHr,
  formatMaintenanceVolumeMlPerDay,
} from "@core/calculators/fluids/calculateHollidaySegarMaintenance";

export default function MaintenanceIvfPage() {
  const [weightKg, setWeightKg] = useState("");

  const result = useMemo(() => {
    const weight = parseFloat(weightKg);
    if (Number.isNaN(weight)) return null;
    try {
      return calculateHollidaySegarMaintenance({ weightKg: weight });
    } catch (e) {
      return { error: (e as Error).message };
    }
  }, [weightKg]);

  return (
    <CalculatorShell
      title="Maintenance IVF (Holliday-Segar)"
      description="Estimate daily and hourly maintenance intravenous fluid rates for children."
    >
      <UnitWeightInput label="Weight" valueKg={weightKg} onChangeKg={setWeightKg} />

      {result && "error" in result ? (
        <ResultCard title="Error" error={result.error} />
      ) : result ? (
        <div className="space-y-4">
          <ResultCard
            title="Maintenance IV fluid rate"
            value={formatMaintenanceRateMlPerHr(result.value.totalMlPerHr)}
            interpretation={result.interpretation}
          />

          <div className="grid gap-3 sm:grid-cols-2">
            <MetricCard
              label="Total volume"
              value={formatMaintenanceVolumeMlPerDay(result.value.totalMlPerDay)}
            />
            <MetricCard
              label="Patient weight"
              value={`${result.value.weightKg.toFixed(2)} kg`}
            />
          </div>

          <section className="overflow-hidden rounded-xl border border-teal-100 bg-white">
            <h3 className="border-b border-teal-100 bg-teal-50/60 px-4 py-2 text-sm font-semibold text-teal-900">
              Holliday-Segar breakdown
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[20rem] text-left text-sm text-teal-900">
                <thead>
                  <tr className="border-b border-teal-100 text-xs text-teal-600">
                    <th className="px-4 py-2 font-medium">Weight tier</th>
                    <th className="px-4 py-2 font-medium">Weight applied</th>
                    <th className="px-4 py-2 font-medium">Rate</th>
                    <th className="px-4 py-2 font-medium">Volume/day</th>
                  </tr>
                </thead>
                <tbody>
                  {result.value.tiers.map((tier) => (
                    <tr key={tier.label} className="border-b border-teal-50">
                      <td className="px-4 py-2">{tier.label}</td>
                      <td className="px-4 py-2 tabular-nums">
                        {tier.weightKg > 0 ? `${tier.weightKg.toFixed(2)} kg` : "—"}
                      </td>
                      <td className="px-4 py-2 tabular-nums">
                        {tier.rateMlPerKgPerDay} mL/kg/day
                      </td>
                      <td className="px-4 py-2 tabular-nums">
                        {tier.volumeMlPerDay > 0
                          ? `${Math.round(tier.volumeMlPerDay)} mL`
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-teal-50/40 font-medium">
                    <td className="px-4 py-2" colSpan={3}>
                      Total
                    </td>
                    <td className="px-4 py-2 tabular-nums">
                      {Math.round(result.value.totalMlPerDay)} mL/day
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </section>

          <CalculatorReferenceFooter>
            Holliday-Segar maintenance fluids: 100 mL/kg/day for the first 10 kg, 50
            mL/kg/day for the next 10 kg (11–20 kg), and 20 mL/kg/day for each kg above
            20 kg. Hourly rate = total mL/day ÷ 24 (equivalent to 4, 2, and 1 mL/kg/hr
            across the same weight tiers).
          </CalculatorReferenceFooter>
        </div>
      ) : null}
    </CalculatorShell>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-teal-100 bg-white px-4 py-3">
      <p className="text-xs font-medium uppercase tracking-wide text-teal-600">{label}</p>
      <p className="mt-1 text-lg font-semibold tabular-nums text-teal-950">{value}</p>
    </div>
  );
}
