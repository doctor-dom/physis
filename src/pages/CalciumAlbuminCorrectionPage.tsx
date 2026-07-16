import { useMemo, useState } from "react";
import {
  CalculatorReferenceFooter,
  CalculatorShell,
  Field,
  NumberInput,
  ResultCard,
} from "../components/FormFields";
import {
  calculateAlbuminCorrectedCalcium,
  DEFAULT_ALBUMIN_BASELINE_G_DL,
} from "@core/calculators/calcium/calculateAlbuminCorrectedCalcium";

export default function CalciumAlbuminCorrectionPage() {
  const [serumCalcium, setSerumCalcium] = useState("");
  const [patientAlbumin, setPatientAlbumin] = useState("");
  const [useCustomBaseline, setUseCustomBaseline] = useState(false);
  const [customBaselineAlbumin, setCustomBaselineAlbumin] = useState("4.0");

  const result = useMemo(() => {
    const calcium = parseFloat(serumCalcium);
    const albumin = parseFloat(patientAlbumin);
    const baseline = useCustomBaseline
      ? parseFloat(customBaselineAlbumin)
      : DEFAULT_ALBUMIN_BASELINE_G_DL;

    const values = useCustomBaseline
      ? [calcium, albumin, baseline]
      : [calcium, albumin];

    if (values.some((v) => Number.isNaN(v))) return null;

    try {
      return calculateAlbuminCorrectedCalcium({
        serumCalciumMgDl: calcium,
        patientAlbuminGdl: albumin,
        albuminBaselineGdl: baseline,
      });
    } catch (e) {
      return { error: (e as Error).message };
    }
  }, [serumCalcium, patientAlbumin, useCustomBaseline, customBaselineAlbumin]);

  return (
    <CalculatorShell
      title="Calcium correction for albumin"
      description="Correct total serum calcium for hyper- or hypoalbuminemia."
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Serum calcium (mg/dL)" hint="Measured total calcium">
          <NumberInput
            value={serumCalcium}
            onChange={setSerumCalcium}
            min={0}
            step="0.1"
            placeholder="e.g. 8.2"
          />
        </Field>
        <Field label="Patient albumin (g/dL)">
          <NumberInput
            value={patientAlbumin}
            onChange={setPatientAlbumin}
            min={0}
            step="0.1"
            placeholder="e.g. 2.8"
          />
        </Field>
      </div>

      <div className="space-y-3 rounded-xl border border-teal-100 bg-white p-4">
        <label className="flex items-center gap-2 text-sm text-teal-900">
          <input
            type="checkbox"
            checked={useCustomBaseline}
            onChange={(e) => setUseCustomBaseline(e.target.checked)}
            className="rounded border-teal-300 text-teal-700 focus:ring-teal-500"
          />
          Use custom normal albumin baseline
        </label>
        {!useCustomBaseline ? (
          <p className="text-xs text-teal-700">
            Normal albumin assumed:{" "}
            <strong>{DEFAULT_ALBUMIN_BASELINE_G_DL} g/dL</strong>
          </p>
        ) : (
          <Field
            label="Custom normal albumin baseline (g/dL)"
            hint="Replaces the default 4.0 g/dL reference"
          >
            <NumberInput
              value={customBaselineAlbumin}
              onChange={setCustomBaselineAlbumin}
              min={0}
              step="0.1"
              placeholder="e.g. 4.0"
            />
          </Field>
        )}
      </div>

      {result && "error" in result ? (
        <ResultCard title="Error" error={result.error} />
      ) : result ? (
        <div className="space-y-4">
          <ResultCard
            title="Corrected calcium"
            value={`${result.value.correctedCalciumMgDl.toFixed(1)} mg/dL`}
            interpretation={result.interpretation}
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <MetricCard
              label="Measured calcium"
              value={`${result.value.serumCalciumMgDl.toFixed(1)} mg/dL`}
            />
            <MetricCard
              label="Albumin contribution"
              value={`${result.value.albuminContributionMgDl >= 0 ? "+" : ""}${result.value.albuminContributionMgDl.toFixed(1)} mg/dL`}
            />
            <MetricCard
              label="Reference albumin"
              value={`${result.value.albuminBaselineGdl.toFixed(1)} g/dL`}
            />
            <MetricCard
              label="Patient albumin"
              value={`${result.value.patientAlbuminGdl.toFixed(1)} g/dL`}
            />
          </div>
          <CalculatorReferenceFooter>
            cCa = 0.8 × (normal albumin − patient albumin) + sCa. Normal albumin is
            assumed {DEFAULT_ALBUMIN_BASELINE_G_DL} g/dL unless a custom baseline is
            entered.
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
