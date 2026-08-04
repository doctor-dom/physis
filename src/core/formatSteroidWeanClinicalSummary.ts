import {
  formatDailyDoseWithMgM2,
  formatDoseMgAndMgM2,
  formatIvSteroidDoseMg,
  formatMgM2PerDay,
  formatSteroidDoseMg,
  HCT_WEAN_THRESHOLD_MG_M2,
  roundPreferWholeOrOneDecimal,
  STRESS_DOSE_INDICATIONS,
  type IvQidDoses,
  type PoTidDoses,
  type SteroidWeanSchedule,
} from "./calculators/steroid/calculateSteroidWeanSchedule";

function formatPoLine(label: string, po: PoTidDoses, bsaM2: number): string {
  const total = formatDailyDoseWithMgM2(po.totalDaily, bsaM2);
  if (po.schedule === "bid") {
    return `${label}: AM ${formatSteroidDoseMg(po.morning)}, midday ${formatSteroidDoseMg(po.midday)} (BID; total ${total})`;
  }
  return `${label}: AM ${formatSteroidDoseMg(po.morning)}, midday ${formatSteroidDoseMg(po.midday)}, PM ${formatSteroidDoseMg(po.evening)} (TID; total ${total})`;
}

function formatIvLine(label: string, iv: IvQidDoses, bsaM2: number): string {
  const total = formatDailyDoseWithMgM2(iv.totalDaily, bsaM2);
  return `${label}: QID ${formatIvSteroidDoseMg(iv.dose1)}, ${formatIvSteroidDoseMg(iv.dose2)}, ${formatIvSteroidDoseMg(iv.dose3)}, ${formatIvSteroidDoseMg(iv.dose4)} (total ${total})`;
}

/** Compact dose number for wean-only copy (e.g. 7.5, 1.25). */
function formatCompactDoseNumber(doseMg: number): string {
  if (doseMg % 1 === 0) return doseMg.toFixed(0);
  return doseMg.toFixed(2).replace(/\.?0+$/, "");
}

/** Actual intensity for wean-only paren, e.g. (29 mg/m²/day). */
function formatWeanOnlyMgM2Paren(mgPerM2: number): string {
  const rounded = roundPreferWholeOrOneDecimal(mgPerM2);
  const text =
    rounded % 1 === 0 ? rounded.toFixed(0) : rounded.toFixed(1);
  return `(${text} mg/m²/day)`;
}

/**
 * Short wean-only PO line:
 * - equal TID → HCT 7.5mg TID (29mg/m²/day)
 * - unequal TID → AM 2.5 mg, midday 2.5 mg, PM 1.25 mg (8 mg/m²/day)
 * - BID → AM 1.25 mg, midday 1.25 mg, no evening dose (3.2 mg/m²/day)
 */
export function formatWeanOnlyPoStageLine(
  po: PoTidDoses,
  actualMgPerM2PerDay: number,
): string {
  const intensity = formatWeanOnlyMgM2Paren(actualMgPerM2PerDay);
  const equalTid =
    po.schedule === "tid" &&
    po.morning > 0 &&
    po.morning === po.midday &&
    po.midday === po.evening;

  if (equalTid) {
    return `HCT ${formatCompactDoseNumber(po.morning)}mg TID ${intensity}`;
  }

  if (po.schedule === "bid" || po.evening === 0) {
    return `AM ${formatCompactDoseNumber(po.morning)} mg, midday ${formatCompactDoseNumber(po.midday)} mg, no evening dose ${intensity}`;
  }

  return `AM ${formatCompactDoseNumber(po.morning)} mg, midday ${formatCompactDoseNumber(po.midday)} mg, PM ${formatCompactDoseNumber(po.evening)} mg ${intensity}`;
}

function appendTransitionLines(
  lines: string[],
  schedule: SteroidWeanSchedule,
): void {
  if (!schedule.transition) return;
  const t = schedule.transition;
  lines.push("Transition to Wean");
  lines.push(
    `Current regimen: ${t.currentSteroidLabel} ${formatDoseMgAndMgM2(t.currentSteroidDoseMg, t.currentSteroidMgPerM2PerDay)}`,
  );
  lines.push(
    `Hydrocortisone equivalent: ${formatDoseMgAndMgM2(t.hctEquivalentMgPerDay, t.hctEquivalentMgPerM2PerDay)}`,
  );
  lines.push(
    `Wean threshold: ${HCT_WEAN_THRESHOLD_MG_M2} mg/m²/day (hydrocortisone equivalent minimum)`,
  );
  if (t.atOrBelowWeanThreshold) {
    lines.push(
      "At or below wean threshold — proceed with structured wean below.",
    );
  } else if (
    t.thresholdCurrentSteroidDoseMg !== undefined &&
    t.thresholdCurrentSteroidMgPerM2PerDay !== undefined &&
    t.thresholdHctMgPerM2PerDay !== undefined
  ) {
    const hctEq =
      t.thresholdHctDoseMg !== undefined
        ? formatDoseMgAndMgM2(
            t.thresholdHctDoseMg,
            t.thresholdHctMgPerM2PerDay,
          )
        : formatMgM2PerDay(t.thresholdHctMgPerM2PerDay);
    lines.push(
      `Reduce to ${t.currentSteroidLabel} ${formatDoseMgAndMgM2(t.thresholdCurrentSteroidDoseMg, t.thresholdCurrentSteroidMgPerM2PerDay)} (hydrocortisone equivalent ${hctEq}) before structured wean.`,
    );
  }
  lines.push("");
}

function appendWeanStageLines(
  lines: string[],
  schedule: SteroidWeanSchedule,
): void {
  if (!schedule.includeWeanSchedule) return;
  const { bsaM2 } = schedule;
  lines.push("Steroid Wean — PO hydrocortisone (equal-preferred TID; BID when needed)");
  for (const row of schedule.weanStages) {
    lines.push(
      `Target ${row.targetMgPerM2PerDay} mg/m²/day, actual ${formatMgM2PerDay(row.actualPoMgPerM2PerDay)} — ${formatPoLine("doses", row.po, bsaM2)}`,
    );
  }
  lines.push("");
  lines.push("Steroid Wean — IV hydrocortisone");
  for (const row of schedule.weanStages) {
    lines.push(
      `Target ${row.targetMgPerM2PerDay} mg/m²/day, actual ${formatMgM2PerDay(row.actualIvMgPerM2PerDay)} — ${formatIvLine("doses", row.iv, bsaM2)}`,
    );
  }
  lines.push("");
}

/**
 * Short wean-only copy: PO HCT stage lines (equal TID compact; unequal/BID expanded).
 * Full output copy remains in buildSteroidWeanClinicalSummary.
 */
export function buildSteroidWeanOnlyClinicalSummary(
  schedule: SteroidWeanSchedule,
): string | null {
  if (!schedule.includeWeanSchedule) return null;

  const lines: string[] = ["PO Hydrocortisone/ HCT as follows:"];
  for (const row of schedule.weanStages) {
    lines.push(formatWeanOnlyPoStageLine(row.po, row.actualPoMgPerM2PerDay));
  }
  lines.push("-- stop HCT --");
  return lines.join("\n");
}

export function buildSteroidWeanClinicalSummary(
  schedule: SteroidWeanSchedule,
): string {
  const { bsaM2 } = schedule;
  const lines: string[] = [
    "BSA & Steroid Wean (PHYSIS)",
    `BSA: ${bsaM2.toFixed(3)} m²`,
    "",
  ];

  appendTransitionLines(lines, schedule);
  appendWeanStageLines(lines, schedule);

  lines.push("Maintenance — PO hydrocortisone (equal-preferred TID)");
  for (const row of schedule.maintenance) {
    lines.push(
      `Target ${row.targetMgPerM2PerDay} mg/m²/day, actual ${formatMgM2PerDay(row.actualMgPerM2PerDay)} — ${formatPoLine("doses", row.po, bsaM2)}`,
    );
  }
  lines.push("");

  lines.push("Stress dosing — 30 mg/m²/day hydrocortisone");
  lines.push(STRESS_DOSE_INDICATIONS);
  lines.push(`Target ${formatDailyDoseWithMgM2(schedule.stress.targetTotalDailyMg, bsaM2)}`);
  lines.push(
    `PO actual ${formatMgM2PerDay(schedule.stress.actualPoMgPerM2PerDay)} — ${formatPoLine("PO", schedule.stress.po, bsaM2)}`,
  );
  lines.push(
    `IV actual ${formatMgM2PerDay(schedule.stress.actualIvMgPerM2PerDay)} — ${formatIvLine("IV", schedule.stress.iv, bsaM2)}`,
  );
  lines.push("");

  const a = schedule.anesthesia;
  lines.push("Anesthesia / severe illness or injury");
  lines.push(
    `Single dose: ${formatIvSteroidDoseMg(a.singleDoseMg)} (target ${a.singleDoseTargetMgPerM2} mg/m²; actual ${formatMgM2PerDay(a.singleDoseMgPerM2)}; max 100 mg) hydrocortisone IV/IM once.`,
  );
  lines.push(
    `Follow-up target ${formatMgM2PerDay(a.followUpTargetMgPerM2PerDay)} (max 100 mg total).`,
  );
  lines.push(
    `Follow-up PO actual ${formatMgM2PerDay(a.followUpActualPoMgPerM2PerDay)} — ${formatPoLine("Follow-up PO", a.followUpPo, bsaM2)}`,
  );
  lines.push(
    `Follow-up IV actual ${formatMgM2PerDay(a.followUpActualIvMgPerM2PerDay)} — ${formatIvLine("Follow-up IV", a.followUpIv, bsaM2)}`,
  );

  return lines.join("\n");
}
