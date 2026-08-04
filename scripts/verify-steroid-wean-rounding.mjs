/**
 * Focused checks for steroid wean PO equal-split and anesthesia rounding.
 * Mirrors src/core/calculators/steroid/calculateSteroidWeanSchedule.ts — keep in sync.
 *
 * Run: node scripts/verify-steroid-wean-rounding.mjs
 */

let failed = 0;

function assert(cond, msg) {
  if (!cond) {
    failed += 1;
    console.error(`FAIL: ${msg}`);
  } else {
    console.log(`ok: ${msg}`);
  }
}

function nearly(a, b, eps = 1e-9) {
  return Math.abs(a - b) < eps;
}

const PO_HCT_DOSE_INCREMENT_MG = 1.25;
const PO_ANESTHESIA_TABLET_MG = 5;
const ANESTHESIA_MG_M2 = 100;
const ANESTHESIA_MAX_MG = 100;
const ANESTHESIA_WHOLE_MG_CEIL_BELOW = 25;

function roundToDoseIncrement(doseMg, increment, mode = "nearest") {
  if (doseMg <= 0) return 0;
  if (mode === "ceil") {
    return Math.ceil(doseMg / increment - 1e-12) * increment;
  }
  return Math.round(doseMg / increment) * increment;
}

function splitPoEqualPreferred(totalDailyMg, increment, options = {}) {
  const totalRounding = options.totalRounding ?? "nearest";
  let total = roundToDoseIncrement(totalDailyMg, increment, totalRounding);
  if (totalRounding === "nearest" && total > 0 && total < increment) {
    total = 0;
  }
  if (total <= 0) {
    return { morning: 0, midday: 0, evening: 0, totalDaily: 0, schedule: "tid" };
  }

  const units = Math.round(total / increment);

  if (units >= 3 && units % 3 === 0) {
    const each = (units / 3) * increment;
    return {
      morning: each,
      midday: each,
      evening: each,
      totalDaily: each * 3,
      schedule: "tid",
    };
  }

  if (units >= 3) {
    const base = Math.floor(units / 3);
    let rem = units % 3;
    let mU = base;
    let midU = base;
    let eU = base;
    while (rem > 0) {
      if (mU <= midU && mU <= eU) mU += 1;
      else if (midU <= eU) midU += 1;
      else eU += 1;
      rem -= 1;
    }
    const sorted = [mU, midU, eU].sort((a, b) => b - a);
    return {
      morning: sorted[0] * increment,
      midday: sorted[1] * increment,
      evening: sorted[2] * increment,
      totalDaily: units * increment,
      schedule: "tid",
    };
  }

  if (units >= 2) {
    if (units % 2 === 0) {
      const each = (units / 2) * increment;
      return {
        morning: each,
        midday: each,
        evening: 0,
        totalDaily: each * 2,
        schedule: "bid",
      };
    }
    const morningU = Math.ceil(units / 2);
    const middayU = units - morningU;
    return {
      morning: morningU * increment,
      midday: middayU * increment,
      evening: 0,
      totalDaily: units * increment,
      schedule: "bid",
    };
  }

  return {
    morning: units * increment,
    midday: 0,
    evening: 0,
    totalDaily: units * increment,
    schedule: "bid",
  };
}

function anesthesiaSingleDoseMg(bsaM2) {
  const raw = Math.min(ANESTHESIA_MAX_MG, ANESTHESIA_MG_M2 * bsaM2);
  if (raw <= 0) return 0;
  if (raw < ANESTHESIA_WHOLE_MG_CEIL_BELOW) {
    return Math.ceil(raw - 1e-12);
  }
  return Math.ceil(raw / 5 - 1e-12) * 5;
}

function roundIvWholeMg(doseMg) {
  if (doseMg <= 0) return 0;
  return Math.round(doseMg);
}

function splitIvHydrocortisoneQidWholeMg(totalDailyMg) {
  if (totalDailyMg <= 0) {
    return { dose1: 0, dose2: 0, dose3: 0, dose4: 0, totalDaily: 0 };
  }
  const perDose = totalDailyMg / 4;
  const dose1 = roundIvWholeMg(perDose);
  const dose2 = roundIvWholeMg(perDose);
  const dose3 = roundIvWholeMg(perDose);
  const dose4 = Math.max(0, roundIvWholeMg(totalDailyMg - dose1 - dose2 - dose3));
  return {
    dose1,
    dose2,
    dose3,
    dose4,
    totalDaily: dose1 + dose2 + dose3 + dose4,
  };
}

// Equal TID when total is multiple of 3.75
{
  const po = splitPoEqualPreferred(11.25, PO_HCT_DOSE_INCREMENT_MG);
  assert(po.schedule === "tid", "11.25 → TID");
  assert(
    nearly(po.morning, 3.75) && nearly(po.midday, 3.75) && nearly(po.evening, 3.75),
    "11.25 → equal 3.75 TID",
  );
}

// AM-larger unequal TID
{
  const po = splitPoEqualPreferred(5, PO_HCT_DOSE_INCREMENT_MG); // rounds to 5; units=4
  assert(po.schedule === "tid", "5 mg → TID");
  assert(
    nearly(po.morning, 2.5) && nearly(po.midday, 1.25) && nearly(po.evening, 1.25),
    "5 mg → AM-larger TID 2.5/1.25/1.25",
  );
  assert(po.morning >= po.midday && po.midday >= po.evening, "morning ≥ midday ≥ evening");
}

// BID fallback when < 3 units
{
  const po = splitPoEqualPreferred(2.5, PO_HCT_DOSE_INCREMENT_MG); // units=2
  assert(po.schedule === "bid", "2.5 → BID");
  assert(
    nearly(po.morning, 1.25) && nearly(po.midday, 1.25) && nearly(po.evening, 0),
    "2.5 → equal BID",
  );
}

// Anesthesia single-dose ceil <25 → integer
{
  // BSA 0.2 → raw 20 → ceil 20
  assert(anesthesiaSingleDoseMg(0.2) === 20, "BSA 0.2 → single 20 mg");
  // BSA 0.201 → raw 20.1 → ceil 21
  assert(anesthesiaSingleDoseMg(0.201) === 21, "BSA 0.201 → single 21 mg");
}

// Anesthesia single-dose ceil ≥25 → 5 mg
{
  // BSA 0.26 → raw 26 → ceil to 30
  assert(anesthesiaSingleDoseMg(0.26) === 30, "BSA 0.26 → single 30 mg");
  // BSA 0.25 → raw 25 → 25
  assert(anesthesiaSingleDoseMg(0.25) === 25, "BSA 0.25 → single 25 mg");
  // Cap at 100
  assert(anesthesiaSingleDoseMg(1.5) === 100, "BSA 1.5 → capped 100 mg");
}

// Anesthesia PO ceil-to-5 equal-first
{
  const po = splitPoEqualPreferred(22, PO_ANESTHESIA_TABLET_MG, {
    totalRounding: "ceil",
  });
  assert(po.totalDaily === 25, "22 mg PO ceil total → 25");
  assert(
    nearly(po.morning, 10) && nearly(po.midday, 10) && nearly(po.evening, 5),
    "25 mg on 5 mg grid → 10/10/5",
  );
  const equal = splitPoEqualPreferred(15, PO_ANESTHESIA_TABLET_MG, {
    totalRounding: "ceil",
  });
  assert(
    nearly(equal.morning, 5) &&
      nearly(equal.midday, 5) &&
      nearly(equal.evening, 5),
    "15 mg → equal 5 TID",
  );
}

// Anesthesia IV whole mg
{
  const iv = splitIvHydrocortisoneQidWholeMg(22);
  assert(
    Number.isInteger(iv.dose1) &&
      Number.isInteger(iv.dose2) &&
      Number.isInteger(iv.dose3) &&
      Number.isInteger(iv.dose4),
    "IV QID whole mg integers",
  );
  assert(iv.totalDaily === 22, "IV QID preserves 22 mg total");
}

// Threshold display helpers (format shape)
{
  function formatDailyMg(doseMg) {
    const rounded =
      doseMg % 1 === 0
        ? doseMg.toFixed(0)
        : doseMg.toFixed(2).replace(/\.?0+$/, "");
    return `${rounded} mg/day`;
  }
  function formatMgM2PerDay(mgPerM2) {
    const roundedWhole = Math.round(mgPerM2);
    const rounded =
      Math.abs(mgPerM2 - roundedWhole) < 0.06
        ? roundedWhole
        : Math.round(mgPerM2 * 10) / 10;
    const text = rounded % 1 === 0 ? rounded.toFixed(0) : rounded.toFixed(1);
    return `${text} mg/m²/day`;
  }
  function formatDoseMgAndMgM2(doseMg, mgPerM2PerDay) {
    return `${formatDailyMg(doseMg)} (${formatMgM2PerDay(mgPerM2PerDay)})`;
  }
  const text = formatDoseMgAndMgM2(12, 30);
  assert(
    text.includes("mg/day") && text.includes("mg/m²/day"),
    "threshold display includes mg/day and mg/m²/day",
  );
}

if (failed > 0) {
  console.error(`\n${failed} assertion(s) failed`);
  process.exit(1);
}
console.log("\nAll steroid wean rounding checks passed.");
