import { useMemo, useState } from "react";
import {
  CalculatorReferenceFooter,
  CalculatorShell,
  Field,
  InfoTooltip,
  NumberInput,
  ResultCard,
  SelectInput,
} from "../components/FormFields";
import {
  CAH_2003_CITATION,
  CAH_2018_CITATION,
  CAH_ISRAEL_CITATION,
  calculateCahScreening,
  convertOhpToNmolL,
  convertOhpToNgDl,
  convertOhpToNgMl,
  resolveCah2018Stratification,
  stratificationLabel,
  formatCah2018MatchedRow,
  formatCahIsraelMatchedRow,
  formatCah2003ThresholdSummary,
  formatPercentileLabel,
  type CahOhpUnit,
} from "@core/calculators/cah/calculateCahScreening";
import CahNomogramChartTabs from "../components/cah/CahNomogramChartTabs";

function riskBadgeClass(level: string): string {
  switch (level) {
    case "normal":
      return "border-green-200 bg-green-50 text-green-900";
    case "elevated":
      return "border-amber-200 bg-amber-50 text-amber-900";
    case "markedly_elevated":
      return "border-red-200 bg-red-50 text-red-900";
    case "repeat_requested":
      return "border-amber-200 bg-amber-50 text-amber-900";
    case "referral":
      return "border-red-200 bg-red-50 text-red-900";
    default:
      return "border-teal-200 bg-teal-50 text-teal-900";
  }
}

function formatRiskLabel(level: string): string {
  switch (level) {
    case "normal":
      return "Normal";
    case "elevated":
      return "Elevated — CAH possible";
    case "markedly_elevated":
      return "Markedly elevated — CAH probable";
    case "repeat_requested":
      return "Repeat sample requested";
    case "referral":
      return "Refer for CAH evaluation";
    default:
      return level;
  }
}

function parseOptionalPositive(value: string): number | undefined {
  if (value.trim() === "") return undefined;
  const n = parseFloat(value);
  if (Number.isNaN(n)) return undefined;
  return n;
}

function formatRangeMax(max: number, infinityLabel: string): string {
  return max >= 9999 ? infinityLabel : String(max);
}

export default function CahScreeningPage() {
  const [ohp17, setOhp17] = useState("");
  const [unit, setUnit] = useState<CahOhpUnit>("nmol/L");
  const [birthWeightG, setBirthWeightG] = useState("");
  const [gestationalAgeWeeks, setGestationalAgeWeeks] = useState("");
  const [sampleAgeDays, setSampleAgeDays] = useState("");

  const pendingStratification = useMemo(() => {
    return resolveCah2018Stratification({
      birthWeightG: parseOptionalPositive(birthWeightG),
      gestationalAgeWeeks: parseOptionalPositive(gestationalAgeWeeks),
    });
  }, [birthWeightG, gestationalAgeWeeks]);

  const result = useMemo(() => {
    const ohp = parseFloat(ohp17);
    if (Number.isNaN(ohp) || ohp <= 0) return null;

    const bw = parseOptionalPositive(birthWeightG);
    const ga = parseOptionalPositive(gestationalAgeWeeks);
    const ageRaw = sampleAgeDays.trim();
    const ageDays =
      ageRaw === "" ? undefined : parseOptionalPositive(sampleAgeDays);

    if (ageRaw !== "" && ageDays == null) return null;

    const has2003Inputs = bw != null && bw > 0 && ageDays != null;
    const has2018Inputs =
      (bw != null && bw > 0) || (ga != null && ga > 0);

    if (!has2003Inputs && !has2018Inputs) return null;

    try {
      return calculateCahScreening({
        ohp17: ohp,
        unit,
        birthWeightG: bw,
        gestationalAgeWeeks: ga,
        sampleAgeDays: ageDays,
      });
    } catch (e) {
      return { error: (e as Error).message };
    }
  }, [ohp17, unit, birthWeightG, gestationalAgeWeeks, sampleAgeDays]);

  const convertedPreview = useMemo(() => {
    const ohp = parseFloat(ohp17);
    if (Number.isNaN(ohp) || ohp <= 0) return null;
    const nmol = convertOhpToNmolL(ohp, unit);
    const ngDl = convertOhpToNgDl(nmol);
    const ngMl = convertOhpToNgMl(nmol);
    return `${nmol.toFixed(2)} nmol/L · ${ngDl.toFixed(1)} ng/dL · ${ngMl.toFixed(2)} ng/mL`;
  }, [ohp17, unit]);

  return (
    <CalculatorShell
      title="CAH Screening"
      description="Stratify elevated newborn 17-OHP using Olgemöller 2003 and Israeli NBS algorithms with percentile context."
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="17-OHP"
          labelTooltip="Use extracted or Esoterix 17-OHP when available. The standard newborn screening assay is typically falsely elevated because it includes cross-reacting steroids, notably 17-OHPreg-sulfate."
        >
          <NumberInput
            value={ohp17}
            onChange={setOhp17}
            min={0}
            step="0.1"
            placeholder="e.g. 45"
          />
        </Field>
        <Field label="Units">
          <SelectInput
            value={unit}
            onChange={(v) => setUnit(v as CahOhpUnit)}
            options={[
              { value: "nmol/L", label: "nmol/L" },
              { value: "ng/dL", label: "ng/dL" },
              { value: "ng/mL", label: "ng/mL" },
            ]}
          />
        </Field>
        <Field
          label="Birth weight (g)"
          hint="Optional — required for Olgemöller 2003 and Israeli NBS algorithm; with GA enables Table 1 percentile insight"
        >
          <NumberInput
            value={birthWeightG}
            onChange={setBirthWeightG}
            min={0}
            step="1"
            placeholder="e.g. 2850"
          />
        </Field>
        <Field
          label="Gestational age (weeks)"
          hint="Optional — decimal weeks allowed (e.g. 36.5)"
        >
          <NumberInput
            value={gestationalAgeWeeks}
            onChange={setGestationalAgeWeeks}
            min={0}
            step="0.1"
            placeholder="e.g. 38"
          />
        </Field>
        <label className="block space-y-1">
          <span className="text-sm font-medium text-teal-900">
            Age at sample (days)
            <InfoTooltip text="The Olgemöller 2003 (CAH-2003) table requires birth weight and day of life when the sample was drawn. Enter both to see 2003 results." />
          </span>
          <span className="block text-xs text-teal-700/70">
            Optional — required for CAH-2003 nomogram
          </span>
          <NumberInput
            value={sampleAgeDays}
            onChange={setSampleAgeDays}
            min={0}
            step="1"
            placeholder="e.g. 2"
          />
        </label>
      </div>

      {pendingStratification && !result && (
        <p className="text-sm text-teal-700">
          Table 1 percentile insight will use:{" "}
          <strong>{stratificationLabel(pendingStratification)}</strong>
        </p>
      )}

      {convertedPreview && (
        <p className="text-sm text-teal-800">
          Equivalent: <strong>{convertedPreview}</strong>
        </p>
      )}

      {result && "error" in result ? (
        <ResultCard title="Error" error={result.error} />
      ) : result ? (
        <div className="space-y-4">
          <ResultCard
            title={result.value.cahSuspected ? "CAH suspected" : "CAH not suggested"}
            value={`${result.value.ohpNmol.toFixed(1)} nmol/L (${result.value.ohpNgDl.toFixed(0)} ng/dL · ${convertOhpToNgMl(result.value.ohpNmol).toFixed(2)} ng/mL)`}
            interpretation={result.interpretation}
          />

          <div className="grid gap-4 lg:grid-cols-2">
            {result.value.nomogram2003 ? (
              <section className="space-y-2 rounded-xl border border-teal-100 bg-white p-4">
                <h3 className="text-sm font-semibold text-teal-900">
                  Screening — Olgemöller 2003
                  <InfoTooltip text="Birth weight and sample age multitier thresholds (Olgemöller et al. 2003)." />
                </h3>
                <p
                  className={`rounded-lg border px-3 py-2 text-sm ${riskBadgeClass(result.value.nomogram2003.riskLevel)}`}
                >
                  {formatRiskLabel(result.value.nomogram2003.riskLevel)}
                </p>
                <p className="text-sm text-teal-800">
                  {result.value.nomogram2003.interpretation}
                </p>
                <p className="text-xs text-teal-600">
                  Thresholds for {result.value.nomogram2003.matchedRow.bwMinG}–
                  {formatRangeMax(result.value.nomogram2003.matchedRow.bwMaxG, "∞")}{" "}
                  g, sample day{" "}
                  {result.value.nomogram2003.matchedRow.ageMinDays}–
                  {formatRangeMax(
                    result.value.nomogram2003.matchedRow.ageMaxDays,
                    "∞",
                  )}
                  : {formatCah2003ThresholdSummary(result.value.nomogram2003.matchedRow)}
                </p>
              </section>
            ) : (
              <section className="rounded-xl border border-dashed border-teal-200 bg-teal-50/30 p-4 text-sm text-teal-700">
                <h3 className="font-semibold text-teal-900">Olgemöller 2003</h3>
                <p className="mt-1">
                  Enter <strong>birth weight</strong> and{" "}
                  <strong>age at sample (days)</strong> to evaluate the 2003
                  screening nomogram.
                </p>
              </section>
            )}

            {result.value.nomogramIsrael ? (
              <section className="space-y-2 rounded-xl border border-teal-100 bg-white p-4">
                <h3 className="text-sm font-semibold text-teal-900">
                  Screening — Israeli NBS algorithm
                  <InfoTooltip text="Operational Israeli newborn screening cutoffs for repeat requests and repeat-sample interpretation (Pode-Shakked 2019 Table 2). GA is rounded up to the next whole week." />
                </h3>
                {result.value.nomogramIsrael.gestationalAgeWeeksUsed != null ? (
                  <p className="text-xs font-medium text-teal-700">
                    GA used for row matching:{" "}
                    {result.value.nomogramIsrael.gestationalAgeWeeksUsed} wk (rounded up)
                  </p>
                ) : (
                  <p className="text-xs font-medium text-teal-700">
                    GA not provided — using unknown-GA row for birth-weight stratum
                  </p>
                )}
                <p
                  className={`rounded-lg border px-3 py-2 text-sm ${riskBadgeClass(result.value.nomogramIsrael.riskLevel)}`}
                >
                  {formatRiskLabel(result.value.nomogramIsrael.riskLevel)}
                </p>
                <p className="text-sm text-teal-800">
                  {result.value.nomogramIsrael.interpretation}
                </p>
                <p className="text-xs text-teal-600">
                  Table 2 row:{" "}
                  {formatCahIsraelMatchedRow(result.value.nomogramIsrael.matchedRow)}
                  ; repeat-request cutoff:{" "}
                  {result.value.nomogramIsrael.repeatRequestCutoffNmol} nmol/L
                  {result.value.nomogramIsrael.firstSampleReferralCutoffNmol != null && (
                    <>
                      ; first-sample CAH referral: ≥
                      {result.value.nomogramIsrael.firstSampleReferralCutoffNmol}{" "}
                      nmol/L
                    </>
                  )}
                  {result.value.nomogramIsrael.maxRepeatNormalNmol != null && (
                    <>
                      ; max repeat still normal: &lt;
                      {result.value.nomogramIsrael.maxRepeatNormalNmol.toFixed(1)}{" "}
                      nmol/L (&gt;{result.value.nomogramIsrael.reductionMinPct}%
                      reduction)
                    </>
                  )}
                  {result.value.nomogramIsrael.repeatNormalAbsoluteNmol != null && (
                    <>
                      ; repeat normal if &lt;
                      {result.value.nomogramIsrael.repeatNormalAbsoluteNmol} nmol/L
                    </>
                  )}
                </p>
              </section>
            ) : (
              <section className="rounded-xl border border-dashed border-teal-200 bg-teal-50/30 p-4 text-sm text-teal-700">
                <h3 className="font-semibold text-teal-900">Israeli NBS algorithm</h3>
                <p className="mt-1">
                  Enter <strong>birth weight</strong> to evaluate the Israeli NBS
                  screening algorithm (optional GA refines the row).
                </p>
              </section>
            )}
          </div>

          {result.value.percentileInsight2018 ? (
            <section className="space-y-3 rounded-xl border border-teal-100 bg-white p-4">
              <h3 className="text-sm font-semibold text-teal-900">
                2018 Israel 17OHP Percentile Insight
                <InfoTooltip text="Pode-Shakked 2019 Table 1 percentile chart used alongside the Israeli algorithm. Estimates where the 17-OHP value falls relative to published percentiles for the best-matching BW/GA row." />
              </h3>
              <p className="text-xs font-medium text-teal-700">
                {result.value.percentileInsight2018.stratificationLabel}
              </p>
              <p
                className={`rounded-lg border px-3 py-2 text-sm ${
                  result.value.percentileInsight2018.recommendWorkup
                    ? "border-amber-200 bg-amber-50 text-amber-900"
                    : "border-green-200 bg-green-50 text-green-900"
                }`}
              >
                {result.value.percentileInsight2018.recommendWorkup
                  ? "Further CAH workup suggested — exceeds Table 1 percentile threshold(s)"
                  : `Estimated percentile: ${result.value.percentileInsight2018.estimatedPercentileLabel}`}
              </p>
              <p className="text-sm text-teal-800">
                {result.value.percentileInsight2018.interpretation}
              </p>
              <p className="text-xs text-teal-600">
                Table 1 row:{" "}
                {formatCah2018MatchedRow(result.value.percentileInsight2018.matchedRow)}
              </p>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[16rem] text-left text-xs text-teal-800">
                  <thead>
                    <tr className="border-b border-teal-100 text-teal-600">
                      <th className="py-1 pr-3 font-medium">Percentile</th>
                      <th className="py-1 pr-3 font-medium">Cutoff (nmol/L)</th>
                      <th className="py-1 font-medium">17-OHP</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.value.percentileInsight2018.tierComparisons.map((tier) => (
                      <tr key={tier.percentile} className="border-b border-teal-50">
                        <td className="py-1 pr-3">{formatPercentileLabel(tier.percentile)}</td>
                        <td className="py-1 pr-3">{tier.cutoffNmol}</td>
                        <td className="py-1">
                          {tier.exceeded ? "Above" : "At or below"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ) : null}

          <CahNomogramChartTabs
            show2003={result.value.nomogram2003 != null}
            show2018={result.value.percentileInsight2018 != null}
            showIsrael={result.value.nomogramIsrael != null}
            stratificationNote={
              result.value.percentileInsight2018?.stratificationLabel
            }
          />

          <section className="rounded-xl border border-teal-100 bg-teal-50/40 p-4 text-sm text-teal-900">
            <h3 className="font-semibold text-teal-900">References</h3>
            <ul className="mt-2 list-disc space-y-2 pl-5">
              <li>{CAH_2003_CITATION} (2003 screening nomogram)</li>
              <li>{CAH_ISRAEL_CITATION} (Israeli NBS algorithm, Table 2)</li>
              <li>{CAH_2018_CITATION} (Table 1 percentile chart)</li>
            </ul>
            <CalculatorReferenceFooter>
              Elevated 17-OHP risk-stratification algorithm based on Olgemöller 2003 and
              Pode-Shakked 2019 data. Nomogram data from{" "}
              <code className="rounded bg-white px-1">data/excel/CAH-2003.csv</code>,{" "}
              <code className="rounded bg-white px-1">data/excel/CAH-2018-Israel.csv</code>, and{" "}
              <code className="rounded bg-white px-1">data/excel/CAH-2018.csv</code>.
              Screening uses Olgemöller 2003 and the Israeli NBS algorithm; Table 1
              percentiles provide supplementary context. Thresholds are assay- and
              program-specific; confirm with local newborn screening protocol.
            </CalculatorReferenceFooter>
          </section>
        </div>
      ) : null}
    </CalculatorShell>
  );
}
