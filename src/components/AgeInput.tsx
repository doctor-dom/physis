import { useEffect, useState } from "react";
import { Field, NumberInput } from "./FormFields";
import {
  formatDecimalYears,
  parseDecimalYearsString,
  splitDecimalYearsToYearsMonths,
  totalMonthsFromDecimalYears,
  yearsFromTotalMonths,
  yearsFromYearsAndMonths,
} from "@core/ageUnits";

export type AgeInputMode = "decimal" | "years-months" | "months";

interface AgeInputProps {
  label: string;
  hint?: string;
  /** Canonical age in decimal years (string, empty if unset). */
  valueYears: string;
  onChangeYears: (years: string) => void;
  /** Which input formats are available. */
  modes: AgeInputMode[];
  defaultMode?: AgeInputMode;
}

export default function AgeInput({
  label,
  hint,
  valueYears,
  onChangeYears,
  modes,
  defaultMode,
}: AgeInputProps) {
  const initialMode = defaultMode ?? modes[0];
  const [mode, setMode] = useState<AgeInputMode>(initialMode);
  const [decimal, setDecimal] = useState(valueYears);
  const [decimalFocused, setDecimalFocused] = useState(false);
  const [yearsPart, setYearsPart] = useState("");
  const [monthsPart, setMonthsPart] = useState("");
  const [totalMonths, setTotalMonths] = useState("");

  useEffect(() => {
    const parsed = parseDecimalYearsString(valueYears);
    if (parsed === null) {
      if (valueYears === "") {
        setDecimal("");
        setYearsPart("");
        setMonthsPart("");
        setTotalMonths("");
      }
      return;
    }
    if (!decimalFocused) {
      setDecimal(formatDecimalYears(parsed));
    }
    const ym = splitDecimalYearsToYearsMonths(parsed);
    setYearsPart(String(ym.years));
    setMonthsPart(String(ym.months));
    setTotalMonths(String(totalMonthsFromDecimalYears(parsed)));
  }, [valueYears, decimalFocused]);

  function handleDecimalBlur() {
    setDecimalFocused(false);
    const parsed = parseDecimalYearsString(decimal);
    if (parsed === null) {
      const parentParsed = parseDecimalYearsString(valueYears);
      setDecimal(parentParsed === null ? "" : formatDecimalYears(parentParsed));
      return;
    }
    const formatted = formatDecimalYears(parsed);
    setDecimal(formatted);
    onChangeYears(formatted);
  }

  function emitYears(years: number) {
    onChangeYears(formatDecimalYears(years));
  }

  function handleModeChange(next: AgeInputMode) {
    setMode(next);
    const parsed = parseDecimalYearsString(valueYears);
    if (parsed !== null) {
      emitYears(parsed);
    }
  }

  const modeLabels: Record<AgeInputMode, string> = {
    decimal: "Years (decimal)",
    "years-months": "Years + months",
    months: "Total months",
  };

  return (
    <Field label={label} hint={hint}>
      {modes.length > 1 && (
        <div className="mb-2 flex flex-wrap gap-2">
          {modes.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => handleModeChange(m)}
              className={`rounded-lg px-3 py-1 text-xs font-medium transition ${
                mode === m
                  ? "bg-teal-700 text-white"
                  : "border border-teal-200 bg-white text-teal-800 hover:bg-teal-50"
              }`}
            >
              {modeLabels[m]}
            </button>
          ))}
        </div>
      )}

      {mode === "decimal" && (
        <NumberInput
          value={decimal}
          onFocus={() => setDecimalFocused(true)}
          onBlur={handleDecimalBlur}
          onChange={(v) => {
            setDecimal(v);
            if (v === "") {
              onChangeYears("");
              return;
            }
            const n = parseFloat(v);
            if (!Number.isNaN(n)) onChangeYears(v);
          }}
          min={0}
          step="0.1"
          placeholder="e.g. 10.5"
        />
      )}

      {mode === "years-months" && (
        <div className="flex gap-2">
          <NumberInput
            value={yearsPart}
            onChange={(v) => {
              setYearsPart(v);
              const y = v === "" ? 0 : parseFloat(v);
              const m =
                monthsPart === "" ? 0 : parseFloat(monthsPart);
              if (v === "" && monthsPart === "") {
                onChangeYears("");
                return;
              }
              if (!Number.isNaN(y) && !Number.isNaN(m)) {
                emitYears(yearsFromYearsAndMonths(y, m));
              }
            }}
            min={0}
            step="1"
            placeholder="Years"
          />
          <NumberInput
            value={monthsPart}
            onChange={(v) => {
              setMonthsPart(v);
              const y = yearsPart === "" ? 0 : parseFloat(yearsPart);
              const m = v === "" ? 0 : parseFloat(v);
              if (yearsPart === "" && v === "") {
                onChangeYears("");
                return;
              }
              if (!Number.isNaN(y) && !Number.isNaN(m)) {
                emitYears(yearsFromYearsAndMonths(y, Math.min(11, Math.max(0, m))));
              }
            }}
            min={0}
            step="1"
            placeholder="Months"
          />
        </div>
      )}

      {mode === "months" && (
        <NumberInput
          value={totalMonths}
          onChange={(v) => {
            setTotalMonths(v);
            if (v === "") {
              onChangeYears("");
              return;
            }
            const n = parseFloat(v);
            if (!Number.isNaN(n)) emitYears(yearsFromTotalMonths(n));
          }}
          min={0}
          step="1"
          placeholder="e.g. 126"
        />
      )}

      {valueYears !== "" && parseDecimalYearsString(valueYears) !== null && (
        <p className="mt-1 text-xs text-teal-600">
          = {formatDecimalYears(parseDecimalYearsString(valueYears)!)} years
        </p>
      )}
    </Field>
  );
}
