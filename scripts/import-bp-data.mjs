/**
 * Parse AAP 2017 BP tables (Table 4 boys, Table 5 girls) from BP-data.pdf into CSV.
 * Run: node scripts/import-bp-data.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { PDFParse } from "pdf-parse";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const pdfPath = path.join(root, "data", "excel", "BP-data.pdf");
const csvPath = path.join(root, "data", "excel", "BP-data.csv");
const outTs = path.join(root, "src", "data", "bp", "tables.ts");

const HEIGHT_PCTS = [5, 10, 25, 50, 75, 90, 95];
const BP_TIERS = ["p50", "p90", "p95", "p95plus12"];
const BP_TIER_LABELS = {
  p50: "50th",
  p90: "90th",
  p95: "95th",
  p95plus12: "95th + 12 mm Hg",
};

function parseNumbers(line) {
  return line
    .split(/\t+/)
    .slice(1)
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => parseFloat(s.replace(/[^\d.+-]/g, "")))
    .filter((n) => !Number.isNaN(n));
}

function parseSection(text, sex) {
  const rows = [];
  const lines = text.split(/\r?\n/);
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const ageMatch = line.match(/^(\d{1,2})\s+Height \(in\)/);
    if (!ageMatch) {
      i++;
      continue;
    }
    const ageYears = parseInt(ageMatch[1], 10);
    const heightIn = parseNumbers(line);
    i++;
    if (i >= lines.length || !lines[i].includes("Height (cm)")) {
      throw new Error(`Expected Height (cm) after age ${ageYears} for ${sex}`);
    }
    const heightCm = parseNumbers(lines[i]);
    i++;

    const sbpHeightsCm = heightCm.slice(0, 7);
    const dbpHeightsCm = heightCm.slice(7, 14);
    const sbpHeightsIn = heightIn.slice(0, 7);
    const dbpHeightsIn = heightIn.slice(7, 14);

    const tiers = {};
    for (const tierKey of BP_TIERS) {
      if (i >= lines.length) throw new Error(`Missing tier ${tierKey} for age ${ageYears}`);
      let tierLine = lines[i];
      if (tierKey === "p50" && !tierLine.includes("50th")) {
        throw new Error(`Expected 50th row at age ${ageYears}, got: ${tierLine.slice(0, 40)}`);
      }
      if (tierKey === "p90" && !tierLine.includes("90th")) tierLine = lines[i];
      if (tierKey === "p95" && tierKey !== "p95plus12" && tierLine.includes("95th +")) {
        throw new Error(`Expected 95th row at age ${ageYears}`);
      }

      const labelMap = {
        p50: "50th",
        p90: "90th",
        p95: /^95th\s+(?!\+)/,
        p95plus12: "95th + 12",
      };

      while (i < lines.length) {
        tierLine = lines[i];
        const ok =
          tierKey === "p50"
            ? tierLine.includes("50th") && !tierLine.includes("90th")
            : tierKey === "p90"
              ? tierLine.includes("90th")
              : tierKey === "p95"
                ? /\b95th\b/.test(tierLine) && !tierLine.includes("+ 12")
                : tierLine.includes("95th + 12");
        if (ok) break;
        i++;
      }
      if (i >= lines.length) throw new Error(`Tier ${tierKey} not found for age ${ageYears}`);

      const nums = parseNumbers(tierLine);
      tiers[tierKey] = {
        sbp: nums.slice(0, 7),
        dbp: nums.slice(7, 14),
      };
      i++;
    }

    rows.push({
      sex,
      ageYears,
      sbpHeightsCm,
      dbpHeightsCm,
      sbpHeightsIn,
      dbpHeightsIn,
      tiers,
    });
  }
  return rows;
}

function extractSections(fullText) {
  const girlsIdx = fullText.indexOf("TABLE 5 BP Levels for Girls");
  const boysIdx = fullText.indexOf("TABLE 4 BP Levels for Boys");
  if (boysIdx < 0 || girlsIdx < 0) {
    throw new Error("Could not locate Table 4/5 in BP-data.pdf");
  }
  const boysText = fullText.slice(boysIdx, girlsIdx);
  const girlsText = fullText.slice(girlsIdx);
  return {
    boys: parseSection(boysText, "male"),
    girls: parseSection(girlsText, "female"),
  };
}

function writeCsv(allRows) {
  const header = [
    "sex",
    "age_years",
    "height_pct",
    "height_cm_sbp",
    "height_cm_dbp",
    "height_in_sbp",
    "height_in_dbp",
    "sbp_p50",
    "sbp_p90",
    "sbp_p95",
    "sbp_p95plus12",
    "dbp_p50",
    "dbp_p90",
    "dbp_p95",
    "dbp_p95plus12",
  ].join(",");
  const lines = [header];
  for (const row of allRows) {
    for (let h = 0; h < HEIGHT_PCTS.length; h++) {
      lines.push(
        [
          row.sex,
          row.ageYears,
          HEIGHT_PCTS[h],
          row.sbpHeightsCm[h],
          row.dbpHeightsCm[h],
          row.sbpHeightsIn[h],
          row.dbpHeightsIn[h],
          row.tiers.p50.sbp[h],
          row.tiers.p90.sbp[h],
          row.tiers.p95.sbp[h],
          row.tiers.p95plus12.sbp[h],
          row.tiers.p50.dbp[h],
          row.tiers.p90.dbp[h],
          row.tiers.p95.dbp[h],
          row.tiers.p95plus12.dbp[h],
        ].join(","),
      );
    }
  }
  fs.writeFileSync(csvPath, lines.join("\n") + "\n");
}

function writeTs(allRows) {
  fs.mkdirSync(path.dirname(outTs), { recursive: true });
  const content = `/** Auto-generated from data/excel/BP-data.pdf — run node scripts/import-bp-data.mjs */

export const BP_HEIGHT_PERCENTILES = [5, 10, 25, 50, 75, 90, 95] as const;
export type BpHeightPercentile = (typeof BP_HEIGHT_PERCENTILES)[number];

export type BpSex = "male" | "female";
export type BpTierKey = "p50" | "p90" | "p95" | "p95plus12";

export interface BpTierValues {
  sbp: number[];
  dbp: number[];
}

export interface BpAgeTableRow {
  sex: BpSex;
  ageYears: number;
  sbpHeightsCm: number[];
  dbpHeightsCm: number[];
  sbpHeightsIn: number[];
  dbpHeightsIn: number[];
  tiers: Record<BpTierKey, BpTierValues>;
}

export const bpAgeTables = ${JSON.stringify(allRows, null, 2)} as BpAgeTableRow[];

export const BP_TIER_LABELS: Record<BpTierKey, string> = ${JSON.stringify(BP_TIER_LABELS, null, 2)};

export const BP_DATA_CITATION =
  "Flynn JT, Kaelber DC, Baker-Smith CM, et al. Clinical Practice Guideline for Screening and Management of High Blood Pressure in Children and Adolescents. Pediatrics. 2017;140(3):e20171904. doi:10.1542/peds.2017-1904";
`;
  fs.writeFileSync(outTs, content);
}

const buffer = fs.readFileSync(pdfPath);
const parser = new PDFParse({ data: buffer });
const { text } = await parser.getText();
await parser.destroy();

const { boys, girls } = extractSections(text);
const allRows = [...boys, ...girls].sort(
  (a, b) => a.sex.localeCompare(b.sex) || a.ageYears - b.ageYears,
);

if (boys.length !== 17 || girls.length !== 17) {
  throw new Error(`Expected 17 ages per sex, got boys=${boys.length}, girls=${girls.length}`);
}

writeCsv(allRows);
writeTs(allRows);
console.log(`Wrote ${csvPath} (${allRows.length} age×height rows source blocks)`);
console.log(`Wrote ${outTs}`);
