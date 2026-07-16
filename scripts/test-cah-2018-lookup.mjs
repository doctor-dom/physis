/**
 * QC checks for CAH-2018 Table 1 row matching, percentile insight, and Israeli Table 2.
 * Run: node scripts/test-cah-2018-lookup.mjs
 */
import { readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

const thresholdsPath = path.join(root, "src", "data", "cah", "thresholds.ts");
const ts = readFileSync(thresholdsPath, "utf8");

function parseThresholds(constName) {
  const match = ts.match(
    new RegExp(`export const ${constName} = (\\[[\\s\\S]*?\\]) as`),
  );
  if (!match) {
    console.error(`Could not parse ${constName} from thresholds.ts`);
    process.exit(1);
  }
  return JSON.parse(match[1]);
}

const cah2018Thresholds = parseThresholds("cah2018Thresholds");
const cahIsraelThresholds = parseThresholds("cahIsraelThresholds");

function rowMatchesBw(row, birthWeightG) {
  return birthWeightG >= row.bwMinG && birthWeightG <= row.bwMaxG;
}

function rowMatchesGa(row, gestationalAgeWeeks) {
  return gestationalAgeWeeks >= row.gaMinWeeks && gestationalAgeWeeks <= row.gaMaxWeeks;
}

function rowSpecificity(row) {
  const gaSpan = row.gaMaxWeeks >= 999 ? Infinity : row.gaMaxWeeks - row.gaMinWeeks;
  const bwSpan = row.bwMaxG >= 99999 ? Infinity : row.bwMaxG - row.bwMinG;
  return gaSpan + bwSpan;
}

function findCah2018Row(stratification, birthWeightG, gestationalAgeWeeks) {
  const pool = cah2018Thresholds.filter((e) => e.stratification === stratification);
  const matches =
    stratification === "bw_only"
      ? pool.filter((e) => rowMatchesBw(e, birthWeightG))
      : stratification === "ga_only"
        ? pool.filter((e) => rowMatchesGa(e, gestationalAgeWeeks))
        : pool.filter(
            (e) => rowMatchesBw(e, birthWeightG) && rowMatchesGa(e, gestationalAgeWeeks),
          );
  if (matches.length === 0) throw new Error("no match");
  return matches.reduce((best, e) => (rowSpecificity(e) < rowSpecificity(best) ? e : best));
}

function findCahIsraelRow(birthWeightG, gestationalAgeWeeks) {
  const hasGa = gestationalAgeWeeks != null && gestationalAgeWeeks > 0;
  const gaWeeksUsed = hasGa ? Math.ceil(gestationalAgeWeeks) : null;
  const bwMatches = cahIsraelThresholds.filter((e) => rowMatchesBw(e, birthWeightG));
  const candidates = hasGa
    ? bwMatches.filter((e) => rowMatchesGa(e, gaWeeksUsed))
    : bwMatches.filter((e) => e.matchesUnknownGa);
  if (candidates.length === 0) throw new Error("no match");
  return candidates.reduce((best, e) => (rowSpecificity(e) < rowSpecificity(best) ? e : best));
}

function evaluatePercentileInsight(ohpNmol, row) {
  const exceeded = row.percentiles.filter((tier) => ohpNmol > tier.cutoffNmol);
  return {
    recommendWorkup: exceeded.length > 0,
    exceededCount: exceeded.length,
  };
}

const table1Cases = [
  {
    name: "34 wk + 2370 g (combined) — row match",
    stratification: "bw_and_ga",
    bw: 2370,
    ga: 34,
    expectLabel: "≤2500 g and 32–≤36 wk",
    expectPercentileCount: 3,
  },
  {
    name: "34 wk GA-only — row match",
    stratification: "ga_only",
    bw: undefined,
    ga: 34,
    expectLabel: "32–≤36 wk",
    expectPercentileCount: 4,
  },
];

const percentileCases = [
  {
    name: "80 nmol/L on GA 34 row — exceeds 99.00 only",
    stratification: "ga_only",
    bw: undefined,
    ga: 34,
    ohp: 80,
    expectWorkup: true,
    expectExceededCount: 1,
  },
  {
    name: "50 nmol/L on GA 34 row — below all tiers",
    stratification: "ga_only",
    bw: undefined,
    ga: 34,
    ohp: 50,
    expectWorkup: false,
    expectExceededCount: 0,
  },
  {
    name: "110 nmol/L combined row — exceeds 99.90",
    stratification: "bw_and_ga",
    bw: 2370,
    ga: 34,
    ohp: 110,
    expectWorkup: true,
    expectExceededCount: 1,
  },
];

const israelCases = [
  {
    name: "2370 g + 34 wk — repeat request row",
    bw: 2370,
    ga: 34,
    expectLabel: "≤2500 g and GA 32–36 wk",
    expectRepeatCutoff: 105,
    expectReferral: null,
  },
  {
    name: "3000 g + 38 wk — >2500 g row",
    bw: 3000,
    ga: 38,
    expectLabel: ">2500 g and GA >37 or unknown",
    expectRepeatCutoff: 35,
    expectReferral: 90,
  },
];

let failed = 0;

for (const c of table1Cases) {
  const row = findCah2018Row(c.stratification, c.bw, c.ga);
  const ok =
    row.rowLabel === c.expectLabel &&
    row.percentiles.length === c.expectPercentileCount;
  if (!ok) {
    failed++;
    console.error(`FAIL: ${c.name}`);
    console.error(
      `  expected: ${c.expectLabel} with ${c.expectPercentileCount} percentiles`,
    );
    console.error(
      `  got:      ${row.rowLabel} with ${row.percentiles.length} percentiles`,
    );
  } else {
    console.log(`OK: ${c.name} → ${row.rowLabel}`);
  }
}

for (const c of percentileCases) {
  const row = findCah2018Row(c.stratification, c.bw, c.ga);
  const insight = evaluatePercentileInsight(c.ohp, row);
  const ok =
    insight.recommendWorkup === c.expectWorkup &&
    insight.exceededCount === c.expectExceededCount;
  if (!ok) {
    failed++;
    console.error(`FAIL: ${c.name}`);
    console.error(
      `  expected workup=${c.expectWorkup}, exceeded=${c.expectExceededCount}`,
    );
    console.error(
      `  got workup=${insight.recommendWorkup}, exceeded=${insight.exceededCount}`,
    );
  } else {
    console.log(`OK: ${c.name}`);
  }
}

for (const c of israelCases) {
  const row = findCahIsraelRow(c.bw, c.ga);
  const ok =
    row.rowLabel === c.expectLabel &&
    row.repeatRequestCutoffNmol === c.expectRepeatCutoff &&
    row.firstSampleReferralCutoffNmol === c.expectReferral;
  if (!ok) {
    failed++;
    console.error(`FAIL: ${c.name}`);
  } else {
    console.log(`OK: ${c.name} → ${row.rowLabel}`);
  }
}

if (failed > 0) {
  process.exit(1);
}
console.log(
  `All ${table1Cases.length + percentileCases.length + israelCases.length} CAH lookup checks passed.`,
);
