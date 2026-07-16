import { useMemo, useState } from "react";
import {
  CalculatorReferenceFooter,
  CalculatorShell,
  Field,
  NumberInput,
  ResultCard,
  SelectInput,
} from "../components/FormFields";
import {
  convertA1cMetrics,
  DEFAULT_FRUCTOSAMINE_A1C_METHOD,
  formatA1cPercent,
  formatEagMgDl,
  formatFructosamine,
  formatGmiPercent,
  FRUCTOSAMINE_A1C_METHOD_TOOLTIP,
  getFructosamineA1cMethodMeta,
  type A1cMetricInput,
  type FructosamineA1cMethodId,
} from "@core/calculators/a1c/convertA1cMetrics";

const METRIC_OPTIONS: { value: A1cMetricInput; label: string; placeholder: string }[] = [
  { value: "a1c", label: "HbA1c (%)", placeholder: "e.g. 7.5" },
  { value: "gmi", label: "GMI (%)", placeholder: "e.g. 7.2" },
  { value: "fructosamine", label: "Fructosamine (µmol/L)", placeholder: "e.g. 280" },
  { value: "eag", label: "eAG / mean glucose (mg/dL)", placeholder: "e.g. 168" },
];

export default function A1cConverterPage() {
  const [metric, setMetric] = useState<A1cMetricInput>("a1c");
  const [value, setValue] = useState("");
  const [fructosamineMethod, setFructosamineMethod] = useState<FructosamineA1cMethodId>(
    DEFAULT_FRUCTOSAMINE_A1C_METHOD,
  );

  const selected = METRIC_OPTIONS.find((m) => m.value === metric)!;
  const useYoungMethod = fructosamineMethod === "young";

  const result = useMemo(() => {
    const parsed = parseFloat(value);
    if (Number.isNaN(parsed)) return null;
    try {
      return convertA1cMetrics({ metric, value: parsed, fructosamineMethod });
    } catch (e) {
      return { error: (e as Error).message };
    }
  }, [metric, value, fructosamineMethod]);

  const activeMethod = getFructosamineA1cMethodMeta(fructosamineMethod);
  const alternateMethod = result && !("error" in result)
    ? result.value.fructosamineMethods.find((method) => method.id !== fructosamineMethod)
    : undefined;

  return (
    <CalculatorShell
      title="A1c Converter"
      description="GMI <> A1c <> Fructosamine <> eAG"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Known metric">
          <SelectInput
            value={metric}
            onChange={(v) => setMetric(v as A1cMetricInput)}
            options={METRIC_OPTIONS.map((m) => ({ value: m.value, label: m.label }))}
          />
        </Field>
        <Field label={selected.label}>
          <NumberInput
            value={value}
            onChange={setValue}
            min={0}
            step="any"
            placeholder={selected.placeholder}
          />
        </Field>
      </div>

      <Field
        label="Fructosamine ↔ A1c equation"
        labelTooltip={FRUCTOSAMINE_A1C_METHOD_TOOLTIP}
        hint={activeMethod.a1cFromFructosamineFormula}
      >
        <FructosamineMethodToggle
          useYoungMethod={useYoungMethod}
          onChange={(useYoung) => setFructosamineMethod(useYoung ? "young" : "cohen")}
        />
      </Field>

      {result && "error" in result ? (
        <ResultCard title="Error" error={result.error} />
      ) : result ? (
        <div className="space-y-4">
          <ResultCard
            title="Converted values"
            interpretation={result.interpretation}
          />

          <div className="grid gap-3 sm:grid-cols-2">
            <MetricCard
              label="HbA1c"
              value={formatA1cPercent(result.value.a1cPercent)}
              highlight={metric === "a1c" || metric === "fructosamine"}
            />
            <MetricCard
              label="Fructosamine"
              value={formatFructosamine(result.value.fructosamineUmolL)}
              highlight={metric === "fructosamine" || metric === "a1c"}
            />
            <MetricCard
              label="GMI"
              value={formatGmiPercent(result.value.gmiPercent)}
              highlight={metric === "gmi"}
            />
            <MetricCard
              label="eAG (estimated average glucose)"
              value={formatEagMgDl(result.value.eagMgDl)}
              highlight={metric === "eag"}
            />
          </div>

          {alternateMethod && (
            <p className="text-xs text-teal-700">
              Alternate ({alternateMethod.citation}):{" "}
              {metric === "fructosamine" ? (
                <>A1c {formatA1cPercent(alternateMethod.a1cPercent)}</>
              ) : (
                <>Fructosamine {formatFructosamine(alternateMethod.fructosamineUmolL)}</>
              )}
            </p>
          )}

          <CalculatorReferenceFooter>
            GMI uses the same mean glucose (mg/dL) as eAG. eAG (mg/dL) = 28.7 × A1c (%) −
            46.7; GMI (%) = 3.31 + 0.02392 × mean glucose (mg/dL). Preferred fructosamine ↔
            A1c: Cohen et al., ADA 2003 — A1c (%) = 0.017 × Fructosamine (µmol/L) + 1.61.
            Alternate: Young et al., MilMed 2025 — A1c (%) = 0.0154 × Fructosamine (µmol/L) +
            3.121.
          </CalculatorReferenceFooter>
        </div>
      ) : null}
    </CalculatorShell>
  );
}

function FructosamineMethodToggle({
  useYoungMethod,
  onChange,
}: {
  useYoungMethod: boolean;
  onChange: (useYoung: boolean) => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <span
        className={`text-sm ${useYoungMethod ? "font-semibold text-teal-950" : "text-teal-600"}`}
      >
        Young et al.
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={!useYoungMethod}
        aria-label="Fructosamine to A1c conversion method"
        onClick={() => onChange(!useYoungMethod)}
        className={`relative h-7 w-14 shrink-0 rounded-full border transition-colors ${
          useYoungMethod
            ? "border-teal-300 bg-teal-100"
            : "border-teal-500 bg-teal-600"
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
            useYoungMethod ? "left-1" : "left-8"
          }`}
        />
      </button>
      <span
        className={`text-sm ${!useYoungMethod ? "font-semibold text-teal-950" : "text-teal-600"}`}
      >
        Cohen et al.
      </span>
    </div>
  );
}

function MetricCard({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight: boolean;
}) {
  return (
    <div
      className={`rounded-xl border px-4 py-3 ${
        highlight
          ? "border-teal-400 bg-teal-50 shadow-sm"
          : "border-teal-100 bg-white"
      }`}
    >
      <p className="text-xs font-medium uppercase tracking-wide text-teal-600">{label}</p>
      <p className="mt-1 text-xl font-semibold tabular-nums text-teal-950">{value}</p>
    </div>
  );
}
