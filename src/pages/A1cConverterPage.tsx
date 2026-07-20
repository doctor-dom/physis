import { useEffect, useState, type KeyboardEvent } from "react";
import {
  CalculatorShell,
  Field,
  NumberInput,
  ResultCard,
} from "../components/FormFields";
import {
  A1C_REFERENCE_TOOLTIP,
  convertA1cMetrics,
  DEFAULT_FRUCTOSAMINE_A1C_METHOD,
  EAG_REFERENCE_TOOLTIP,
  formatA1cPercent,
  formatFructosamine,
  FRUCTOSAMINE_A1C_METHOD_TOOLTIP,
  FRUCTOSAMINE_REFERENCE_TOOLTIP,
  getFructosamineA1cMethodMeta,
  GMI_REFERENCE_TOOLTIP,
  type A1cMetricInput,
  type A1cMetrics,
  type FructosamineA1cMethodId,
} from "@core/calculators/a1c/convertA1cMetrics";

const EMPTY_INPUTS: Record<A1cMetricInput, string> = {
  a1c: "",
  gmi: "",
  fructosamine: "",
  eag: "",
};

const METRIC_FIELDS: {
  key: A1cMetricInput;
  label: string;
  labelTooltip: string;
  labelTooltipWide?: boolean;
  placeholder: string;
  step: string;
}[] = [
  {
    key: "a1c",
    label: "HbA1c (%)",
    labelTooltip: A1C_REFERENCE_TOOLTIP,
    placeholder: "e.g. 7.5",
    step: "0.1",
  },
  {
    key: "gmi",
    label: "GMI (%)",
    labelTooltip: GMI_REFERENCE_TOOLTIP,
    placeholder: "e.g. 7.2",
    step: "0.1",
  },
  {
    key: "fructosamine",
    label: "Fructosamine (µmol/L)",
    labelTooltip: FRUCTOSAMINE_REFERENCE_TOOLTIP,
    labelTooltipWide: true,
    placeholder: "e.g. 280",
    step: "1",
  },
  {
    key: "eag",
    label: "eAG / mean glucose (mg/dL)",
    labelTooltip: EAG_REFERENCE_TOOLTIP,
    placeholder: "e.g. 168",
    step: "any",
  },
];

function metricsToInputs(metrics: A1cMetrics): Record<A1cMetricInput, string> {
  const eagRounded = Math.round(metrics.eagMgDl * 10) / 10;
  return {
    a1c: metrics.a1cPercent.toFixed(1),
    gmi: metrics.gmiPercent.toFixed(1),
    fructosamine: String(Math.round(metrics.fructosamineUmolL)),
    eag: eagRounded % 1 === 0 ? eagRounded.toFixed(0) : eagRounded.toFixed(1),
  };
}

export default function A1cConverterPage() {
  const [inputs, setInputs] = useState(EMPTY_INPUTS);
  const [sourceMetric, setSourceMetric] = useState<A1cMetricInput | null>(null);
  const [sourceValue, setSourceValue] = useState<number | null>(null);
  const [fructosamineMethod, setFructosamineMethod] = useState<FructosamineA1cMethodId>(
    DEFAULT_FRUCTOSAMINE_A1C_METHOD,
  );
  const [error, setError] = useState<string | null>(null);
  const [interpretation, setInterpretation] = useState<string | null>(null);
  const [alternateFructosamineNote, setAlternateFructosamineNote] = useState<string | null>(
    null,
  );

  const isLocked = sourceMetric !== null;
  const useYoungMethod = fructosamineMethod === "young";
  const activeMethod = getFructosamineA1cMethodMeta(fructosamineMethod);

  useEffect(() => {
    if (!isLocked || sourceValue === null || sourceMetric === null) return;

    try {
      const result = convertA1cMetrics({
        metric: sourceMetric,
        value: sourceValue,
        fructosamineMethod,
      });
      setInputs(metricsToInputs(result.value));
      setInterpretation(result.interpretation ?? null);
      const alternate = result.value.fructosamineMethods.find(
        (method) => method.id !== fructosamineMethod,
      );
      if (alternate) {
        setAlternateFructosamineNote(
          sourceMetric === "fructosamine"
            ? `Alternate (${alternate.citation}): A1c ${formatA1cPercent(alternate.a1cPercent)}`
            : `Alternate (${alternate.citation}): Fructosamine ${formatFructosamine(alternate.fructosamineUmolL)}`,
        );
      } else {
        setAlternateFructosamineNote(null);
      }
      setError(null);
    } catch (e) {
      setError((e as Error).message);
    }
  }, [fructosamineMethod, isLocked, sourceMetric, sourceValue]);

  function applyConversion(metric: A1cMetricInput, raw: string) {
    const trimmed = raw.trim();
    if (!trimmed) return;

    const parsed = parseFloat(trimmed);
    if (Number.isNaN(parsed)) {
      setError("Enter a valid number.");
      return;
    }

    try {
      const result = convertA1cMetrics({
        metric,
        value: parsed,
        fructosamineMethod,
      });
      setSourceMetric(metric);
      setSourceValue(parsed);
      setInputs(metricsToInputs(result.value));
      setInterpretation(result.interpretation ?? null);
      const alternate = result.value.fructosamineMethods.find(
        (method) => method.id !== fructosamineMethod,
      );
      if (alternate) {
        setAlternateFructosamineNote(
          metric === "fructosamine"
            ? `Alternate (${alternate.citation}): A1c ${formatA1cPercent(alternate.a1cPercent)}`
            : `Alternate (${alternate.citation}): Fructosamine ${formatFructosamine(alternate.fructosamineUmolL)}`,
        );
      } else {
        setAlternateFructosamineNote(null);
      }
      setError(null);
    } catch (e) {
      setError((e as Error).message);
    }
  }

  function handleChange(metric: A1cMetricInput, value: string) {
    if (isLocked) return;
    setInputs((prev) => ({ ...prev, [metric]: value }));
    setError(null);
  }

  function handleBlur(metric: A1cMetricInput) {
    if (isLocked) return;
    applyConversion(metric, inputs[metric]);
  }

  function handleKeyDown(metric: A1cMetricInput, event: KeyboardEvent<HTMLInputElement>) {
    if (isLocked || event.key !== "Enter") return;
    applyConversion(metric, inputs[metric]);
  }

  function handleReset() {
    setInputs(EMPTY_INPUTS);
    setSourceMetric(null);
    setSourceValue(null);
    setError(null);
    setInterpretation(null);
    setAlternateFructosamineNote(null);
  }

  return (
    <CalculatorShell
      title="A1c Converter"
      description="GMI <> A1c <> Fructosamine <> eAG"
    >
      <p className="text-sm text-teal-800/90">
        Enter any one value below; the other metrics will fill automatically. Use Reset to
        enter a new value.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        {METRIC_FIELDS.map(({ key, label, labelTooltip, labelTooltipWide, placeholder, step }) => {
          const isSource = sourceMetric === key;
          const isDerived = isLocked && !isSource;

          return (
            <Field
              key={key}
              label={label}
              labelTooltip={labelTooltip}
              labelTooltipWide={labelTooltipWide}
            >
              <NumberInput
                value={inputs[key]}
                onChange={(value) => handleChange(key, value)}
                onBlur={() => handleBlur(key)}
                onKeyDown={(event) => handleKeyDown(key, event)}
                min={0}
                step={step}
                placeholder={placeholder}
                disabled={isDerived}
                readOnly={isSource}
              />
            </Field>
          );
        })}
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

      <div>
        <button
          type="button"
          onClick={handleReset}
          disabled={!isLocked && !Object.values(inputs).some((value) => value.trim() !== "")}
          className="inline-flex items-center justify-center rounded-xl border border-teal-200 bg-white px-4 py-2 text-sm font-semibold text-teal-800 shadow-sm transition hover:border-teal-300 hover:bg-teal-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Reset
        </button>
      </div>

      {isLocked && interpretation && (
        <p className="text-sm text-teal-700">{interpretation}</p>
      )}

      {error && <ResultCard title="Error" error={error} />}

      {alternateFructosamineNote && (
        <p className="text-xs text-teal-700">{alternateFructosamineNote}</p>
      )}
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
