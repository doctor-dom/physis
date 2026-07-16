/**
 * Verify CDC plotter against hand-marked landmark JSON.
 * Run: npm run test:cdc-landmark-plot
 *
 * Writes:
 *   scripts/output/cdc-landmark-plot-report.txt  (human-readable)
 *   scripts/output/cdc-landmark-plot-report.json (machine-readable)
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const outDir = path.join(__dirname, "output");
const CAL_VERSION = 5;

function readJson(p) {
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

function byCategory(landmarks, category) {
  return landmarks
    .filter((l) => l.category === category)
    .sort((a, b) => Number(a.value) - Number(b.value));
}

function buildFromLandmarks(data) {
  const { landmarks } = data;
  const statureLeftAge = byCategory(landmarks, "stature-left-age");
  const statureRightAge = byCategory(landmarks, "stature-right-age");
  const statureLeftCm = byCategory(landmarks, "stature-left-cm");
  const statureRightCm = byCategory(landmarks, "stature-right-cm");
  const weightAge = byCategory(landmarks, "weight-age");
  const weightLeftKg = byCategory(landmarks, "weight-left-kg");
  const weightRightKg = byCategory(landmarks, "weight-right-kg");

  return {
    stature: {
      splitAge: 12,
      left: {
        ageMin: Math.min(...statureLeftAge.map((p) => p.value)),
        ageMax: Math.max(...statureLeftAge.map((p) => p.value)),
        ageColumnsPx: statureLeftAge.map((p) => Math.round(p.x)),
        cmMin: Math.min(...statureLeftCm.map((p) => p.value)),
        cmMax: Math.max(...statureLeftCm.map((p) => p.value)),
        cmAnchors: statureLeftCm.map((p) => ({ cm: p.value, y: Math.round(p.y) })),
      },
      right: {
        ageMin: Math.min(...statureRightAge.map((p) => p.value)),
        ageMax: Math.max(...statureRightAge.map((p) => p.value)),
        ageColumnsPx: statureRightAge.map((p) => Math.round(p.x)),
        cmMin: Math.min(...statureRightCm.map((p) => p.value)),
        cmMax: Math.max(...statureRightCm.map((p) => p.value)),
        cmAnchors: statureRightCm.map((p) => ({ cm: p.value, y: Math.round(p.y) })),
      },
    },
    weight: {
      ageMin: Math.min(...weightAge.map((p) => p.value)),
      ageMax: Math.max(...weightAge.map((p) => p.value)),
      ageColumns: weightAge.map((p) => ({ age: p.value, x: Math.round(p.x) })),
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
    landmarks,
  };
}

function clamp(v, min, max) {
  return Math.min(max, Math.max(min, v));
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function valueToRowPx(anchors, value, key) {
  for (let i = 0; i < anchors.length - 1; i++) {
    const a = anchors[i];
    const b = anchors[i + 1];
    const aVal = a[key];
    const bVal = b[key];
    if (value >= aVal && value <= bVal) {
      const t = (value - aVal) / (bVal - aVal);
      return lerp(a.y, b.y, t);
    }
  }
  return anchors.at(-1).y;
}

function ageToColumnPx(segment, ageYears) {
  const age = clamp(ageYears, segment.ageMin, segment.ageMax);
  const cols = segment.ageColumnsPx;
  const t = (age - segment.ageMin) / (segment.ageMax - segment.ageMin);
  const f = t * (cols.length - 1);
  const i0 = Math.floor(f);
  const i1 = Math.min(i0 + 1, cols.length - 1);
  return lerp(cols[i0], cols[i1], f - i0);
}

function ageToWeightColumnPx(axes, ageYears) {
  const age = clamp(ageYears, axes.ageMin, axes.ageMax);
  const cols = axes.ageColumns;
  if (age <= cols[0].age) return cols[0].x;
  const last = cols.at(-1);
  if (age >= last.age) return last.x;
  for (let i = 0; i < cols.length - 1; i++) {
    const a = cols[i];
    const b = cols[i + 1];
    if (age >= a.age && age <= b.age) {
      const t = (age - a.age) / (b.age - a.age);
      return lerp(a.x, b.x, t);
    }
  }
  return last.x;
}

function cmSegmentForAgeAndHeight(axes, ageYears, heightCm) {
  if (ageYears >= axes.splitAge && heightCm >= axes.right.cmMin) return axes.right;
  return axes.left;
}

function dataToStaturePoint(axes, ageYears, heightCm) {
  const ageSegment = ageYears >= axes.splitAge ? axes.right : axes.left;
  const cmSegment = cmSegmentForAgeAndHeight(axes, ageYears, heightCm);
  return {
    x: ageToColumnPx(ageSegment, ageYears),
    y: valueToRowPx(cmSegment.cmAnchors, clamp(heightCm, cmSegment.cmMin, cmSegment.cmMax), "cm"),
    ageSegment: ageYears >= axes.splitAge ? "right" : "left",
    cmSegment: cmSegment === axes.right ? "right" : "left",
  };
}

function dataToWeightPoint(axes, ageYears, weightKg) {
  const kgSegment = weightKg >= axes.splitKg ? axes.right : axes.left;
  return {
    x: ageToWeightColumnPx(axes, ageYears),
    y: valueToRowPx(
      kgSegment.kgAnchors,
      clamp(weightKg, kgSegment.kgMin, kgSegment.kgMax),
      "kg",
    ),
    kgSegment: weightKg >= axes.splitKg ? "right" : "left",
  };
}

function near(a, b, tol = 3) {
  return Math.abs(a - b) <= tol;
}

function verifyLandmark(config, lm) {
  const { category, value, x: expX, y: expY } = lm;
  let plotted = null;
  let check = "";

  switch (category) {
    case "stature-left-age":
    case "stature-right-age": {
      const midCm = (config.stature.left.cmMin + config.stature.left.cmMax) / 2;
      plotted = dataToStaturePoint(config.stature, value, midCm);
      check = "x vs age column";
      return {
        category,
        value,
        expected: { x: expX, y: expY },
        plotted: { x: plotted.x, y: plotted.y },
        check,
        pass: near(plotted.x, expX),
        delta: { dx: plotted.x - expX, dy: plotted.y - expY },
        note: "Y not checked (age landmark only defines x column)",
      };
    }
    case "stature-left-cm":
    case "stature-right-cm": {
      const age = category.includes("left") ? 8 : 16;
      plotted = dataToStaturePoint(config.stature, age, value);
      check = "y vs cm scale";
      return {
        category,
        value,
        expected: { x: expX, y: expY },
        plotted: { x: plotted.x, y: plotted.y },
        check,
        pass: near(plotted.y, expY),
        delta: { dx: plotted.x - expX, dy: plotted.y - expY },
        note: "X not checked (cm landmark only defines y row; x varies where you clicked scale)",
      };
    }
    case "weight-age": {
      plotted = dataToWeightPoint(config.weight, value, 25);
      check = "x vs weight age column";
      return {
        category,
        value,
        expected: { x: expX, y: expY },
        plotted: { x: plotted.x, y: plotted.y },
        check,
        pass: near(plotted.x, expX),
        delta: { dx: plotted.x - expX, dy: plotted.y - expY },
        note: "Y not checked (age landmark only defines x column)",
      };
    }
    case "weight-left-kg":
    case "weight-right-kg": {
      plotted = dataToWeightPoint(config.weight, 12, value);
      check = "y vs kg scale";
      return {
        category,
        value,
        expected: { x: expX, y: expY },
        plotted: { x: plotted.x, y: plotted.y },
        check,
        pass: near(plotted.y, expY),
        delta: { dx: plotted.x - expX, dy: plotted.y - expY },
        note: "X not checked (kg landmark only defines y row; plot x comes from age column)",
      };
    }
    default:
      return { category, value, pass: true, note: "skipped" };
  }
}

const CLINICAL_CASES = [
  {
    label: "Height chron 12y 125cm",
    type: "stature",
    ageYears: 12,
    value: 125,
  },
  {
    label: "Height bone 10y 125cm",
    type: "stature",
    ageYears: 10,
    value: 125,
  },
  {
    label: "PAH 20y 161.4cm",
    type: "stature",
    ageYears: 20,
    value: 161.4,
  },
  {
    label: "MPS 20y 171cm",
    type: "stature",
    ageYears: 20,
    value: 171,
  },
  {
    label: "Weight chron 12y 35kg",
    type: "weight",
    ageYears: 12,
    value: 35,
  },
  {
    label: "Weight chron 12y 30kg",
    type: "weight",
    ageYears: 12,
    value: 30,
  },
  {
    label: "Weight chron 10y 32kg",
    type: "weight",
    ageYears: 10,
    value: 32,
  },
];

function formatPoint(p) {
  return `(${p.x.toFixed(1)}, ${p.y.toFixed(1)})`;
}

function main() {
  const landmarkPath = process.argv[2]
    ? path.resolve(process.argv[2])
    : path.join(root, "data", "cdc", "landmarks", "cdc-landmarks-boys.json");
  if (!fs.existsSync(landmarkPath)) {
    console.error(`Missing ${landmarkPath}`);
    process.exit(1);
  }

  const raw = readJson(landmarkPath);
  const config = buildFromLandmarks(raw);
  fs.mkdirSync(outDir, { recursive: true });

  const anchorResults = config.landmarks.map((lm) => verifyLandmark(config, lm));
  const anchorFails = anchorResults.filter((r) => r.pass === false);

  const clinicalResults = CLINICAL_CASES.map((c) => {
    const point =
      c.type === "stature"
        ? dataToStaturePoint(config.stature, c.ageYears, c.value)
        : dataToWeightPoint(config.weight, c.ageYears, c.value);
    return {
      label: c.label,
      input: { ageYears: c.ageYears, [c.type === "stature" ? "heightCm" : "weightKg"]: c.value },
      plotted: { x: +point.x.toFixed(2), y: +point.y.toFixed(2) },
      segment:
        c.type === "stature"
          ? { age: point.ageSegment, cm: point.cmSegment }
          : { kg: point.kgSegment },
    };
  });

  const lines = [];
  lines.push(`CDC landmark plot verification (cal v${CAL_VERSION})`);
  lines.push(`Source: ${landmarkPath}`);
  lines.push(`Marked: ${raw.markedAt ?? "unknown"}`);
  lines.push(`Landmarks: ${config.landmarks.length}`);
  lines.push("");

  lines.push("=== Anchor round-trip (plotter vs logged landmarks) ===");
  lines.push(
    "Age columns: verify plotted X. cm/kg scales: verify plotted Y only (X on scale line is not used for plotting).",
  );
  lines.push("");
  for (const r of anchorResults) {
    if (r.note === "skipped") continue;
    const status = r.pass ? "PASS" : "FAIL";
    lines.push(
      `[${status}] ${r.category} value=${r.value} | check ${r.check} | expected (${r.expected.x}, ${r.expected.y}) → plotted (${r.plotted.x.toFixed(1)}, ${r.plotted.y.toFixed(1)}) | Δ (${r.delta.dx.toFixed(1)}, ${r.delta.dy.toFixed(1)})`,
    );
    if (r.note) lines.push(`         ${r.note}`);
  }
  lines.push("");
  lines.push(
    `Anchor checks: ${anchorResults.filter((r) => r.pass !== false && r.note !== "skipped").length - anchorFails.length} passed, ${anchorFails.length} failed`,
  );
  lines.push("");

  lines.push("=== Clinical test points (verify on chart) ===");
  for (const c of clinicalResults) {
    lines.push(`${c.label}`);
    lines.push(`  input: ${JSON.stringify(c.input)}`);
    lines.push(`  segment: ${JSON.stringify(c.segment)}`);
    lines.push(`  plotted px: (${c.plotted.x}, ${c.plotted.y})`);
    lines.push("");
  }

  // Ordering sanity for user
  const h125 = clinicalResults.find((c) => c.label.includes("Height chron"));
  const pah = clinicalResults.find((c) => c.label.includes("PAH"));
  const mps = clinicalResults.find((c) => c.label.includes("MPS"));
  if (h125 && pah && mps) {
    lines.push("=== Height ordering (smaller y = higher on chart) ===");
    lines.push(`  125cm @ 12y: y=${h125.plotted.y}`);
    lines.push(`  PAH 161.4 @ 20y: y=${pah.plotted.y} (should be < ${h125.plotted.y})`);
    lines.push(`  MPS 171 @ 20y: y=${mps.plotted.y} (should be < ${pah.plotted.y})`);
    lines.push(
      `  PAH above current: ${pah.plotted.y < h125.plotted.y ? "YES" : "NO"}`,
    );
    lines.push(`  MPS above PAH: ${mps.plotted.y < pah.plotted.y ? "YES" : "NO"}`);
  }

  const report = {
    calVersion: CAL_VERSION,
    source: landmarkPath,
    markedAt: raw.markedAt,
    summary: {
      anchorPassed:
        anchorResults.filter((r) => r.pass !== false && r.note !== "skipped").length -
        anchorFails.length,
      anchorFailed: anchorFails.length,
      clinicalCases: clinicalResults.length,
    },
    anchorResults,
    clinicalResults,
  };

  const txtPath = path.join(
    outDir,
    `cdc-landmark-plot-report-${path.basename(landmarkPath, ".json").replace("cdc-landmarks-", "")}.txt`,
  );
  const jsonPath = path.join(
    outDir,
    `cdc-landmark-plot-report-${path.basename(landmarkPath, ".json").replace("cdc-landmarks-", "")}.json`,
  );
  fs.writeFileSync(txtPath, lines.join("\n"));
  fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2));

  console.log(lines.join("\n"));
  console.log(`\nWrote ${txtPath}`);
  console.log(`Wrote ${jsonPath}`);

  if (anchorFails.length) process.exit(1);
}

main();
