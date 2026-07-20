import { useMemo, useState, type ReactNode } from "react";
import { CalculatorShell, InfoTooltip, NumberInput } from "../components/FormFields";
import {
  calculateRenalElectrolytePanel,
  renalPanelResultIsError,
} from "@core/calculators/electrolytes/renalElectrolytePanel";
import {
  CCR_CASR_TEST_TOOLTIP,
  CCR_FHH_LIKELY_TOOLTIP,
  CCR_FHH_UNLIKELY_TOOLTIP,
  CCR_FORMULA_TEXT,
  getCcrFlagStatus,
  getSpotUcaUcrFlagStatus,
  getTrpFlagStatus,
  getTtkgFlagStatus,
  SPOT_UCA_UCR_FHH_NOTE_TOOLTIP,
  SPOT_UCA_UCR_FORMULA_TEXT,
  SPOT_UCA_UCR_NEPHROCALCINOSIS_TOOLTIP,
  SPOT_UCA_UCR_PERCENTILE_CUTOFFS,
  SPOT_UCA_UCR_PERCENTILE_HEADING,
  TTKG_FORMULA_TEXT,
  TTKG_MINERALOCORTICOID_TOOLTIP,
  TTKG_VALIDITY_TOOLTIP,
  TRP_FORMULA_TEXT,
  TRP_INTERPRETATION_TOOLTIP,
  type ResultFlagStatus,
} from "@core/calculators/electrolytes/trpCacrGuidance";

function parseOptional(value: string): number | undefined {
  if (value.trim() === "") return undefined;
  const parsed = parseFloat(value);
  return Number.isNaN(parsed) ? undefined : parsed;
}

function InterpretationDropdown({ children }: { children: ReactNode }) {
  return (
    <details className="mt-2 rounded-lg border border-black/10 bg-white/60">
      <summary className="cursor-pointer list-none px-2.5 py-1.5 text-xs font-medium marker:content-none [&::-webkit-details-marker]:hidden">
        <span className="inline-flex items-center gap-1.5">
          Interpretation
          <span aria-hidden className="text-[10px] opacity-70">
            ▾
          </span>
        </span>
      </summary>
      <div className="space-y-2 border-t border-black/10 px-2.5 py-2.5 text-xs leading-relaxed">
        {children}
      </div>
    </details>
  );
}

const FLAG_CARD_STYLES: Record<
  ResultFlagStatus,
  { card: string; title: string; value: string; note: string }
> = {
  normal: {
    card: "border-green-300 bg-green-50/90",
    title: "text-green-800",
    value: "text-green-950",
    note: "text-green-900/90",
  },
  abnormal: {
    card: "border-red-300 bg-red-50/90",
    title: "text-red-800",
    value: "text-red-950",
    note: "text-red-900/90",
  },
  caution: {
    card: "border-amber-300 bg-amber-50/90",
    title: "text-amber-900",
    value: "text-amber-950",
    note: "text-amber-900/90",
  },
  neutral: {
    card: "border-teal-200 bg-white",
    title: "text-teal-700",
    value: "text-teal-900",
    note: "text-teal-800/90",
  },
};

function MetricResult({
  title,
  value,
  warning,
  error,
  flagStatus = "neutral",
  interpretationDetails,
}: {
  title: string;
  value?: string;
  warning?: string;
  error?: string;
  flagStatus?: ResultFlagStatus;
  interpretationDetails: ReactNode;
}) {
  const styles = FLAG_CARD_STYLES[flagStatus];

  if (error) {
    return (
      <div className="min-w-0 self-start has-[details[open]]:col-span-full">
        <div className="rounded-xl border border-red-300 bg-red-50/90 p-3 text-red-950 shadow-sm">
          <p className="text-xs font-medium leading-snug text-red-800">{title}</p>
          <p className="mt-1 text-xs">{error}</p>
          <InterpretationDropdown>{interpretationDetails}</InterpretationDropdown>
        </div>
      </div>
    );
  }

  return (
    <div className="min-w-0 self-start has-[details[open]]:col-span-full">
      <div className={`rounded-xl border p-3 shadow-sm ${styles.card}`}>
        <p className={`text-xs font-medium leading-snug ${styles.title}`}>{title}</p>
        {value && <p className={`mt-1 text-xl font-bold tabular-nums ${styles.value}`}>{value}</p>}
        {warning && <p className={`mt-2 text-xs leading-snug ${styles.note}`}>{warning}</p>}
        <InterpretationDropdown>{interpretationDetails}</InterpretationDropdown>
      </div>
    </div>
  );
}

function DetailParagraph({ children }: { children: ReactNode }) {
  return <p>{children}</p>;
}

function SpotUcaUcrPercentileGuidance() {
  return (
    <div className="text-center">
      <p>{SPOT_UCA_UCR_PERCENTILE_HEADING}</p>
      <ul className="mt-2 inline-flex flex-col items-center space-y-1.5">
        {SPOT_UCA_UCR_PERCENTILE_CUTOFFS.map(({ ageLabel, value }) => (
          <li key={ageLabel} className="inline-flex items-baseline gap-1.5">
            <span>{ageLabel}</span>
            <span className="text-base font-bold tabular-nums text-teal-950">{value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function LabPairRow({
  label,
  labelTooltip,
  serumValue,
  onSerumChange,
  urineValue,
  onUrineChange,
}: {
  label: string;
  labelTooltip?: string;
  serumValue: string;
  onSerumChange: (value: string) => void;
  urineValue: string;
  onUrineChange: (value: string) => void;
}) {
  return (
    <div className="grid grid-cols-[minmax(6.5rem,8.5rem)_minmax(0,1fr)_minmax(0,1fr)] items-center gap-x-2 sm:gap-x-3">
      <div className="text-sm font-medium leading-snug text-teal-900">
        {label}
        {labelTooltip ? <InfoTooltip text={labelTooltip} /> : null}
      </div>
      <label className="min-w-0">
        <span className="sr-only">Serum {label}</span>
        <NumberInput value={serumValue} onChange={onSerumChange} min={0} step="any" />
      </label>
      <label className="min-w-0">
        <span className="sr-only">Urine {label}</span>
        <NumberInput value={urineValue} onChange={onUrineChange} min={0} step="any" />
      </label>
    </div>
  );
}

export default function RenalElectrolytePanelPage() {
  const [phosSerum, setPhosSerum] = useState("");
  const [caSerum, setCaSerum] = useState("");
  const [creatSerum, setCreatSerum] = useState("");
  const [kSerum, setKSerum] = useState("");
  const [osmSerum, setOsmSerum] = useState("");

  const [phosUrine, setPhosUrine] = useState("");
  const [caUrine, setCaUrine] = useState("");
  const [creatUrine, setCreatUrine] = useState("");
  const [kUrine, setKUrine] = useState("");
  const [osmUrine, setOsmUrine] = useState("");

  const panel = useMemo(
    () =>
      calculateRenalElectrolytePanel({
        phosSerum: parseOptional(phosSerum),
        caSerum: parseOptional(caSerum),
        creatSerum: parseOptional(creatSerum),
        kSerum: parseOptional(kSerum),
        osmSerum: parseOptional(osmSerum),
        phosUrine: parseOptional(phosUrine),
        caUrine: parseOptional(caUrine),
        creatUrine: parseOptional(creatUrine),
        kUrine: parseOptional(kUrine),
        osmUrine: parseOptional(osmUrine),
      }),
    [
      phosSerum,
      caSerum,
      creatSerum,
      kSerum,
      osmSerum,
      phosUrine,
      caUrine,
      creatUrine,
      kUrine,
      osmUrine,
    ],
  );

  const hasAnyProducibleResult = Boolean(
    panel.trp || panel.ccr || panel.spotUcaUcr || panel.ttkg,
  );

  return (
    <CalculatorShell
      title="Renal electrolyte indices"
      description="Tubular Resorption of Phosphate (TRP), calcium clearance ratio (CCR), spot UCa/UCr, and transtubular potassium gradient (TTKG)."
    >
      <p className="text-sm text-teal-800/90">
        Enter paired serum and urine values. Each index appears once its required inputs are
        complete.
      </p>

      <section className="space-y-2">
        <div className="grid grid-cols-[minmax(6.5rem,8.5rem)_minmax(0,1fr)_minmax(0,1fr)] gap-x-2 sm:gap-x-3">
          <div />
          <p className="text-[10px] font-semibold uppercase tracking-wide text-teal-600">Serum</p>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-teal-600">Urine</p>
        </div>

        <div className="space-y-2">
          <LabPairRow
            label="Phosphate (mg/dL)"
            serumValue={phosSerum}
            onSerumChange={setPhosSerum}
            urineValue={phosUrine}
            onUrineChange={setPhosUrine}
          />
          <LabPairRow
            label="Calcium (mg/dL)"
            labelTooltip="Use mg/dL for calcium and creatinine in clearance calculations."
            serumValue={caSerum}
            onSerumChange={setCaSerum}
            urineValue={caUrine}
            onUrineChange={setCaUrine}
          />
          <LabPairRow
            label="Creatinine (mg/dL)"
            serumValue={creatSerum}
            onSerumChange={setCreatSerum}
            urineValue={creatUrine}
            onUrineChange={setCreatUrine}
          />
          <LabPairRow
            label="Potassium (mEq/L)"
            labelTooltip={TTKG_VALIDITY_TOOLTIP}
            serumValue={kSerum}
            onSerumChange={setKSerum}
            urineValue={kUrine}
            onUrineChange={setKUrine}
          />
          <LabPairRow
            label="Osmolality (mOsm/kg)"
            labelTooltip={TTKG_VALIDITY_TOOLTIP}
            serumValue={osmSerum}
            onSerumChange={setOsmSerum}
            urineValue={osmUrine}
            onUrineChange={setOsmUrine}
          />
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-teal-800">Results</h3>

        {!hasAnyProducibleResult ? (
          <p className="text-sm text-teal-700">
            Enter the labs above to calculate available indices.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {panel.trp && (
              <MetricResult
                title="Tubular Resorption of Phosphate (TRP)"
                value={
                  !renalPanelResultIsError(panel.trp) ? panel.trp.value.toFixed(3) : undefined
                }
                flagStatus={
                  !renalPanelResultIsError(panel.trp)
                    ? getTrpFlagStatus(panel.trp.value)
                    : "neutral"
                }
                error={renalPanelResultIsError(panel.trp) ? panel.trp.error : undefined}
                interpretationDetails={
                  <>
                    <DetailParagraph>{TRP_FORMULA_TEXT}</DetailParagraph>
                    <DetailParagraph>{TRP_INTERPRETATION_TOOLTIP}</DetailParagraph>
                    {!renalPanelResultIsError(panel.trp) && (
                      <DetailParagraph>{panel.trp.interpretation}</DetailParagraph>
                    )}
                    <DetailParagraph>Source: data/calc/TRP-CaCr.txt</DetailParagraph>
                  </>
                }
              />
            )}

            {panel.ccr && (
              <MetricResult
                title="Calcium clearance ratio (CCR)"
                value={
                  !renalPanelResultIsError(panel.ccr)
                    ? panel.ccr.value.ccr.toFixed(4)
                    : undefined
                }
                flagStatus={
                  !renalPanelResultIsError(panel.ccr)
                    ? getCcrFlagStatus(panel.ccr.value.ccr)
                    : "neutral"
                }
                warning={
                  !renalPanelResultIsError(panel.ccr) ? panel.ccr.warning : undefined
                }
                error={renalPanelResultIsError(panel.ccr) ? panel.ccr.error : undefined}
                interpretationDetails={
                  <>
                    <DetailParagraph>{CCR_FORMULA_TEXT}</DetailParagraph>
                    <DetailParagraph>{CCR_FHH_LIKELY_TOOLTIP}</DetailParagraph>
                    <DetailParagraph>{CCR_FHH_UNLIKELY_TOOLTIP}</DetailParagraph>
                    <DetailParagraph>{CCR_CASR_TEST_TOOLTIP}</DetailParagraph>
                    {!renalPanelResultIsError(panel.ccr) && (
                      <DetailParagraph>{panel.ccr.interpretation}</DetailParagraph>
                    )}
                    <DetailParagraph>Source: data/calc/TRP-CaCr.txt</DetailParagraph>
                  </>
                }
              />
            )}

            {panel.spotUcaUcr && (
              <MetricResult
                title="Spot UCa/UCr ratio"
                value={
                  !renalPanelResultIsError(panel.spotUcaUcr)
                    ? panel.spotUcaUcr.value.toFixed(3)
                    : undefined
                }
                flagStatus={
                  !renalPanelResultIsError(panel.spotUcaUcr)
                    ? getSpotUcaUcrFlagStatus(panel.spotUcaUcr.value)
                    : "neutral"
                }
                warning={
                  !renalPanelResultIsError(panel.spotUcaUcr)
                    ? panel.spotUcaUcr.warning
                    : undefined
                }
                error={
                  renalPanelResultIsError(panel.spotUcaUcr) ? panel.spotUcaUcr.error : undefined
                }
                interpretationDetails={
                  <>
                    <DetailParagraph>{SPOT_UCA_UCR_FORMULA_TEXT}</DetailParagraph>
                    <DetailParagraph>{SPOT_UCA_UCR_NEPHROCALCINOSIS_TOOLTIP}</DetailParagraph>
                    <SpotUcaUcrPercentileGuidance />
                    <DetailParagraph>{SPOT_UCA_UCR_FHH_NOTE_TOOLTIP}</DetailParagraph>
                    {!renalPanelResultIsError(panel.spotUcaUcr) && (
                      <DetailParagraph>{panel.spotUcaUcr.interpretation}</DetailParagraph>
                    )}
                    <DetailParagraph>Source: data/calc/TRP-CaCr.txt</DetailParagraph>
                  </>
                }
              />
            )}

            {panel.ttkg && (
              <MetricResult
                title="Transtubular potassium gradient (TTKG)"
                value={
                  !renalPanelResultIsError(panel.ttkg)
                    ? panel.ttkg.value.ttkg.toFixed(2)
                    : undefined
                }
                flagStatus={
                  !renalPanelResultIsError(panel.ttkg)
                    ? getTtkgFlagStatus(panel.ttkg.value.ttkg, panel.ttkg.value.valid)
                    : "neutral"
                }
                warning={
                  !renalPanelResultIsError(panel.ttkg) ? panel.ttkg.warning : undefined
                }
                error={renalPanelResultIsError(panel.ttkg) ? panel.ttkg.error : undefined}
                interpretationDetails={
                  <>
                    <DetailParagraph>{TTKG_FORMULA_TEXT}</DetailParagraph>
                    <DetailParagraph>{TTKG_VALIDITY_TOOLTIP}</DetailParagraph>
                    <DetailParagraph>{TTKG_MINERALOCORTICOID_TOOLTIP}</DetailParagraph>
                    {!renalPanelResultIsError(panel.ttkg) && (
                      <DetailParagraph>{panel.ttkg.interpretation}</DetailParagraph>
                    )}
                    <DetailParagraph>Source: data/calc/TRP-CaCr.txt</DetailParagraph>
                  </>
                }
              />
            )}
          </div>
        )}
      </section>
    </CalculatorShell>
  );
}
