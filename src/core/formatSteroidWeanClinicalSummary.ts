import {
  formatDailyDoseWithMgM2,
  formatIvSteroidDoseMg,
  formatMgM2PerDay,
  formatSteroidDoseMg,
  HCT_WEAN_THRESHOLD_MG_M2,
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

export function buildSteroidWeanClinicalSummary(
  schedule: SteroidWeanSchedule,
): string {
  const { bsaM2 } = schedule;
  const lines: string[] = [
    "BSA & Steroid Wean (PHYSIS)",
    `BSA: ${bsaM2.toFixed(3)} m²`,
    "",
  ];

  if (schedule.transition) {
    const t = schedule.transition;
    lines.push("Transition to Wean");
    lines.push(
      `Current regimen: ${t.currentSteroidLabel} ${formatMgM2PerDay(t.currentSteroidMgPerM2PerDay)}`,
    );
    lines.push(
      `Hydrocortisone equivalent: ${formatMgM2PerDay(t.hctEquivalentMgPerM2PerDay)}`,
    );
    lines.push(
      `Wean threshold: ${HCT_WEAN_THRESHOLD_MG_M2} mg/m²/day (hydrocortisone equivalent minimum)`,
    );
    if (t.atOrBelowWeanThreshold) {
      lines.push(
        "At or below wean threshold — proceed with structured wean below.",
      );
    } else if (
      t.thresholdCurrentSteroidMgPerM2PerDay !== undefined &&
      t.thresholdHctMgPerM2PerDay !== undefined
    ) {
      lines.push(
        `Reduce to ${t.currentSteroidLabel} ${formatMgM2PerDay(t.thresholdCurrentSteroidMgPerM2PerDay)} (hydrocortisone equivalent ${formatMgM2PerDay(t.thresholdHctMgPerM2PerDay)}) before structured wean.`,
      );
    }
    lines.push("");
  }

  if (schedule.includeWeanSchedule) {
    lines.push("Steroid Wean — PO hydrocortisone");
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

  lines.push("Maintenance — PO hydrocortisone (TID)");
  for (const row of schedule.maintenance) {
    lines.push(
      `Target ${row.targetMgPerM2PerDay} mg/m²/day, actual ${formatMgM2PerDay(row.actualMgPerM2PerDay)} — ${formatPoLine("doses", row.po, bsaM2)}`,
    );
  }
  lines.push("");

  lines.push("Stress dosing — 30 mg/m²/day hydrocortisone");
  lines.push(STRESS_DOSE_INDICATIONS);
  lines.push(`Target ${formatDailyDoseWithMgM2(schedule.stress.targetTotalDailyMg, bsaM2)}`);
  lines.push(formatPoLine("PO", schedule.stress.po, bsaM2));
  lines.push(formatIvLine("IV", schedule.stress.iv, bsaM2));
  lines.push("");

  lines.push("Anesthesia / severe illness or injury");
  lines.push(
    `Single dose: ${formatIvSteroidDoseMg(schedule.anesthesia.singleDoseMg)} (${schedule.anesthesia.singleDoseMgPerM2.toFixed(1)} mg/m²; max 100 mg) hydrocortisone IV/IM once.`,
  );
  lines.push(
    `Follow-up: ${formatDailyDoseWithMgM2(schedule.anesthesia.followUpTotalDailyMg, bsaM2)} hydrocortisone (max 100 mg total).`,
  );
  lines.push(formatPoLine("Follow-up PO", schedule.anesthesia.followUpPo, bsaM2));
  lines.push(formatIvLine("Follow-up IV", schedule.anesthesia.followUpIv, bsaM2));

  return lines.join("\n");
}
