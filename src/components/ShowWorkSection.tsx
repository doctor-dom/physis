import { useMemo } from "react";
import ZoomableImage from "./ZoomableImage";
import { buildShowWorkReport } from "@core/showWork/buildShowWorkReport";
import type { ShowWorkInput } from "@core/showWork/types";
import type { QcIssue } from "@core/showWork/types";

export interface ShowWorkSectionProps extends ShowWorkInput {
  onBackToChart: () => void;
  onApplyFix?: (issueId: string, value?: string) => void;
}

function QcBanner({
  passed,
  issues,
  tw3BoneAgeYears,
  onApplyFix,
}: {
  passed: boolean;
  issues: QcIssue[];
  tw3BoneAgeYears?: number;
  onApplyFix?: (issueId: string, value?: string) => void;
}) {
  if (passed && issues.length === 0) {
    return (
      <div className="rounded-xl border-2 border-green-300 bg-green-50 px-4 py-3">
        <p className="text-lg font-bold text-green-800">QC passed!</p>
        <p className="mt-1 text-sm text-green-700">
          All calculations and scoring checks completed with no errors.
        </p>
      </div>
    );
  }

  if (passed && issues.length > 0) {
    return (
      <div className="rounded-xl border-2 border-amber-300 bg-amber-50 px-4 py-3">
        <p className="text-lg font-bold text-amber-900">QC passed with warnings</p>
        <ul className="mt-2 space-y-2 text-sm text-amber-900">
          {issues.map((issue) => (
            <li key={issue.id}>{issue.message}</li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div className="rounded-xl border-2 border-red-300 bg-red-50 px-4 py-3 space-y-3">
      <p className="text-lg font-bold text-red-800">QC failed — review issues below</p>
      {issues.map((issue) => (
        <div key={issue.id} className="rounded-lg border border-red-200 bg-white p-3 text-sm">
          <p className="font-semibold text-red-900">
            {issue.severity === "error" ? "Error" : "Warning"}: {issue.message}
          </p>
          <p className="mt-1 text-red-800/90">
            <span className="font-medium">Troubleshooting:</span> {issue.troubleshooting}
          </p>
          {issue.suggestedFix ? (
            <p className="mt-1 text-red-800/90">
              <span className="font-medium">Suggested fix:</span> {issue.suggestedFix}
            </p>
          ) : null}
          {onApplyFix && issue.id === "bone-age-mismatch" && tw3BoneAgeYears !== undefined ? (
            <button
              type="button"
              onClick={() =>
                onApplyFix(issue.id, tw3BoneAgeYears.toFixed(2))
              }
              className="mt-2 rounded-lg bg-red-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-800"
            >
              Apply fix — sync bone age to TW3 value
            </button>
          ) : null}
        </div>
      ))}
    </div>
  );
}

function WorkTable({
  headers,
  rows,
}: {
  headers: string[];
  rows: (string | number)[][];
}) {
  return (
    <div className="overflow-x-auto rounded-lg border border-teal-100">
      <table className="min-w-full text-xs sm:text-sm">
        <thead className="bg-teal-50 text-teal-900">
          <tr>
            {headers.map((h) => (
              <th key={h} className="px-3 py-2 text-left font-semibold">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-teal-50">
          {rows.map((row, i) => (
            <tr key={i} className="text-teal-900">
              {row.map((cell, j) => (
                <td key={j} className="px-3 py-2 font-mono">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function ShowWorkSection({
  onBackToChart,
  onApplyFix,
  sex,
  chronAgeYears,
  boneAgeYears,
  boneAgeFromTw3,
  fatherCm,
  motherCm,
  parentalInputMode,
  mphDirectCm,
  heightCm,
  weightKg,
  heightIsStandingVertical,
  method,
  ratings,
  displayedPredictionCm,
}: ShowWorkSectionProps) {
  const report = useMemo(
    () =>
      buildShowWorkReport({
        sex,
        chronAgeYears,
        boneAgeYears,
        boneAgeFromTw3,
        fatherCm,
        motherCm,
        parentalInputMode,
        mphDirectCm,
        heightCm,
        weightKg,
        heightIsStandingVertical,
        method,
        ratings,
        displayedPredictionCm,
      }),
    [
      sex,
      chronAgeYears,
      boneAgeYears,
      boneAgeFromTw3,
      fatherCm,
      motherCm,
      parentalInputMode,
      mphDirectCm,
      heightCm,
      weightKg,
      heightIsStandingVertical,
      method,
      ratings,
      displayedPredictionCm,
    ],
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBackToChart}
          className="text-sm font-medium text-teal-700 hover:text-teal-900"
        >
          ← Back to growth chart
        </button>
        <p className="text-xs font-semibold uppercase tracking-wide text-teal-600">
          Show work & QC
        </p>
      </div>

      <QcBanner
        passed={report.qcPassed}
        issues={report.qcIssues}
        tw3BoneAgeYears={report.tw3Section?.boneAgeFromSms}
        onApplyFix={onApplyFix}
      />

      {report.tw3Section ? (
        <section className="space-y-3 rounded-xl border border-teal-100 bg-white p-4 shadow-sm">
          <h3 className="text-lg font-bold text-teal-900">TW3-RUS → SMS → bone age</h3>
          <p className="text-sm text-teal-800">
            Each landmark maturity stage maps to SMS points; the total SMS is converted to
            bone age via linear interpolation on the sex-specific chart.
          </p>

          <WorkTable
            headers={["Landmark", "Stage", "SMS points"]}
            rows={report.tw3Section.landmarkRows.map((row) => [
              row.label,
              row.rating,
              row.smsPoints,
            ])}
          />

          <div className="rounded-lg bg-teal-50/80 border border-teal-100 px-3 py-2 text-sm font-mono text-teal-900 space-y-1">
            <p>
              SMS total ={" "}
              {report.tw3Section.landmarkRows
                .map((r) => r.smsPoints)
                .join(" + ")}{" "}
              = <strong>{report.tw3Section.smsTotal}</strong>
            </p>
            <p>
              Landmarks scored: {report.tw3Section.completedLandmarks}/
              {report.tw3Section.totalLandmarks}
            </p>
            <p>Bone age from SMS: {report.tw3Section.boneAgeFromSms.toFixed(2)} y</p>
            <p className="text-xs text-teal-700 pt-1">
              {report.tw3Section.smsInterpolation.formula}
            </p>
            {!Number.isNaN(report.tw3Section.enteredBoneAgeYears) ? (
              <p>
                Entered bone age: {report.tw3Section.enteredBoneAgeYears.toFixed(2)} y
              </p>
            ) : null}
          </div>
        </section>
      ) : report.tw3Used ? (
        <section className="rounded-xl border border-amber-100 bg-amber-50/50 p-4 text-sm text-amber-900">
          TW3 scoring data could not be reproduced. Bone age may have been entered manually.
        </section>
      ) : (
        <section className="rounded-xl border border-teal-100 bg-teal-50/40 p-4 text-sm text-teal-800">
          TW3 scoring was skipped — bone age was entered manually on the prediction page.
        </section>
      )}

      {report.parentalSection ? (
        <section className="space-y-3 rounded-xl border border-teal-100 bg-white p-4 shadow-sm">
          <h3 className="text-lg font-bold text-teal-900">Parental stature</h3>
          <div className="text-sm font-mono text-teal-900 space-y-1">
            {report.parentalSection.derivedFromMph ? (
              <p>
                MPH entered directly:{" "}
                {report.parentalSection.mphDirectCm?.toFixed(1)} cm · Combined
                parental height (father + mother):{" "}
                {report.parentalSection.parentalSumCm.toFixed(1)} cm
              </p>
            ) : (
              <p>
                Father: {report.parentalSection.fatherCm!.toFixed(1)} cm · Mother:{" "}
                {report.parentalSection.motherCm!.toFixed(1)} cm · Combined:{" "}
                {report.parentalSection.parentalSumCm.toFixed(1)} cm
              </p>
            )}
            <p>
              {report.parentalSection.mphFormula} → MPH ={" "}
              {report.parentalSection.mphCm.toFixed(1)} cm (range{" "}
              {report.parentalSection.mphRangeLowCm.toFixed(1)}–
              {report.parentalSection.mphRangeHighCm.toFixed(1)} cm)
            </p>
            <p>
              {report.parentalSection.mpsFormula} → MPS ={" "}
              {report.parentalSection.mpsCm.toFixed(1)} cm
              {report.parentalSection.derivedFromMph
                ? " (from combined parental height only; individual parent heights unknown)"
                : ""}
            </p>
          </div>
        </section>
      ) : null}

      {report.predictionSection ? (
        <section className="space-y-3 rounded-xl border border-teal-100 bg-white p-4 shadow-sm">
          <h3 className="text-lg font-bold text-teal-900">
            {report.predictionSection.methodLabel} — predicted adult height
          </h3>
          <p className="text-sm font-mono text-teal-800">
            {report.predictionSection.equation}
          </p>

          {report.predictionSection.heightAdjustmentCm !== undefined &&
          report.predictionSection.heightAdjustmentCm > 0 ? (
            <p className="text-sm text-teal-800">
              Standing height adjustment: +{report.predictionSection.heightAdjustmentCm}{" "}
              cm → height used in equation:{" "}
              {report.predictionSection.heightUsedCm?.toFixed(1)} cm
            </p>
          ) : report.predictionSection.heightUsedCm !== undefined ? (
            <p className="text-sm text-teal-800">
              Height used in equation: {report.predictionSection.heightUsedCm.toFixed(1)} cm
            </p>
          ) : null}

          {report.predictionSection.unitConversions?.map((row) => (
            <p key={row.label} className="text-sm font-mono text-teal-800">
              {row.label}: {row.value}
            </p>
          ))}

          <WorkTable
            headers={["Term", "Value", "β", "Product"]}
            rows={[
              ["β₀ (intercept)", "—", report.predictionSection.intercept.toFixed(4), report.predictionSection.intercept.toFixed(4)],
              ...report.predictionSection.terms.map((t) => [
                t.name,
                t.value.toFixed(3),
                t.coefficient.toFixed(4),
                t.product.toFixed(4),
              ]),
              [
                "PAH (sum)",
                "—",
                "—",
                report.predictionSection.predictedCm.toFixed(2),
              ],
            ]}
          />

          <div className="rounded-lg bg-teal-50/80 border border-teal-100 px-3 py-2 text-sm text-teal-900">
            <p>
              Recomputed PAH:{" "}
              <strong>{report.predictionSection.predictedCm.toFixed(1)} cm</strong>
            </p>
            {report.predictionSection.displayedCm !== null ? (
              <p>
                Displayed PAH:{" "}
                <strong>{report.predictionSection.displayedCm.toFixed(1)} cm</strong>
              </p>
            ) : null}
            <p className="text-xs text-teal-700 mt-1">
              Coefficients interpolated at chronological age{" "}
              {report.predictionSection.chronAgeYears.toFixed(2)} y
            </p>
          </div>

          {report.predictionSection.coefficientInterpolation ? (
            <details className="rounded-lg border border-teal-100 p-3">
              <summary className="cursor-pointer text-sm font-medium text-teal-800">
                Coefficient interpolation detail
              </summary>
              <ul className="mt-2 space-y-2 text-xs font-mono text-teal-800">
                {report.predictionSection.coefficientInterpolation.map((row) => (
                  <li key={row.formula}>{row.formula}</li>
                ))}
              </ul>
            </details>
          ) : null}

          {report.predictionSection.coefficientTableRows &&
          report.predictionSection.coefficientTableRows.length > 0 ? (
            <details open className="rounded-lg border border-teal-100 p-3">
              <summary className="cursor-pointer text-sm font-medium text-teal-800">
                Tabulated coefficient chart (excerpt)
              </summary>
              <div className="mt-2 overflow-x-auto">
                <table className="min-w-full text-xs font-mono">
                  <thead className="bg-teal-50">
                    <tr>
                      <th className="px-2 py-1 text-left">Age (y)</th>
                      {Object.keys(
                        report.predictionSection.coefficientTableRows[0].coefficients,
                      ).map((key) => (
                        <th key={key} className="px-2 py-1 text-left">
                          {key}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {report.predictionSection.coefficientTableRows.map((row) => (
                      <tr
                        key={row.ageYears}
                        className={
                          Math.abs(row.ageYears - report.predictionSection!.chronAgeYears) <
                          0.01
                            ? "bg-teal-100 font-semibold"
                            : ""
                        }
                      >
                        <td className="px-2 py-1">{row.ageYears}</td>
                        {Object.values(row.coefficients).map((val, i) => (
                          <td key={i} className="px-2 py-1">
                            {val.toFixed(4)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </details>
          ) : null}
        </section>
      ) : null}

      {report.references.length > 0 ? (
        <section className="space-y-3 rounded-xl border border-teal-100 bg-white p-4 shadow-sm">
          <h3 className="text-lg font-bold text-teal-900">Reference charts</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            {report.references.map((ref) => (
              <div key={ref.src} className="space-y-2">
                <p className="text-sm font-medium text-teal-900">{ref.title}</p>
                <ZoomableImage src={ref.src} alt={ref.alt} />
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
