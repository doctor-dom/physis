import { useState } from "react";
import {
  Field,
  InfoTooltip,
  ResultCard,
  SelectInput,
} from "./FormFields";
import AgeInput from "./AgeInput";
import { UnitLengthInput, UnitWeightInput } from "./UnitInputs";
import { MPH_RANGE_CM } from "@core/calculators/parentalStature";
import {
  RWT_SUPINE_HEIGHT_ADJUSTMENT_CM,
} from "@core/calculators/rwt/supineHeight";
import {
  useAdultHeightPredictions,
  HEIGHT_PREDICTION_METHOD_LABELS,
  KHAMIS_ROCHE_AGE_MIN,
  KHAMIS_ROCHE_AGE_MAX,
  tw3MenarchalStatusRequired,
  type HeightPredictionMethod,
  type AdultHeightPredictions,
  type ParentalInputMode,
  type Tw3MenarchalStatus,
} from "../hooks/useAdultHeightPredictions";
import {
  summarizeParentalStature,
} from "@core/calculators/parentalStature";
import { buildAphClinicalSummary } from "@core/formatAphClinicalSummary";
import CopyClinicalSummaryButton from "./CopyClinicalSummaryButton";
import type { Sex } from "@core/types";

interface AdultHeightPredictionSectionProps {
  sex: Sex;
  onSexChange: (sex: Sex) => void;
  chronAgeYears: string;
  onChronAgeChange: (v: string) => void;
  boneAgeYears: string;
  onBoneAgeChange: (v: string) => void;
  fatherCm: string;
  onFatherCmChange: (v: string) => void;
  motherCm: string;
  onMotherCmChange: (v: string) => void;
  parentalInputMode: ParentalInputMode;
  onParentalInputModeChange: (mode: ParentalInputMode) => void;
  mphDirectCm: string;
  onMphDirectCmChange: (v: string) => void;
  heightCm: string;
  onHeightCmChange: (v: string) => void;
  weightKg: string;
  onWeightKgChange: (v: string) => void;
  heightIsStandingVertical: boolean;
  onHeightIsStandingVerticalChange: (v: boolean) => void;
  onBackToTw3?: () => void;
  onContinueToChart?: (
    method: HeightPredictionMethod,
    predictions: AdultHeightPredictions,
  ) => void;
  boneAgeFromTw3?: boolean;
  menarchalStatus: Tw3MenarchalStatus | null;
  onMenarchalStatusChange: (status: Tw3MenarchalStatus | null) => void;
  tw3ApplyMphAdjustment: boolean;
  onTw3ApplyMphAdjustmentChange: (v: boolean) => void;
}

function isValidPrediction(
  result: AdultHeightPredictions["tw3Result"],
): result is { value: number } {
  return result !== null && !("error" in result);
}

function SelectableResultCard({
  method,
  title,
  selected,
  onSelect,
  result,
  placeholder,
}: {
  method: HeightPredictionMethod;
  title: string;
  selected: boolean;
  onSelect: () => void;
  result: AdultHeightPredictions["tw3Result"];
  placeholder: string;
}) {
  if (result && "error" in result) {
    return <ResultCard title={title} error={result.error} />;
  }

  if (!result) {
    return (
      <div className="rounded-xl border border-dashed border-teal-200 bg-teal-50/30 p-4 text-sm text-teal-700">
        {placeholder}
      </div>
    );
  }

  const warning =
    method === "adjusted-rwt" &&
    "adjustmentAppliedCm" in result &&
    result.adjustmentAppliedCm &&
    result.adjustmentAppliedCm > 0
      ? `Standing height correction: +${result.adjustmentAppliedCm.toFixed(2)} cm applied (${result.adjustedHeightCm?.toFixed(1)} cm used in equation). ${result.warning ?? ""}`
      : method === "khamis-roche"
        ? "No bone age required. Uses standing height, weight, and MPS."
        : result.warning;

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full rounded-xl border p-4 text-left shadow-sm transition-all ${
        selected
          ? "border-teal-600 bg-teal-50 ring-2 ring-teal-400"
          : "border-teal-200 bg-white hover:border-teal-400 hover:bg-teal-50/30"
      }`}
      aria-pressed={selected}
    >
      <p className="text-sm font-medium text-teal-700">{title}</p>
      <p className="mt-1 text-2xl font-bold text-teal-900">
        {result.value.toFixed(1)} cm
      </p>
      {result.interpretation && (
        <p className="mt-2 text-sm text-teal-800">{result.interpretation}</p>
      )}
      {warning && (
        <p className="mt-2 rounded-lg border border-amber-100 bg-amber-50 p-2 text-sm text-amber-800">
          {warning}
        </p>
      )}
      <p className="mt-3 text-xs font-medium text-teal-600">
        {selected ? "Selected for growth chart" : "Click to select"}
      </p>
    </button>
  );
}

export default function AdultHeightPredictionSection({
  sex,
  onSexChange,
  chronAgeYears,
  onChronAgeChange,
  boneAgeYears,
  onBoneAgeChange,
  fatherCm,
  onFatherCmChange,
  motherCm,
  onMotherCmChange,
  parentalInputMode,
  onParentalInputModeChange,
  mphDirectCm,
  onMphDirectCmChange,
  heightCm,
  onHeightCmChange,
  weightKg,
  onWeightKgChange,
  heightIsStandingVertical,
  onHeightIsStandingVerticalChange,
  onBackToTw3,
  onContinueToChart,
  boneAgeFromTw3,
  menarchalStatus,
  onMenarchalStatusChange,
  tw3ApplyMphAdjustment,
  onTw3ApplyMphAdjustmentChange,
}: AdultHeightPredictionSectionProps) {
  const [selectedMethod, setSelectedMethod] =
    useState<HeightPredictionMethod | null>(null);

  const chronAgeParsed = parseFloat(chronAgeYears);
  const showMenarchePrompt =
    sex === "female" &&
    !Number.isNaN(chronAgeParsed) &&
    tw3MenarchalStatusRequired(sex, chronAgeParsed);

  const predictions = useAdultHeightPredictions({
    sex,
    parentalInputMode,
    fatherCm,
    motherCm,
    mphDirectCm,
    heightCm,
    weightKg,
    chronAgeYears,
    boneAgeYears,
    heightIsStandingVertical,
    menarchalStatus,
    tw3ApplyMphAdjustment,
  });

  const { parental, tw3Result, rwtResult, krResult } = predictions;

  function handleParentalInputModeChange(next: ParentalInputMode) {
    if (next === parentalInputMode) return;

    if (next === "mph") {
      const father = parseFloat(fatherCm);
      const mother = parseFloat(motherCm);
      if (!Number.isNaN(father) && !Number.isNaN(mother)) {
        const summary = summarizeParentalStature(father, mother, sex);
        onMphDirectCmChange(String(summary.mphCm));
      }
    }

    onParentalInputModeChange(next);
  }

  const selectedResult =
    selectedMethod === "tw3"
      ? tw3Result
      : selectedMethod === "adjusted-rwt"
        ? rwtResult
        : selectedMethod === "khamis-roche"
          ? krResult
          : null;

  const canContinue =
    selectedMethod !== null && isValidPrediction(selectedResult);

  const clinicalSummary =
    canContinue && selectedMethod && selectedResult && parental
      ? (() => {
          const chronAge = parseFloat(chronAgeYears);
          if (Number.isNaN(chronAge)) return null;
          const boneAgeParsed = parseFloat(boneAgeYears);
          return buildAphClinicalSummary({
            chronAgeYears: chronAge,
            boneAgeYears: Number.isNaN(boneAgeParsed) ? null : boneAgeParsed,
            mphCm: parental.mphCm,
            aphCm: selectedResult.value,
            method: selectedMethod,
          });
        })()
      : null;

  return (
    <div className="space-y-6">
      {onBackToTw3 && (
        <button
          type="button"
          onClick={onBackToTw3}
          className="text-sm font-medium text-teal-700 hover:text-teal-900"
        >
          ← Back to TW3 bone age
        </button>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Patient sex" hint="Affects MPH (Tanner) and method coefficients">
          <SelectInput
            value={sex}
            onChange={(v) => onSexChange(v as Sex)}
            options={[
              { value: "male", label: "Male" },
              { value: "female", label: "Female" },
            ]}
          />
        </Field>
      </div>

      <fieldset className="space-y-3">
        <legend className="text-sm font-medium text-teal-900">
          Parental stature input
        </legend>
        <div className="flex flex-wrap gap-2">
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-teal-200 bg-white px-3 py-2 text-sm text-teal-900 shadow-sm has-[:checked]:border-teal-600 has-[:checked]:bg-teal-50">
            <input
              type="radio"
              name="parental-input-mode"
              checked={parentalInputMode === "individual"}
              onChange={() => handleParentalInputModeChange("individual")}
              className="text-teal-700 focus:ring-teal-500"
            />
            Father &amp; mother heights
          </label>
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-teal-200 bg-white px-3 py-2 text-sm text-teal-900 shadow-sm has-[:checked]:border-teal-600 has-[:checked]:bg-teal-50">
            <input
              type="radio"
              name="parental-input-mode"
              checked={parentalInputMode === "mph"}
              onChange={() => handleParentalInputModeChange("mph")}
              className="text-teal-700 focus:ring-teal-500"
            />
            MPH directly
          </label>
        </div>

        {parentalInputMode === "individual" ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <UnitLengthInput
              label="Father height"
              hint="Parental heights — used for MPH and MPS"
              valueCm={fatherCm}
              onChangeCm={onFatherCmChange}
              placeholder="e.g. 178"
            />
            <UnitLengthInput
              label="Mother height"
              valueCm={motherCm}
              onChangeCm={onMotherCmChange}
              placeholder="e.g. 165"
            />
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            <UnitLengthInput
              label="Mid-parental height (MPH)"
              hint={
                sex === "male"
                  ? "Tanner MPH for boys: (father + mother + 13) ÷ 2. MPS uses the combined parental height only — individual parent heights are not known from MPH alone."
                  : "Tanner MPH for girls: (father + mother − 13) ÷ 2. MPS uses the combined parental height only — individual parent heights are not known from MPH alone."
              }
              valueCm={mphDirectCm}
              onChangeCm={onMphDirectCmChange}
              placeholder="e.g. 170"
            />
          </div>
        )}
      </fieldset>

      {parental && (
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-teal-200 bg-teal-50/40 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">
              MPH — TW3 method
            </p>
            <p className="mt-1 text-2xl font-bold text-teal-900">
              {parental.mphCm.toFixed(1)} cm
            </p>
            <p className="mt-1 text-xs text-teal-700">
              Target range ±{MPH_RANGE_CM} cm:{" "}
              {parental.mphRangeLowCm.toFixed(1)}–{parental.mphRangeHighCm.toFixed(1)} cm
            </p>
            <p className="mt-2 text-xs text-teal-600 font-mono">{parental.mphFormula}</p>
            {parental.derivedFromMph ? (
              <p className="mt-1 text-xs text-teal-700/80">
                Entered directly. Optional MPH adjustment for TW3 PAH uses this value.
              </p>
            ) : (
              <p className="mt-1 text-xs text-teal-700/80">
                Used for optional TW3 MPH adjustment (standing vertical height in equation).
              </p>
            )}
          </div>
          <div className="rounded-xl border border-teal-200 bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">
              MPS — Adjusted RWT
            </p>
            <p className="mt-1 text-2xl font-bold text-teal-900">
              {parental.mpsCm.toFixed(1)} cm
            </p>
            <p className="mt-2 text-xs text-teal-600 font-mono">{parental.mpsFormula}</p>
            <p className="mt-1 text-xs text-teal-700/80">
              Parental average for adjusted RWT and Khamis-Roche (standing height model).
              {parental.derivedFromMph &&
                ` From combined parental height ${parental.parentalSumCm.toFixed(1)} cm ÷ 2 — individual parent heights unknown.`}
            </p>
          </div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <UnitLengthInput
          label="Patient height"
          hint="Standing height for TW3 and Khamis-Roche. Adjusted RWT uses supine length — see checkbox below."
          valueCm={heightCm}
          onChangeCm={onHeightCmChange}
        />
        <UnitWeightInput
          label="Patient weight"
          valueKg={weightKg}
          onChangeKg={onWeightKgChange}
        />
        <AgeInput
          label="Chronological age"
          hint={`Required for all methods. Khamis-Roche: ${KHAMIS_ROCHE_AGE_MIN}–${KHAMIS_ROCHE_AGE_MAX} y. CDC chart: 2–20 y.`}
          valueYears={chronAgeYears}
          onChangeYears={onChronAgeChange}
          modes={["decimal", "years-months", "months"]}
          defaultMode="years-months"
        />
      </div>

      {showMenarchePrompt && (
        <fieldset className="rounded-xl border border-violet-200 bg-violet-50/40 p-4">
          <legend className="px-1 text-sm font-semibold text-violet-900">
            Menarchal status — TW3 method (Table VI)
          </legend>
          <p className="mb-3 text-sm text-violet-800">
            Girls aged 11–14 y use separate pre- and post-menarche coefficient charts.
          </p>
          <div className="flex flex-wrap gap-3">
            {(
              [
                ["pre", "Pre-menarche"],
                ["post", "Post-menarche"],
              ] as const
            ).map(([value, label]) => (
              <label
                key={value}
                className={`flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-2 text-sm ${
                  menarchalStatus === value
                    ? "border-violet-600 bg-violet-100 font-medium text-violet-900"
                    : "border-violet-200 bg-white text-violet-800 hover:border-violet-400"
                }`}
              >
                <input
                  type="radio"
                  name="menarchalStatus"
                  value={value}
                  checked={menarchalStatus === value}
                  onChange={() => onMenarchalStatusChange(value)}
                  className="text-violet-700 focus:ring-violet-500"
                />
                {label}
              </label>
            ))}
          </div>
        </fieldset>
      )}

      <label className="flex items-center gap-3 rounded-xl border border-teal-100 bg-teal-50/40 px-4 py-3">
        <input
          type="checkbox"
          checked={tw3ApplyMphAdjustment}
          onChange={(e) => onTw3ApplyMphAdjustmentChange(e.target.checked)}
          className="h-4 w-4 shrink-0 rounded border-teal-300 text-teal-700 focus:ring-teal-500"
        />
        <span className="flex items-center text-sm font-medium text-teal-900">
          TW3 MPH adjustment
          <InfoTooltip text="When checked, adds ⅓ × (MPH − 168 cm) to the TW3 prediction per Tanner et al. 1975. Does not affect adjusted RWT or Khamis-Roche." />
        </span>
      </label>

      <label className="flex items-center gap-3 rounded-xl border border-amber-100 bg-amber-50/60 px-4 py-3">
        <input
          type="checkbox"
          checked={heightIsStandingVertical}
          onChange={(e) => onHeightIsStandingVerticalChange(e.target.checked)}
          className="h-4 w-4 shrink-0 rounded border-teal-300 text-teal-700 focus:ring-teal-500"
        />
        <span className="flex items-center text-sm font-medium text-teal-900">
          Height measured standing
          <InfoTooltip
            text={`Adjusted RWT uses supine length. When checked, ${RWT_SUPINE_HEIGHT_ADJUSTMENT_CM} cm is added to the entered height for the calculation. Uncheck if the value you entered is already supine length. TW3 method always uses the entered height without this adjustment.`}
          />
        </span>
      </label>

      <AgeInput
        label="Bone age"
        hint={
          boneAgeFromTw3
            ? "From TW3 calculator — required for TW3 and adjusted RWT. Decimal years or years + months."
            : "Required for TW3 and adjusted RWT. Decimal years or years + months."
        }
        valueYears={boneAgeYears}
        onChangeYears={onBoneAgeChange}
        modes={["decimal", "years-months"]}
        defaultMode="decimal"
      />

      <div>
        <p className="mb-3 text-sm font-medium text-teal-900">
          Select a prediction method, then view on the CDC growth chart
        </p>
        <div className="grid gap-4 lg:grid-cols-3">
          <SelectableResultCard
            method="tw3"
            title="TW3 method predicted height"
            selected={selectedMethod === "tw3"}
            onSelect={() => setSelectedMethod("tw3")}
            result={tw3Result}
            placeholder="TW3 method — enter height, bone age, chronological age, and parental stature. Girls 11–14 y: select menarchal status."
          />
          <SelectableResultCard
            method="adjusted-rwt"
            title="Adjusted RWT predicted height"
            selected={selectedMethod === "adjusted-rwt"}
            onSelect={() => setSelectedMethod("adjusted-rwt")}
            result={rwtResult}
            placeholder="Adjusted RWT — enter all fields above. MPS and supine height correction apply automatically."
          />
          <SelectableResultCard
            method="khamis-roche"
            title="Khamis-Roche predicted height"
            selected={selectedMethod === "khamis-roche"}
            onSelect={() => setSelectedMethod("khamis-roche")}
            result={krResult}
            placeholder={`Khamis-Roche — standing height, weight, MPS, and chronological age (${KHAMIS_ROCHE_AGE_MIN}–${KHAMIS_ROCHE_AGE_MAX} y). No bone age needed.`}
          />
        </div>
      </div>

      {onContinueToChart && (
        <div className="space-y-4">
          <CopyClinicalSummaryButton summary={clinicalSummary} />
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              disabled={!canContinue}
              onClick={() => {
                if (selectedMethod && canContinue) {
                  onContinueToChart(selectedMethod, predictions);
                }
              }}
              className="rounded-lg bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:bg-teal-300"
            >
              View CDC growth chart
            </button>
            {selectedMethod && (
              <span className="text-sm text-teal-700">
                {HEIGHT_PREDICTION_METHOD_LABELS[selectedMethod]}
                {isValidPrediction(selectedResult) &&
                  ` — ${selectedResult.value.toFixed(1)} cm`}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
