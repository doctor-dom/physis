/**
 * Measure CDC chart axes from PNG grid geometry.
 *
 * Stature: split panel — ages 2–11 (left cm 80–165), ages 12–20 (right cm 150–195/185).
 * Weight: continuous panel — age top border, kg left/right (2–20 y).
 *
 * Run: node scripts/measure-cdc-grid.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { PNG } from "pngjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

const IMAGE_WIDTH = 10200;
const IMAGE_HEIGHT = 13200;
const SPLIT_AGE = 12;
const LEFT_AGE_SCAN_Y = 3375;
const RIGHT_AGE_SCAN_Y = 3125;

function readPng(filePath) {
  return PNG.sync.read(fs.readFileSync(filePath));
}

function isGridPixel(data, W, x, y) {
  const i = (W * y + x) << 2;
  const l = data[i] + data[i + 1] + data[i + 2];
  return l >= 180 && l <= 320;
}

function cluster(positions, gap = 4) {
  if (!positions.length) return [];
  const out = [];
  let start = positions[0];
  let prev = positions[0];
  for (let i = 1; i < positions.length; i++) {
    const p = positions[i];
    if (p - prev > gap) {
      out.push(Math.round((start + prev) / 2));
      start = p;
    }
    prev = p;
  }
  out.push(Math.round((start + prev) / 2));
  return out;
}

function horizontalGridLines(data, W, x, y0, y1) {
  const ys = [];
  for (let y = y0; y < y1; y++) {
    if (isGridPixel(data, W, x, y)) ys.push(y);
  }
  return cluster(ys);
}

function verticalGridLines(data, W, y, x0, x1) {
  const xs = [];
  for (let x = x0; x < x1; x++) {
    if (isGridPixel(data, W, x, y)) xs.push(x);
  }
  return cluster(xs);
}

function majorLines(lines, minGap = 95) {
  if (!lines.length) return [];
  const out = [lines[0]];
  for (let i = 1; i < lines.length; i++) {
    if (lines[i] - lines[i - 1] >= minGap) out.push(lines[i]);
  }
  return out;
}

function majorAgeCols(cols, minGap = 80) {
  if (!cols.length) return [];
  const out = [cols[0]];
  for (let i = 1; i < cols.length; i++) {
    if (cols[i] - cols[i - 1] >= minGap) out.push(cols[i]);
  }
  return out;
}

function cmAnchorsFromLines(lines, cmMin, cmMax) {
  return lines.map((y, i) => ({
    cm: cmMin + (i * (cmMax - cmMin)) / (lines.length - 1),
    y,
  }));
}

function buildWeightRegion(xLeft, xRight, yTop, yBottom) {
  return {
    left: xLeft / IMAGE_WIDTH,
    width: (xRight - xLeft) / IMAGE_WIDTH,
    yMaxTop: yTop / IMAGE_HEIGHT,
    yMinTop: yBottom / IMAGE_HEIGHT,
    xMin: 2,
    xMax: 20,
    yMin: 10,
    yMax: 105,
  };
}

function findWeightAgeAxis(data, W, panelTopY) {
  const PLOT_LEFT = 2464;
  let best = null;
  for (let offset = 50; offset <= 220; offset += 5) {
    const scanY = panelTopY + offset;
    const cols = majorAgeCols(verticalGridLines(data, W, scanY, 2300, 7900));
    if (cols.length < 19) continue;
    const score = Math.abs(cols[0] - PLOT_LEFT);
    if (!best || score < best.score) best = { score, cols, scanY };
  }
  if (!best) throw new Error(`Weight age axis not found near y=${panelTopY}`);
  return best.cols;
}

function splitPanels(allHorizontalLines) {
  const statureLines = allHorizontalLines.filter((y) => y >= 3200 && y <= 6590);
  const weightLines = allHorizontalLines.filter((y) => y >= 6590 && y <= 10100);
  if (statureLines.length < 2 || weightLines.length < 2) {
    throw new Error("Could not split stature/weight panels");
  }
  return { statureLines, weightLines };
}

function measureStatureAxes(data, W, rightCmMax) {
  const leftAgeCols = majorAgeCols(
    verticalGridLines(data, W, LEFT_AGE_SCAN_Y, 2400, 5100),
  );
  const rightAgeCols = majorAgeCols(
    verticalGridLines(data, W, RIGHT_AGE_SCAN_Y, 5100, 7800),
  );

  const leftCmLines = majorLines(
    horizontalGridLines(data, W, 3600, 3200, 4300),
    58,
  );
  const rightCmLines = majorLines(
    horizontalGridLines(data, W, 6500, 2860, 3220),
    40,
  );

  if (leftAgeCols.length !== 10) {
    console.warn(`  ⚠ Expected 10 left age columns, got ${leftAgeCols.length}`);
  }
  if (rightAgeCols.length !== 9) {
    console.warn(`  ⚠ Expected 9 right age columns, got ${rightAgeCols.length}`);
  }

  return {
    splitAge: SPLIT_AGE,
    left: {
      ageMin: 2,
      ageMax: 11,
      ageColumnsPx: leftAgeCols,
      cmMin: 80,
      cmMax: 165,
      cmAnchors: cmAnchorsFromLines(leftCmLines, 80, 165),
    },
    right: {
      ageMin: 12,
      ageMax: 20,
      ageColumnsPx: rightAgeCols,
      cmMin: 150,
      cmMax: rightCmMax,
      cmAnchors: cmAnchorsFromLines(rightCmLines, 150, rightCmMax),
    },
  };
}

function analyze(filePath, rightCmMax) {
  const png = readPng(filePath);
  const { width: W, height: H, data } = png;
  if (W !== IMAGE_WIDTH || H !== IMAGE_HEIGHT) {
    console.warn(`  ⚠ Expected ${IMAGE_WIDTH}×${IMAGE_HEIGHT}, got ${W}×${H}`);
  }

  console.log(`\n=== ${path.basename(filePath)} ===`);

  const allHoriz = horizontalGridLines(data, W, 5000, 3100, 10100);
  const { weightLines } = splitPanels(allHoriz);
  const yWeightMax = weightLines[0];
  const yWeightMin = weightLines.at(-1);
  const weightAge = findWeightAgeAxis(data, W, yWeightMax);

  const stature = measureStatureAxes(data, W, rightCmMax);

  console.log("Stature left age cols:", stature.left.ageColumnsPx.join(", "));
  console.log("Stature right age cols:", stature.right.ageColumnsPx.join(", "));
  console.log(
    `Stature left cm: ${stature.left.cmMin}–${stature.left.cmMax} (${stature.left.cmAnchors.length} anchors)`,
  );
  console.log(
    `Stature right cm: ${stature.right.cmMin}–${stature.right.cmMax} (${stature.right.cmAnchors.length} anchors)`,
  );
  console.log(
    `Weight age: x=${weightAge[0]} – x=${weightAge.at(-1)}; kg ${yWeightMax}–${yWeightMin}`,
  );

  return {
    endOfGrowthAgeYears: 20,
    stature,
    weight: buildWeightRegion(weightAge[0], weightAge.at(-1), yWeightMax, yWeightMin),
  };
}

const boys = analyze(
  path.join(root, "public", "cdc", "stature-weight-2-20-boys.png"),
  195,
);
const girls = analyze(
  path.join(root, "public", "cdc", "stature-weight-2-20-girls.png"),
  185,
);

console.log("\n=== Copy to chartManifest.ts ===");
console.log("BOYS:", JSON.stringify(boys, null, 2));
console.log("GIRLS:", JSON.stringify(girls, null, 2));
