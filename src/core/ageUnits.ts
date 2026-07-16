/** Convert years + months to decimal years. */
export function yearsFromYearsAndMonths(
  years: number,
  months: number,
): number {
  return years + months / 12;
}

/** Convert total months to decimal years. */
export function yearsFromTotalMonths(totalMonths: number): number {
  return totalMonths / 12;
}

/** Split decimal years into whole years and remaining months (0–11). */
export function splitDecimalYearsToYearsMonths(decimalYears: number): {
  years: number;
  months: number;
} {
  const years = Math.floor(decimalYears);
  const months = Math.round((decimalYears - years) * 12);
  if (months === 12) {
    return { years: years + 1, months: 0 };
  }
  return { years, months };
}

export function totalMonthsFromDecimalYears(decimalYears: number): number {
  return Math.round(decimalYears * 12);
}

export function parseDecimalYearsString(value: string): number | null {
  if (value.trim() === "") return null;
  const n = parseFloat(value);
  return Number.isNaN(n) ? null : n;
}

export function formatDecimalYears(years: number, digits = 2): string {
  return years.toFixed(digits);
}
