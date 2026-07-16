import { useMemo, useState } from "react";
import CopyClinicalSummaryButton from "../components/CopyClinicalSummaryButton";
import NormogramChart from "../components/gonad-auxology/NormogramChart";
import SplChildReferenceCharts from "../components/gonad-auxology/SplChildReferenceCharts";
import {
  CalculatorReferenceFooter,
  CalculatorShell,
  Field,
  NumberInput,
  ResultCard,
} from "../components/FormFields";
import {
  calculateSplChild,
  splChildChartDomain,
} from "@core/calculators/gonad-auxology/calculateSplChild";
import { formatSplChildForCopy } from "@core/calculators/gonad-auxology/formatGonadAuxologyCopy";
import { formatPercentileAndSds } from "@core/calculators/gonad-auxology/normogramUtils";

export default function SplChildPage() {
  const [ageYears, setAgeYears] = useState("");
  const [splCm, setSplCm] = useState("");

  const result = useMemo(() => {
    const age = parseFloat(ageYears);
    const spl = parseFloat(splCm);
    if (Number.isNaN(age) || Number.isNaN(spl)) return null;
    try {
      return calculateSplChild({ ageYears: age, splCm: spl });
    } catch (e) {
      return { error: (e as Error).message };
    }
  }, [ageYears, splCm]);

  const copySummary =
    result && !("error" in result) ? formatSplChildForCopy(result.value) : null;

  return (
    <CalculatorShell
      title="Stretched penile length (child)"
      description="Plot SPL against decimal age using Bulgarian and two US reference nomograms (Schonfeld and Feldman)."
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Age (decimal years)" hint="0–19 years">
          <NumberInput value={ageYears} onChange={setAgeYears} min={0} step="0.1" placeholder="e.g. 7.5" />
        </Field>
        <Field label="Stretched penile length (cm)">
          <NumberInput value={splCm} onChange={setSplCm} min={0} step="0.1" placeholder="e.g. 4.6" />
        </Field>
      </div>

      {result && "error" in result ? (
        <ResultCard title="Error" error={result.error} />
      ) : result ? (
        <div className="space-y-4">
          <ResultCard title="Summary" interpretation={result.interpretation} />

          <CopyClinicalSummaryButton summary={copySummary} />

          <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
            {result.value.references.map((ref) => {
              const domain = splChildChartDomain(ref);
              return (
                <NormogramChart
                  key={ref.referenceId}
                  result={ref}
                  title={ref.referenceLabel}
                  xDomain={domain.x}
                  yDomain={domain.y}
                  citation={ref.citation}
                />
              );
            })}
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
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

          <SplChildReferenceCharts />

          <CalculatorReferenceFooter>
            Bulgarian reference uses 5th/50th/95th centiles by integer age with linear interpolation.
            US Schonfeld reference (Fig. 5, digitized from SPL-USA-SCHONFELD.png) uses 10th/median/90th
            decile curves with asymmetric SD above vs below the median. US Feldman reference (Aaronson age
            bands, digitized from SPL-child-USA-feldman.jpg) uses mean ± SD with 5th/50th/95th percentile
            curves through ~11 years. Micropenis is commonly defined as SPL below −2.5 SD for age.
          </CalculatorReferenceFooter>
        </div>
      ) : null}
    </CalculatorShell>
  );
}
