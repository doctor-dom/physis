import { useMemo, useState } from "react";
import CopyClinicalSummaryButton from "../components/CopyClinicalSummaryButton";
import ZoomableNormogramChart from "../components/gonad-auxology/ZoomableNormogramChart";
import {
  CalculatorReferenceFooter,
  CalculatorShell,
  Field,
  NumberInput,
  ResultCard,
} from "../components/FormFields";
import {
  calculateSplNewborn,
  splNewbornChartDomain,
} from "@core/calculators/gonad-auxology/calculateSplNewborn";
import { formatSplNewbornForCopy } from "@core/calculators/gonad-auxology/formatGonadAuxologyCopy";
import { formatPercentileAndSds } from "@core/calculators/gonad-auxology/normogramUtils";

export default function SplNewbornPage() {
  const [gaWeeks, setGaWeeks] = useState("");
  const [splCm, setSplCm] = useState("");

  const result = useMemo(() => {
    const ga = parseFloat(gaWeeks);
    const spl = parseFloat(splCm);
    if (Number.isNaN(ga) || Number.isNaN(spl)) return null;
    try {
      return calculateSplNewborn({ gestationalAgeWeeks: ga, splCm: spl });
    } catch (e) {
      return { error: (e as Error).message };
    }
  }, [gaWeeks, splCm]);

  const copySummary =
    result && !("error" in result) ? formatSplNewbornForCopy(result.value) : null;

  return (
    <CalculatorShell
      title="Stretched penile length (newborn)"
      description="Plot SPL against gestational age using Turkish preterm/term data (Halil et al.) and US newborn standards (Feldman & Smith, via Aaronson)."
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Gestational age (weeks)" hint="26–41 weeks">
          <NumberInput value={gaWeeks} onChange={setGaWeeks} min={0} step="1" placeholder="e.g. 38" />
        </Field>
        <Field label="Stretched penile length (cm)">
          <NumberInput value={splCm} onChange={setSplCm} min={0} step="0.1" placeholder="e.g. 3.2" />
        </Field>
      </div>

      {result && "error" in result ? (
        <ResultCard title="Error" error={result.error} />
      ) : result ? (
        <div className="space-y-4">
          <ResultCard title="Summary" interpretation={result.interpretation} />

          <CopyClinicalSummaryButton summary={copySummary} />

          <div className="grid gap-3 sm:grid-cols-2">
            {result.value.references.map((ref) => (
              <div
                key={ref.referenceId}
                className="rounded-xl border border-teal-100 bg-white px-4 py-3 text-sm text-teal-900"
              >
                <p className="font-medium">{ref.referenceLabel}</p>
                <p className="mt-1 tabular-nums">
                  {formatPercentileAndSds(ref.patient.percentile, ref.patient.sds)}
                </p>
              </div>
            ))}
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            {result.value.references.map((ref) => {
              const domain = splNewbornChartDomain(ref, ref.extraCurves);
              return (
                <ZoomableNormogramChart
                  key={ref.referenceId}
                  result={ref}
                  title={ref.referenceLabel}
                  xDomain={domain.x}
                  yDomain={domain.y}
                  citation={ref.citation}
                  extraCurves={ref.extraCurves}
                />
              );
            })}
          </div>

          <CalculatorReferenceFooter>
            Measure SPL from pubic ramus to glans with gentle traction. Halil et al. nomogram shows
            5th, 50th, and 95th percentile curves across 26–41 weeks gestation. Feldman & Smith data
            (30, 34, and 38+ weeks; summarized by Aaronson) uses mean ± SD with 5th/50th/95th curves
            and a dashed red −2.5 SD micropenis threshold. Click any nomogram to enlarge axis labels.
          </CalculatorReferenceFooter>
        </div>
      ) : null}
    </CalculatorShell>
  );
}
