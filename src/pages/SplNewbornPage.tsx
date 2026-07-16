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
  calculateSplNewborn,
  SPL_NEWBORN_CITATION,
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

  const chartDomain =
    result && !("error" in result) ? splNewbornChartDomain(result.value) : null;

  const copySummary =
    result && !("error" in result) ? formatSplNewbornForCopy(result.value) : null;

  return (
    <CalculatorShell
      title="Stretched penile length (newborn)"
      description="Plot SPL against gestational age using Turkish preterm/term reference data (Halil et al.)."
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
          <ResultCard
            title="Percentile & SDS"
            value={formatPercentileAndSds(
              result.value.patient.percentile,
              result.value.patient.sds,
            )}
            interpretation={result.interpretation}
          />

          <CopyClinicalSummaryButton summary={copySummary} />

          {chartDomain ? (
            <NormogramChart
              result={result.value}
              title="SPL vs gestational age (Turkey, preterm/term)"
              xDomain={chartDomain.x}
              yDomain={chartDomain.y}
              citation={SPL_NEWBORN_CITATION}
            />
          ) : null}
          <CalculatorReferenceFooter>
            Measure SPL from pubic ramus to glans with gentle traction. Nomogram shows 5th, 50th, and
            95th percentile curves; percentile estimated by interpolation between reference centiles
            at the entered gestational age.
          </CalculatorReferenceFooter>
        </div>
      ) : null}
    </CalculatorShell>
  );
}
