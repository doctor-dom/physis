import { useMemo, useState } from "react";
import {
  CalculatorShell,
  Field,
  NumberInput,
  ResultCard,
} from "../components/FormFields";
import {
  calculateHyperglycemiaCorrectedSodium,
  HYPERGLYCEMIA_SODIUM_FORMULA_TOOLTIP,
} from "@core/calculators/sodium/calculateHyperglycemiaCorrectedSodium";

export default function HyperglycemiaCorrectedSodiumPage() {
  const [serumSodium, setSerumSodium] = useState("");
  const [serumGlucose, setSerumGlucose] = useState("");

  const result = useMemo(() => {
    const sodium = parseFloat(serumSodium);
    const glucose = parseFloat(serumGlucose);
    if ([sodium, glucose].some((v) => Number.isNaN(v))) return null;
    try {
      return calculateHyperglycemiaCorrectedSodium({
        serumSodiumMmoll: sodium,
        serumGlucoseMgDl: glucose,
      });
    } catch (e) {
      return { error: (e as Error).message };
    }
  }, [serumSodium, serumGlucose]);

  return (
    <CalculatorShell
      title="Hyperglycemia sodium correction"
      description="Estimate corrected serum sodium during hyperglycemia to assess true sodium status independent of glucose effect."
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Serum sodium (mmol/L)" hint="mEq/L equivalent">
          <NumberInput
            value={serumSodium}
            onChange={setSerumSodium}
            min={0}
            placeholder="e.g. 132"
          />
        </Field>
        <Field label="Serum glucose (mg/dL)">
          <NumberInput
            value={serumGlucose}
            onChange={setSerumGlucose}
            min={0}
            placeholder="e.g. 450"
          />
        </Field>
      </div>

      {result && "error" in result ? (
        <ResultCard title="Error" error={result.error} />
      ) : result ? (
        <div className="space-y-4">
          <ResultCard
            title="Corrected sodium"
            titleTooltip={HYPERGLYCEMIA_SODIUM_FORMULA_TOOLTIP}
            value={`${result.value.correctedSodiumMmoll.toFixed(1)} mmol/L`}
            interpretation={result.interpretation}
            warning={result.warning}
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <MetricCard
              label="Measured sodium"
              value={`${result.value.serumSodiumMmoll.toFixed(1)} mmol/L`}
            />
            <MetricCard
              label="Glucose contribution"
              value={`${result.value.glucoseContributionMmoll >= 0 ? "+" : ""}${result.value.glucoseContributionMmoll.toFixed(1)} mmol/L`}
            />
          </div>
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
