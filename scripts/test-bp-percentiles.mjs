/**
 * QC checks for pediatric BP percentile lookup.
 * Run: node scripts/test-bp-percentiles.mjs
 */
import { readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

// Dynamic import of compiled logic via duplicated minimal functions for node test
const tablesPath = path.join(root, "src", "data", "bp", "tables.ts");
const ts = readFileSync(tablesPath, "utf8");
const match = ts.match(/export const bpAgeTables = (\[[\s\S]*?\]) as/);
if (!match) {
  console.error("Could not parse bpAgeTables");
  process.exit(1);
}
const bpAgeTables = JSON.parse(match[1]);
const HEIGHT_PCTS = [5, 10, 25, 50, 75, 90, 95];

function findRow(sex, ageYears) {
  return bpAgeTables.find((r) => r.sex === sex && r.ageYears === ageYears);
}

const boy10 = findRow("male", 10);
if (!boy10) throw new Error("missing boy age 10");

// At exactly 50th height percentile (141.3 cm), 50th SBP should be 100
const idx50 = 3;
if (boy10.sbpHeightsCm[idx50] !== 141.3) {
  console.error("Unexpected 50th height cm for boy 10");
  process.exit(1);
}
if (boy10.tiers.p50.sbp[idx50] !== 100) {
  console.error("Expected SBP 100 at 50th height for boy 10");
  process.exit(1);
}

console.log("OK: Boy age 10 table anchor values match PDF");

// Table count
const boys = bpAgeTables.filter((r) => r.sex === "male");
const girls = bpAgeTables.filter((r) => r.sex === "female");
if (boys.length !== 17 || girls.length !== 17) {
  console.error(`Expected 17 rows per sex, got ${boys.length}/${girls.length}`);
  process.exit(1);
}
console.log("OK: 17 age rows per sex");

console.log("All BP table checks passed.");
