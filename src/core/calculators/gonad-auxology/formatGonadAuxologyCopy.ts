import {
  formatPercentile,
  formatPercentileAndSds,
  formatSds,
} from "./normogramUtils";
import {
  type SplNewbornCombinedResult,
} from "./calculateSplNewborn";
import {
  type SplChildCombinedResult,
} from "./calculateSplChild";
import {
  CLITORAL_CITATION,
  type ClitoralDimensionResult,
} from "./calculateClitoralDimension";

export function formatSplNewbornForCopy(result: SplNewbornCombinedResult): string {
  const lines = [
    "STRETCHED PENILE LENGTH — NEWBORN",
    `Gestational age: ${result.gestationalAgeWeeks} weeks`,
    `SPL: ${result.splCm.toFixed(2)} cm`,
    "",
  ];

  for (const ref of result.references) {
    lines.push(ref.referenceLabel);
    lines.push(`  Percentile: ${formatPercentile(ref.patient.percentile)}`);
    lines.push(`  SDS (Z-score): ${formatSds(ref.patient.sds)}`);
    lines.push(`  ${ref.citation}`);
    lines.push("");
  }

  return lines.join("\n").trim();
}

export function formatSplChildForCopy(result: SplChildCombinedResult): string {
  const lines = [
    "STRETCHED PENILE LENGTH — CHILD",
    `Age: ${result.ageYears.toFixed(2)} years`,
    `SPL: ${result.splCm.toFixed(2)} cm`,
    "",
  ];

  for (const ref of result.references) {
    lines.push(ref.referenceLabel);
    lines.push(`  Percentile: ${formatPercentile(ref.patient.percentile)}`);
    lines.push(`  SDS (Z-score): ${formatSds(ref.patient.sds)}`);
    lines.push(`  ${ref.citation}`);
    lines.push("");
  }

  return lines.join("\n").trim();
}

export function formatClitoralDimensionForCopy(result: ClitoralDimensionResult): string {
  const lines = [
    "CLITORAL DIMENSIONS — NEONATE",
    `Gestational age: ${result.gestationalAgeWeeks} weeks`,
    "",
  ];

  for (const m of result.measurements) {
    lines.push(`${m.yLabel}: ${m.patient.y.toFixed(2)} cm`);
    lines.push(`  ${formatPercentileAndSds(m.patient.percentile, m.patient.sds)}`);
    lines.push("");
  }

  lines.push(CLITORAL_CITATION);
  return lines.join("\n").trim();
}
