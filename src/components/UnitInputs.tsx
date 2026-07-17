import { useEffect, useState } from "react";
import {
  cmToFeetInches,
  cmToInches,
  feetInchesToCm,
  formatFeetInchesFromCm,
  inchesToCm,
} from "@core/units";
import { Field, DecimalTextInput, NumberInput } from "./FormFields";

type LengthUnit = "cm" | "in" | "ft-in";

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

function lengthDisplayFromCm(valueCm: string, unit: Exclude<LengthUnit, "ft-in">): string {
  if (valueCm === "") return "";
  const cm = parseFloat(valueCm);
  if (Number.isNaN(cm)) return "";
  return unit === "cm" ? valueCm : cmToInches(cm).toFixed(2);
}

function feetInchesDisplayFromCm(valueCm: string): { feet: string; inches: string } {
  if (valueCm === "") return { feet: "", inches: "" };
  const cm = parseFloat(valueCm);
  if (Number.isNaN(cm)) return { feet: "", inches: "" };
  const { feet, inches } = cmToFeetInches(cm);
  return {
    feet: String(feet),
    inches: inches % 1 === 0 ? String(inches) : inches.toFixed(1),
  };
}

function parseFeetInchesToCm(feetRaw: string, inchesRaw: string): string {
  const hasFeet = feetRaw !== "" && feetRaw !== ".";
  const hasInches = inchesRaw !== "" && inchesRaw !== ".";
  if (!hasFeet && !hasInches) return "";

  const feet = hasFeet ? parseFloat(feetRaw) : 0;
  const inches = hasInches ? parseFloat(inchesRaw) : 0;
  if (Number.isNaN(feet) || Number.isNaN(inches) || feet < 0 || inches < 0) {
    return "";
  }
  return String(feetInchesToCm(feet, inches));
}

function commitFeetInchesOnBlur(
  feetRaw: string,
  inchesRaw: string,
): { feet: string; inches: string; valueCm: string } {
  const hasFeet = feetRaw !== "" && feetRaw !== ".";
  const hasInches = inchesRaw !== "" && inchesRaw !== ".";
  if (!hasFeet && !hasInches) {
    return { feet: "", inches: "", valueCm: "" };
  }

  let feet = hasFeet ? parseFloat(feetRaw) : 0;
  let inches = hasInches ? parseFloat(inchesRaw) : 0;
  if (Number.isNaN(feet) || Number.isNaN(inches) || feet < 0 || inches < 0) {
    return { feet: "", inches: "", valueCm: "" };
  }

  if (inches >= 12) {
    feet += Math.floor(inches / 12);
    inches = Math.round((inches % 12) * 10) / 10;
  }

  const valueCm = String(feetInchesToCm(feet, inches));
  return {
    feet: String(feet),
    inches: inches % 1 === 0 ? String(inches) : inches.toFixed(1),
    valueCm,
  };
}

interface UnitLengthInputProps {
  label: string;
  hint?: string;
  /** Stored value in centimeters (string for empty). */
  valueCm: string;
  onChangeCm: (cm: string) => void;
  placeholder?: string;
  /** When true, unit dropdown includes ft+in (father/mother heights). */
  allowFeetInches?: boolean;
}

export function UnitLengthInput({
  label,
  hint,
  valueCm,
  onChangeCm,
  placeholder,
  allowFeetInches = false,
}: UnitLengthInputProps) {
  const [unit, setUnit] = useState<LengthUnit>("cm");
  const [localDisplay, setLocalDisplay] = useState(valueCm);
  const [feetDisplay, setFeetDisplay] = useState("");
  const [inchesDisplay, setInchesDisplay] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (isFocused) return;
    if (unit === "ft-in") {
      const next = feetInchesDisplayFromCm(valueCm);
      setFeetDisplay(next.feet);
      setInchesDisplay(next.inches);
      return;
    }
    setLocalDisplay(lengthDisplayFromCm(valueCm, unit));
  }, [valueCm, unit, isFocused]);

  function handleUnitChange(next: LengthUnit) {
    if (next === unit) return;
    if (next === "ft-in" && !allowFeetInches) return;

    if (unit === "ft-in" && isFocused) {
      const committed = commitFeetInchesOnBlur(feetDisplay, inchesDisplay);
      setFeetDisplay(committed.feet);
      setInchesDisplay(committed.inches);
      onChangeCm(committed.valueCm);
    } else if (localDisplay !== "" && isFocused && unit !== "ft-in") {
      const committed = commitLengthOnBlur(localDisplay, unit);
      setLocalDisplay(
        next === "cm"
          ? committed.valueCm
          : next === "in"
            ? committed.valueCm === ""
              ? ""
              : cmToInches(parseFloat(committed.valueCm)).toFixed(2)
            : committed.display,
      );
      onChangeCm(committed.valueCm);
    }

    setUnit(next);

    if (next === "ft-in") {
      const nextFtIn = feetInchesDisplayFromCm(valueCm);
      setFeetDisplay(nextFtIn.feet);
      setInchesDisplay(nextFtIn.inches);
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

  function handleFeetInchesChange(nextFeet: string, nextInches: string) {
    if (!isPartialDecimal(nextFeet) || !isPartialDecimal(nextInches)) return;
    setFeetDisplay(nextFeet);
    setInchesDisplay(nextInches);
    onChangeCm(parseFeetInchesToCm(nextFeet, nextInches));
  }

  function handleBlur() {
    setIsFocused(false);
    if (unit === "ft-in") {
      const committed = commitFeetInchesOnBlur(feetDisplay, inchesDisplay);
      setFeetDisplay(committed.feet);
      setInchesDisplay(committed.inches);
      onChangeCm(committed.valueCm);
      return;
    }
    const committed = commitLengthOnBlur(localDisplay, unit);
    setLocalDisplay(committed.display);
    onChangeCm(committed.valueCm);
  }

  const cmNum = parseFloat(valueCm);
  const conversionHint =
    valueCm !== "" && !Number.isNaN(cmNum)
      ? unit === "cm"
        ? allowFeetInches
          ? `≈ ${formatFeetInchesFromCm(cmNum)} · ${cmToInches(cmNum).toFixed(2)} in`
          : `≈ ${cmToInches(cmNum).toFixed(2)} in`
        : unit === "in"
          ? allowFeetInches
            ? `≈ ${cmNum.toFixed(1)} cm · ${formatFeetInchesFromCm(cmNum)}`
            : `≈ ${cmNum.toFixed(1)} cm`
          : `≈ ${cmNum.toFixed(1)} cm · ${cmToInches(cmNum).toFixed(2)} in`
      : null;

  const singlePlaceholder =
    placeholder ?? (unit === "cm" ? "e.g. 178" : "e.g. 70");

  return (
    <Field label={label} hint={hint}>
      <div className="flex gap-2">
        {unit === "ft-in" ? (
          <div className="flex min-w-0 flex-1 items-center gap-1.5">
            <DecimalTextInput
              value={feetDisplay}
              onChange={(raw) => handleFeetInchesChange(raw, inchesDisplay)}
              onFocus={() => setIsFocused(true)}
              onBlur={handleBlur}
              placeholder="5"
            />
            <span className="shrink-0 text-xs text-teal-600">ft</span>
            <DecimalTextInput
              value={inchesDisplay}
              onChange={(raw) => handleFeetInchesChange(feetDisplay, raw)}
              onFocus={() => setIsFocused(true)}
              onBlur={handleBlur}
              placeholder="10"
            />
            <span className="shrink-0 text-xs text-teal-600">in</span>
          </div>
        ) : (
          <DecimalTextInput
            value={localDisplay}
            onChange={handleDisplayChange}
            onFocus={() => setIsFocused(true)}
            onBlur={handleBlur}
            placeholder={singlePlaceholder}
          />
        )}
        <select
          className="rounded-lg border border-teal-200 bg-white px-2 py-2 text-sm text-teal-900 shadow-sm"
          value={unit}
          onChange={(e) => handleUnitChange(e.target.value as LengthUnit)}
          aria-label={`${label} unit`}
        >
          <option value="cm">cm</option>
          <option value="in">in</option>
          {allowFeetInches && <option value="ft-in">ft+in</option>}
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
