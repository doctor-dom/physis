import { useEffect, useState } from "react";
import { cmToInches, inchesToCm } from "@core/units";
import { Field, DecimalTextInput, NumberInput } from "./FormFields";

type LengthUnit = "cm" | "in";

const DECIMAL_INPUT_PATTERN = /^\d*\.?\d*$/;

function isPartialDecimal(raw: string): boolean {
  return raw === "" || DECIMAL_INPUT_PATTERN.test(raw);
}

function commitLengthOnBlur(
  raw: string,
  unit: LengthUnit,
): { display: string; valueCm: string } {
  const trimmed = raw.trim();
  if (trimmed === "" || trimmed === ".") {
    return { display: "", valueCm: "" };
  }
  const n = parseFloat(trimmed);
  if (Number.isNaN(n) || n < 0) {
    return { display: "", valueCm: "" };
  }
  if (unit === "cm") {
    const display = String(n);
    return { display, valueCm: display };
  }
  const cm = inchesToCm(n);
  return {
    display: cmToInches(cm).toFixed(2),
    valueCm: String(cm),
  };
}

function lengthDisplayFromCm(valueCm: string, unit: LengthUnit): string {
  if (valueCm === "") return "";
  const cm = parseFloat(valueCm);
  if (Number.isNaN(cm)) return "";
  return unit === "cm" ? valueCm : cmToInches(cm).toFixed(2);
}

interface UnitLengthInputProps {
  label: string;
  hint?: string;
  /** Stored value in centimeters (string for empty). */
  valueCm: string;
  onChangeCm: (cm: string) => void;
  placeholder?: string;
}

export function UnitLengthInput({
  label,
  hint,
  valueCm,
  onChangeCm,
  placeholder,
}: UnitLengthInputProps) {
  const [unit, setUnit] = useState<LengthUnit>("cm");
  const [localDisplay, setLocalDisplay] = useState(valueCm);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (isFocused) return;
    setLocalDisplay(lengthDisplayFromCm(valueCm, unit));
  }, [valueCm, unit, isFocused]);

  function handleUnitChange(next: LengthUnit) {
    setUnit(next);
    if (localDisplay !== "" && isFocused) {
      const committed = commitLengthOnBlur(localDisplay, unit);
      setLocalDisplay(
        next === "cm"
          ? committed.valueCm
          : committed.valueCm === ""
            ? ""
            : cmToInches(parseFloat(committed.valueCm)).toFixed(2),
      );
      onChangeCm(committed.valueCm);
      return;
    }
    setLocalDisplay(lengthDisplayFromCm(valueCm, next));
  }

  function handleDisplayChange(raw: string) {
    if (!isPartialDecimal(raw)) return;
    setLocalDisplay(raw);
    if (raw === "" || raw === ".") {
      onChangeCm("");
      return;
    }
    const n = parseFloat(raw);
    if (Number.isNaN(n)) return;
    onChangeCm(unit === "cm" ? raw : String(inchesToCm(n)));
  }

  function handleBlur() {
    setIsFocused(false);
    const committed = commitLengthOnBlur(localDisplay, unit);
    setLocalDisplay(committed.display);
    onChangeCm(committed.valueCm);
  }

  const cmNum = parseFloat(valueCm);
  const conversionHint =
    valueCm !== "" && !Number.isNaN(cmNum)
      ? unit === "cm"
        ? `≈ ${cmToInches(cmNum).toFixed(2)} in`
        : `≈ ${cmNum.toFixed(1)} cm`
      : null;

  return (
    <Field label={label} hint={hint}>
      <div className="flex gap-2">
        <DecimalTextInput
          value={localDisplay}
          onChange={handleDisplayChange}
          onFocus={() => setIsFocused(true)}
          onBlur={handleBlur}
          placeholder={placeholder}
        />
        <select
          className="rounded-lg border border-teal-200 bg-white px-2 py-2 text-sm text-teal-900 shadow-sm"
          value={unit}
          onChange={(e) => handleUnitChange(e.target.value as LengthUnit)}
          aria-label={`${label} unit`}
        >
          <option value="cm">cm</option>
          <option value="in">in</option>
        </select>
      </div>
      {conversionHint && (
        <p className="mt-1 text-xs text-teal-600">{conversionHint}</p>
      )}
    </Field>
  );
}

interface UnitWeightInputProps {
  label: string;
  hint?: string;
  valueKg: string;
  onChangeKg: (kg: string) => void;
}

export function UnitWeightInput({
  label,
  hint,
  valueKg,
  onChangeKg,
}: UnitWeightInputProps) {
  const [unit, setUnit] = useState<"kg" | "lb">("kg");
  const [localDisplay, setLocalDisplay] = useState(valueKg);

  useEffect(() => {
    if (unit === "kg") {
      setLocalDisplay(valueKg);
    } else if (valueKg !== "") {
      const kg = parseFloat(valueKg);
      setLocalDisplay(Number.isNaN(kg) ? "" : (kg / 0.45359237).toFixed(1));
    } else {
      setLocalDisplay("");
    }
  }, [valueKg, unit]);

  function handleUnitChange(next: "kg" | "lb") {
    setUnit(next);
    if (valueKg === "") {
      setLocalDisplay("");
      return;
    }
    const kg = parseFloat(valueKg);
    if (Number.isNaN(kg)) return;
    setLocalDisplay(
      next === "kg" ? valueKg : (kg / 0.45359237).toFixed(1),
    );
  }

  function handleDisplayChange(raw: string) {
    setLocalDisplay(raw);
    if (raw === "") {
      onChangeKg("");
      return;
    }
    const n = parseFloat(raw);
    if (Number.isNaN(n)) return;
    onChangeKg(
      unit === "kg" ? raw : String(n * 0.45359237),
    );
  }

  const kgNum = parseFloat(valueKg);
  const conversionHint =
    valueKg !== "" && !Number.isNaN(kgNum)
      ? unit === "kg"
        ? `≈ ${(kgNum / 0.45359237).toFixed(1)} lb`
        : `≈ ${kgNum.toFixed(1)} kg`
      : null;

  return (
    <Field label={label} hint={hint}>
      <div className="flex gap-2">
        <NumberInput
          value={localDisplay}
          onChange={handleDisplayChange}
          min={0}
          step="0.1"
        />
        <select
          className="rounded-lg border border-teal-200 bg-white px-2 py-2 text-sm text-teal-900 shadow-sm"
          value={unit}
          onChange={(e) => handleUnitChange(e.target.value as "kg" | "lb")}
          aria-label={`${label} unit`}
        >
          <option value="kg">kg</option>
          <option value="lb">lb</option>
        </select>
      </div>
      {conversionHint && (
        <p className="mt-1 text-xs text-teal-600">{conversionHint}</p>
      )}
    </Field>
  );
}
