import type { ReactNode } from "react";
import { useMemo } from "react";
import CopyClinicalSummaryButton from "../CopyClinicalSummaryButton";
import { CalculatorReferenceFooter } from "../FormFields";
import {
  buildSteroidWeanClinicalSummary,
  buildSteroidWeanOnlyClinicalSummary,
} from "@core/formatSteroidWeanClinicalSummary";
import {
  actualMgPerM2PerDay,
  formatDailyDoseWithMgM2,
  formatDoseMgAndMgM2,
  formatIvSteroidDoseMg,
  formatMgM2PerDay,
  formatSteroidDoseMg,
  HCT_WEAN_THRESHOLD_MG_M2,
  STRESS_DOSE_INDICATIONS,
  type IvQidDoses,
  type PoTidDoses,
  type SteroidWeanSchedule,
} from "@core/calculators/steroid/calculateSteroidWeanSchedule";

function PoDoseCells({ po, bsaM2 }: { po: PoTidDoses; bsaM2: number }) {
  return (
    <>
      <td className="px-3 py-2 text-right tabular-nums">
        {formatSteroidDoseMg(po.morning)}
      </td>
      <td className="px-3 py-2 text-right tabular-nums">
        {formatSteroidDoseMg(po.midday)}
      </td>
      <td className="px-3 py-2 text-right tabular-nums">
        {po.schedule === "bid" ? (
          <span className="text-teal-600">—</span>
        ) : (
          formatSteroidDoseMg(po.evening)
        )}
      </td>
      <td className="px-3 py-2 text-right font-medium tabular-nums">
        {formatMgM2PerDay(actualMgPerM2PerDay(po.totalDaily, bsaM2))}
      </td>
    </>
  );
}

function IvDoseCells({ iv, bsaM2 }: { iv: IvQidDoses; bsaM2: number }) {
  return (
    <>
      <td className="px-3 py-2 text-right tabular-nums">
        {formatIvSteroidDoseMg(iv.dose1)}
      </td>
      <td className="px-3 py-2 text-right tabular-nums">
        {formatIvSteroidDoseMg(iv.dose2)}
      </td>
      <td className="px-3 py-2 text-right tabular-nums">
        {formatIvSteroidDoseMg(iv.dose3)}
      </td>
      <td className="px-3 py-2 text-right tabular-nums">
        {formatIvSteroidDoseMg(iv.dose4)}
      </td>
      <td className="px-3 py-2 text-right font-medium tabular-nums">
        {formatMgM2PerDay(actualMgPerM2PerDay(iv.totalDaily, bsaM2))}
      </td>
    </>
  );
}

function ScheduleTable({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`overflow-x-auto rounded-xl border border-teal-100 ${className}`}>
      <table className="min-w-full divide-y divide-teal-100 text-sm">{children}</table>
    </div>
  );
}

interface SteroidWeanScheduleViewProps {
  schedule: SteroidWeanSchedule;
  onBack: () => void;
}

export default function SteroidWeanScheduleView({
  schedule,
  onBack,
}: SteroidWeanScheduleViewProps) {
  const { transition, weanStages, maintenance, stress, anesthesia, bsaM2 } =
    schedule;

  const clinicalSummary = useMemo(
    () => buildSteroidWeanClinicalSummary(schedule),
    [schedule],
  );
  const weanOnlySummary = useMemo(
    () => buildSteroidWeanOnlyClinicalSummary(schedule),
    [schedule],
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <button
          type="button"
          onClick={onBack}
          className="text-sm font-medium text-teal-700 hover:text-teal-900"
        >
          ← Edit patient inputs
        </button>
        <div className="flex flex-col gap-2 sm:max-w-md sm:items-end">
          <CopyClinicalSummaryButton
            summary={clinicalSummary}
            buttonLabel="Copy full output for clinical documentation"
          />
          {schedule.includeWeanSchedule && (
            <CopyClinicalSummaryButton
              summary={weanOnlySummary}
              buttonLabel="Copy wean for clinical documentation"
            />
          )}
        </div>
      </div>

      <p className="text-sm text-teal-800">
        BSA: <strong>{bsaM2.toFixed(3)} m²</strong> — PO hydrocortisone prefers equal
        doses on 1.25 mg increments (AM-larger or BID when needed); IV hydrocortisone
        rounds to one decimal place. Anesthesia follow-up uses 5 mg PO tablets and
        whole-mg IV.
      </p>

      {transition && (
        <section className="space-y-3 rounded-xl border border-teal-200 bg-teal-50/50 p-4">
          <h3 className="text-base font-semibold text-teal-900">
            Transition to Wean
          </h3>
          <div className="space-y-2 text-sm text-teal-900">
            <p>
              <span className="font-medium">Current regimen:</span>{" "}
              {transition.currentSteroidLabel}{" "}
              {formatDoseMgAndMgM2(
                transition.currentSteroidDoseMg,
                transition.currentSteroidMgPerM2PerDay,
              )}
            </p>
            <p>
              <span className="font-medium">Hydrocortisone equivalent:</span>{" "}
              {formatDoseMgAndMgM2(
                transition.hctEquivalentMgPerDay,
                transition.hctEquivalentMgPerM2PerDay,
              )}
            </p>
            <p className="text-teal-800">
              Steroid weans are recommended once hydrocortisone equivalent reaches{" "}
              <strong>{HCT_WEAN_THRESHOLD_MG_M2} mg/m²/day</strong> (minimum
              threshold).
            </p>
            {transition.atOrBelowWeanThreshold ? (
              <p className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-green-900">
                Current dose is at or below the wean threshold — proceed with the
                wean schedule below.
              </p>
            ) : (
              transition.thresholdCurrentSteroidDoseMg !== undefined &&
              transition.thresholdCurrentSteroidMgPerM2PerDay !== undefined &&
              transition.thresholdHctMgPerM2PerDay !== undefined && (
                <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-amber-900">
                  Current dose is above {HCT_WEAN_THRESHOLD_MG_M2} mg/m²/day.
                  Reduce to{" "}
                  <strong>
                    {transition.currentSteroidLabel}{" "}
                    {formatDoseMgAndMgM2(
                      transition.thresholdCurrentSteroidDoseMg,
                      transition.thresholdCurrentSteroidMgPerM2PerDay,
                    )}
                  </strong>{" "}
                  (hydrocortisone equivalent{" "}
                  {transition.thresholdHctDoseMg !== undefined
                    ? formatDoseMgAndMgM2(
                        transition.thresholdHctDoseMg,
                        transition.thresholdHctMgPerM2PerDay,
                      )
                    : formatMgM2PerDay(transition.thresholdHctMgPerM2PerDay)}
                  ) before starting the structured wean.
                </p>
              )
            )}
          </div>
        </section>
      )}

      {schedule.includeWeanSchedule && (
      <section className="space-y-4">
        <h3 className="text-base font-semibold text-teal-900">Steroid Wean</h3>

        <div>
          <h4 className="mb-2 text-sm font-medium text-teal-800">
            PO hydrocortisone (equal-preferred TID; BID when evening dose cannot
            be formed)
          </h4>
          <ScheduleTable>
            <thead className="bg-teal-50 text-left text-xs font-semibold uppercase tracking-wide text-teal-700">
              <tr>
                <th className="px-3 py-2">Target (mg/m²/day)</th>
                <th className="px-3 py-2">Actual (mg/m²/day)</th>
                <th className="px-3 py-2 text-right">Morning</th>
                <th className="px-3 py-2 text-right">Midday</th>
                <th className="px-3 py-2 text-right">Evening</th>
                <th className="px-3 py-2 text-right">Total (mg/m²/day)</th>
                <th className="px-3 py-2">Schedule</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-teal-50 bg-white">
              {weanStages.map((row) => (
                <tr key={`po-${row.targetMgPerM2PerDay}`}>
                  <td className="px-3 py-2 font-medium">
                    {row.targetMgPerM2PerDay}
                  </td>
                  <td className="px-3 py-2 tabular-nums text-teal-800">
                    {formatMgM2PerDay(row.actualPoMgPerM2PerDay)}
                  </td>
                  <PoDoseCells po={row.po} bsaM2={bsaM2} />
                  <td className="px-3 py-2 text-xs uppercase text-teal-600">
                    {row.po.schedule}
                  </td>
                </tr>
              ))}
            </tbody>
          </ScheduleTable>
        </div>

        <div>
          <h4 className="mb-2 text-sm font-medium text-teal-800">
            IV hydrocortisone (QID)
          </h4>
          <ScheduleTable>
            <thead className="bg-teal-50 text-left text-xs font-semibold uppercase tracking-wide text-teal-700">
              <tr>
                <th className="px-3 py-2">Target (mg/m²/day)</th>
                <th className="px-3 py-2">Actual (mg/m²/day)</th>
                <th className="px-3 py-2 text-right">Q1</th>
                <th className="px-3 py-2 text-right">Q2</th>
                <th className="px-3 py-2 text-right">Q3</th>
                <th className="px-3 py-2 text-right">Q4</th>
                <th className="px-3 py-2 text-right">Total (mg/m²/day)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-teal-50 bg-white">
              {weanStages.map((row) => (
                <tr key={`iv-${row.targetMgPerM2PerDay}`}>
                  <td className="px-3 py-2 font-medium">
                    {row.targetMgPerM2PerDay}
                  </td>
                  <td className="px-3 py-2 tabular-nums text-teal-800">
                    {formatMgM2PerDay(row.actualIvMgPerM2PerDay)}
                  </td>
                  <IvDoseCells iv={row.iv} bsaM2={bsaM2} />
                </tr>
              ))}
            </tbody>
          </ScheduleTable>
        </div>
      </section>
      )}

      <section className="space-y-4 rounded-xl border border-teal-100 bg-white p-4">
        <h3 className="text-base font-semibold text-teal-900">
          Maintenance and Stress Recommendations
        </h3>

        <div>
          <h4 className="mb-2 text-sm font-medium text-teal-800">
            Maintenance — PO hydrocortisone 8–10 mg/m²/day (equal-preferred TID)
          </h4>
          <ScheduleTable>
            <thead className="bg-teal-50 text-left text-xs font-semibold uppercase tracking-wide text-teal-700">
              <tr>
                <th className="px-3 py-2">Target (mg/m²/day)</th>
                <th className="px-3 py-2">Actual (mg/m²/day)</th>
                <th className="px-3 py-2 text-right">Morning</th>
                <th className="px-3 py-2 text-right">Midday</th>
                <th className="px-3 py-2 text-right">Evening</th>
                <th className="px-3 py-2 text-right">Total (mg/m²/day)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-teal-50 bg-white">
              {maintenance.map((row) => (
                <tr key={`maint-${row.targetMgPerM2PerDay}`}>
                  <td className="px-3 py-2 font-medium">
                    {row.targetMgPerM2PerDay}
                  </td>
                  <td className="px-3 py-2 tabular-nums text-teal-800">
                    {formatMgM2PerDay(row.actualMgPerM2PerDay)}
                  </td>
                  <PoDoseCells po={row.po} bsaM2={bsaM2} />
                </tr>
              ))}
            </tbody>
          </ScheduleTable>
          <p className="mt-2 text-xs text-teal-700">
            Equal TID is preferred when the daily total divides evenly on 1.25 mg
            steps; otherwise morning is largest, then BID if needed.
          </p>
        </div>

        <div>
          <h4 className="mb-2 text-sm font-medium text-teal-800">
            Stress dosing — 30 mg/m²/day hydrocortisone
          </h4>
          <p className="mb-2 text-sm text-teal-800">
            {STRESS_DOSE_INDICATIONS} Target:{" "}
            {formatDailyDoseWithMgM2(stress.targetTotalDailyMg, bsaM2)}.
          </p>
          <div className="grid gap-4 lg:grid-cols-2">
            <div>
              <p className="mb-1 text-xs font-semibold uppercase text-teal-600">
                PO (equal-preferred) — actual{" "}
                {formatMgM2PerDay(stress.actualPoMgPerM2PerDay)}
              </p>
              <ScheduleTable>
                <thead className="bg-teal-50 text-xs font-semibold text-teal-700">
                  <tr>
                    <th className="px-3 py-2 text-right">AM</th>
                    <th className="px-3 py-2 text-right">Midday</th>
                    <th className="px-3 py-2 text-right">PM</th>
                    <th className="px-3 py-2 text-right">Total (mg/m²/day)</th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  <tr>
                    <PoDoseCells po={stress.po} bsaM2={bsaM2} />
                  </tr>
                </tbody>
              </ScheduleTable>
            </div>
            <div>
              <p className="mb-1 text-xs font-semibold uppercase text-teal-600">
                IV (QID) — actual {formatMgM2PerDay(stress.actualIvMgPerM2PerDay)}
              </p>
              <ScheduleTable>
                <thead className="bg-teal-50 text-xs font-semibold text-teal-700">
                  <tr>
                    <th className="px-3 py-2 text-right">Q1</th>
                    <th className="px-3 py-2 text-right">Q2</th>
                    <th className="px-3 py-2 text-right">Q3</th>
                    <th className="px-3 py-2 text-right">Q4</th>
                    <th className="px-3 py-2 text-right">Total (mg/m²/day)</th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  <tr>
                    <IvDoseCells iv={stress.iv} bsaM2={bsaM2} />
                  </tr>
                </tbody>
              </ScheduleTable>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-amber-100 bg-amber-50/60 p-4 text-sm text-teal-900">
          <h4 className="font-medium text-teal-900">
            Anesthesia / severe illness or injury
          </h4>
          <ul className="mt-2 list-disc space-y-2 pl-5">
            <li>
              Give{" "}
              <strong>{formatIvSteroidDoseMg(anesthesia.singleDoseMg)}</strong>{" "}
              (target {anesthesia.singleDoseTargetMgPerM2} mg/m²; actual{" "}
              {formatMgM2PerDay(anesthesia.singleDoseMgPerM2)}; max 100 mg)
              hydrocortisone IV/IM once at induction of anesthesia or onset of
              severe illness/injury.
            </li>
            <li>
              Then continue hydrocortisone at follow-up target{" "}
              <strong>
                {formatMgM2PerDay(anesthesia.followUpTargetMgPerM2PerDay)}
              </strong>{" "}
              (max 100 mg total): PO divided TID on 5 mg tablets (AM{" "}
              {formatSteroidDoseMg(anesthesia.followUpPo.morning)}, midday{" "}
              {formatSteroidDoseMg(anesthesia.followUpPo.midday)}, PM{" "}
              {formatSteroidDoseMg(anesthesia.followUpPo.evening)}; actual{" "}
              {formatMgM2PerDay(anesthesia.followUpActualPoMgPerM2PerDay)}) or IV
              divided QID whole mg (
              {[
                anesthesia.followUpIv.dose1,
                anesthesia.followUpIv.dose2,
                anesthesia.followUpIv.dose3,
                anesthesia.followUpIv.dose4,
              ]
                .map(formatIvSteroidDoseMg)
                .join(", ")}
              ; actual {formatMgM2PerDay(anesthesia.followUpActualIvMgPerM2PerDay)}).
            </li>
          </ul>
        </div>
      </section>

      <CalculatorReferenceFooter>
        BSA: Haycock method when height is available; Costeff formula for weight-only
        estimation. PO hydrocortisone: equal-preferred dosing on 1.25 mg increments
        (AM-larger or BID when needed). IV wean/stress QID to one decimal place.
        Anesthesia/severe illness: single dose ceiled (&lt;25 mg to whole mg; ≥25 mg
        to 5 mg); follow-up PO on 5 mg tablets; follow-up IV whole mg.
      </CalculatorReferenceFooter>
    </div>
  );
}
