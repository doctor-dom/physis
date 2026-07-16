import { useMemo, useState } from "react";
import CopyClinicalSummaryButton from "../components/CopyClinicalSummaryButton";
import NormogramChart from "../components/gonad-auxology/NormogramChart";
import {
  CalculatorReferenceFooter,
  CalculatorShell,
  Field,
  NumberInput,
  ResultCard,
} from "../components/FormFields";
import {
  calculateClitoralDimension,
  clitoralChartDomain,
  CLITORAL_CITATION,
} from "@core/calculators/gonad-auxology/calculateClitoralDimension";
import { formatClitoralDimensionForCopy } from "@core/calculators/gonad-auxology/formatGonadAuxologyCopy";
import { formatPercentileAndSds } from "@core/calculators/gonad-auxology/normogramUtils";

export default function ClitoralDimensionPage() {
  const [gaWeeks, setGaWeeks] = useState("");
  const [lengthCm, setLengthCm] = useState("");
  const [widthCm, setWidthCm] = useState("");

  const result = useMemo(() => {
    const ga = parseFloat(gaWeeks);
    const length = lengthCm.trim() === "" ? undefined : parseFloat(lengthCm);
    const width = widthCm.trim() === "" ? undefined : parseFloat(widthCm);
    if (Number.isNaN(ga)) return null;
    if (length != null && Number.isNaN(length)) return null;
    if (width != null && Number.isNaN(width)) return null;
    try {
      return calculateClitoralDimension({
        gestationalAgeWeeks: ga,
        lengthCm: length,
        widthCm: width,
      });
    } catch (e) {
      return { error: (e as Error).message };
    }
  }, [gaWeeks, lengthCm, widthCm]);

  const copySummary =
    result && !("error" in result) ? formatClitoralDimensionForCopy(result.value) : null;

  return (
    <CalculatorShell
      title="Clitoral dimensions (neonate)"
      description="Plot clitoral length and/or width against gestational age using Alaei et al. reference data."
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Gestational age (weeks)" hint="28–42 weeks">
          <NumberInput value={gaWeeks} onChange={setGaWeeks} min={0} step="1" placeholder="e.g. 38" />
        </Field>
        <Field label="Clitoral length (cm)">
          <NumberInput value={lengthCm} onChange={setLengthCm} min={0} step="0.1" placeholder="optional" />
        </Field>
        <Field label="Clitoral width (cm)">
          <NumberInput value={widthCm} onChange={setWidthCm} min={0} step="0.1" placeholder="optional" />
        </Field>
      </div>

      {result && "error" in result ? (
        <ResultCard title="Error" error={result.error} />
      ) : result ? (
        <div className="space-y-4">
          <ResultCard title="Summary" interpretation={result.interpretation} />

          <CopyClinicalSummaryButton summary={copySummary} />

          <div className="grid gap-3 sm:grid-cols-2">
            {result.value.measurements.map((m) => (
              <div
                key={m.kind}
                className="rounded-xl border border-teal-100 bg-white px-4 py-3 text-sm text-teal-900"
              >
                <p className="font-medium capitalize">{m.yLabel}</p>
                <p className="mt-1 tabular-nums">
                  {formatPercentileAndSds(m.patient.percentile, m.patient.sds)}
                </p>
              </div>
            ))}
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            {result.value.measurements.map((measurement) => {
              const domain = clitoralChartDomain(measurement);
              return (
                <NormogramChart
                  key={measurement.kind}
                  result={measurement}
                  title={`Clitoral ${measurement.kind} vs gestational age`}
                  xDomain={domain.x}
                  yDomain={domain.y}
                  citation={CLITORAL_CITATION}
                />
              );
            })}
          </div>

          <CalculatorReferenceFooter>
            Reference values are reported as mean and +1/+2/+3 SD by gestational age week. Percentile
            estimated by interpolation on the SD scale at the nearest gestational age stratum.
          </CalculatorReferenceFooter>
        </div>
      ) : null}
    </CalculatorShell>
  );
}
