/**
 * Convert hand-marked CDC landmark JSON into chartManifest-ready coordinates.
 *
 * Usage:
 *   node scripts/apply-cdc-landmarks.mjs data/cdc/landmarks/cdc-landmarks-boys.json
 *   npm run apply:cdc-landmarks
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const landmarksDir = path.join(root, "data", "cdc", "landmarks");

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function byCategory(landmarks, category) {
  return landmarks
    .filter((l) => l.category === category)
    .sort((a, b) => Number(a.value) - Number(b.value));
}

function toAnchors(points, valueKey = "value") {
  return points.map((p) => ({ [valueKey === "value" ? "cm" : valueKey]: p[valueKey] ?? p.value, ...extractAnchor(p, valueKey) }));
}

function extractAnchor(p, key) {
  if (key === "kg") return { kg: p.value, y: p.y };
  if (key === "cm") return { cm: p.value, y: p.y };
  return { y: p.y };
}

function buildAgeColumnsPx(points) {
  const sorted = [...points].sort((a, b) => a.value - b.value);
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i].x < sorted[i - 1].x) {
      console.warn(
        `⚠ age ${sorted[i].value} (x=${sorted[i].x}) is left of age ${sorted[i - 1].value} (x=${sorted[i - 1].x}) — re-mark in landmark tool`,
      );
    }
  }
  return sorted.map((p) => Math.round(p.x));
}

function buildWeightAgeColumns(points) {
  const sorted = [...points].sort((a, b) => a.value - b.value);
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i].x < sorted[i - 1].x) {
      console.warn(
        `⚠ weight-age ${sorted[i].value} (x=${sorted[i].x}) is left of age ${sorted[i - 1].value} (x=${sorted[i - 1].x})`,
      );
    }
  }
  return sorted.map((p) => ({ age: p.value, x: Math.round(p.x) }));
}

function warnValueAxisOrder(points, label, valueKey = "value") {
  const sorted = [...points].sort((a, b) => a[valueKey] - b[valueKey]);
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i].y >= sorted[i - 1].y) {
      console.warn(
        `⚠ ${label} ${sorted[i][valueKey]} (y=${sorted[i].y}) is not above ${sorted[i - 1][valueKey]} (y=${sorted[i - 1].y}) on chart`,
      );
    }
  }
}

function buildFromLandmarks(data) {
  const { landmarks, filename, imageWidth, imageHeight } = data;
  const isBoys = filename.includes("boys");
  const rightCmMax = isBoys ? 195 : 185;

  const statureLeftAge = byCategory(landmarks, "stature-left-age");
  const statureRightAge = byCategory(landmarks, "stature-right-age");
  const statureLeftCm = byCategory(landmarks, "stature-left-cm");
  const statureRightCm = byCategory(landmarks, "stature-right-cm");
  const weightAge = byCategory(landmarks, "weight-age");
  const weightLeftKg = byCategory(landmarks, "weight-left-kg");
  const weightRightKg = byCategory(landmarks, "weight-right-kg");

  const missing = [];
  if (statureLeftAge.length < 2) missing.push("stature-left-age (need ≥2 ages)");
  if (statureRightAge.length < 2) missing.push("stature-right-age (need ≥2 ages)");
  if (statureLeftCm.length < 2) missing.push("stature-left-cm (need ≥2 heights)");
  if (statureRightCm.length < 2) missing.push("stature-right-cm (need ≥2 heights)");
  if (weightAge.length < 2) missing.push("weight-age (need ≥2 ages)");
  if (weightLeftKg.length < 2) missing.push("weight-left-kg (need ≥2 weights)");
  if (weightRightKg.length < 2) missing.push("weight-right-kg (need ≥2 weights)");
  if (missing.length) {
    console.warn("⚠ Incomplete landmark set:");
    missing.forEach((m) => console.warn(`  - ${m}`));
  }

  warnValueAxisOrder(statureLeftCm, "stature-left-cm");
  warnValueAxisOrder(statureRightCm, "stature-right-cm");
  warnValueAxisOrder(weightLeftKg, "weight-left-kg");
  warnValueAxisOrder(weightRightKg, "weight-right-kg");

  const config = {
    source: path.basename(data.__file ?? "landmarks.json"),
    imageWidth,
    imageHeight,
    endOfGrowthAgeYears: 20,
    stature: {
      splitAge: 12,
      left: {
        ageMin: Math.min(...statureLeftAge.map((p) => p.value)),
        ageMax: Math.max(...statureLeftAge.map((p) => p.value)),
        ageColumnsPx: buildAgeColumnsPx(statureLeftAge),
        cmMin: Math.min(...statureLeftCm.map((p) => p.value)),
        cmMax: Math.max(...statureLeftCm.map((p) => p.value)),
        cmAnchors: statureLeftCm.map((p) => ({ cm: p.value, y: Math.round(p.y) })),
      },
      right: {
        ageMin: Math.min(...statureRightAge.map((p) => p.value)),
        ageMax: Math.max(...statureRightAge.map((p) => p.value)),
        ageColumnsPx: buildAgeColumnsPx(statureRightAge),
        cmMin: Math.min(...statureRightCm.map((p) => p.value)),
        cmMax: Math.max(...statureRightCm.map((p) => p.value)),
        cmAnchors: statureRightCm.map((p) => ({ cm: p.value, y: Math.round(p.y) })),
      },
    },
    weight: {
      ageMin: Math.min(...weightAge.map((p) => p.value)),
      ageMax: Math.max(...weightAge.map((p) => p.value)),
      ageColumns: buildWeightAgeColumns(weightAge),
      splitKg: Math.min(...weightRightKg.map((p) => p.value)),
      left: {
        kgMin: Math.min(...weightLeftKg.map((p) => p.value)),
        kgMax: Math.max(...weightLeftKg.map((p) => p.value)),
        kgAnchors: weightLeftKg.map((p) => ({ kg: p.value, y: Math.round(p.y) })),
      },
      right: {
        kgMin: Math.min(...weightRightKg.map((p) => p.value)),
        kgMax: Math.max(...weightRightKg.map((p) => p.value)),
        kgAnchors: weightRightKg.map((p) => ({ kg: p.value, y: Math.round(p.y) })),
      },
    },
    verifyPoints: byCategory(landmarks, "verify-point"),
  };

  if (!statureRightCm.some((p) => p.value === rightCmMax)) {
    console.warn(`⚠ Consider marking stature-right-cm at ${rightCmMax} cm for ${isBoys ? "boys" : "girls"}.`);
  }

  return config;
}

function main() {
  const args = process.argv.slice(2);
  const files =
    args.length > 0
      ? args.map((f) => path.resolve(f))
      : fs.existsSync(landmarksDir)
        ? fs
            .readdirSync(landmarksDir)
            .filter((f) => f.endsWith(".json"))
            .map((f) => path.join(landmarksDir, f))
        : [];

  if (!files.length) {
    console.error(`No landmark files found. Save JSON to ${landmarksDir}/ or pass a path.`);
    process.exit(1);
  }

  fs.mkdirSync(landmarksDir, { recursive: true });
  const outDir = path.join(root, "scripts", "output");
  fs.mkdirSync(outDir, { recursive: true });

  for (const file of files) {
    const data = readJson(file);
    data.__file = file;
    const config = buildFromLandmarks(data);
    const slug = path.basename(file, ".json");
    const outPath = path.join(outDir, `${slug}-manifest.json`);
    fs.writeFileSync(outPath, JSON.stringify(config, null, 2));
    console.log(`\n✓ ${path.basename(file)} → ${outPath}`);
    console.log(JSON.stringify(config, null, 2));
    console.log(
      "\nNext: copy the stature/weight blocks into src/data/cdc/chartManifest.ts,",
    );
    console.log("      bump CDC_PLOT_CAL_VERSION, and run npm run test:cdc-calibration");
  }
}

main();
