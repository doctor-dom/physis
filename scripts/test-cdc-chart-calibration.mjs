/**
 * Validates CDC chartManifest plot fractions and coordinate mapping.
 * Run: node scripts/test-cdc-chart-calibration.mjs
 *
 * Writes scripts/output/cdc-calibration-test.svg for visual inspection.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { PNG } from "pngjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const cdcSrc = path.join(root, "data", "cdc");
const cdcPublic = path.join(root, "public", "cdc");
const outDir = path.join(__dirname, "output");

const CHART_IMAGE_WIDTH = 10200;
const CHART_IMAGE_HEIGHT = 13200;

const BOYS_CHART = {
  endOfGrowthAgeYears: 20,
  stature: {
    splitAge: 12,
    left: {
      ageMin: 2,
      ageMax: 11,
      ageColumnsPx: [2464, 2667, 3006, 3234, 3556, 3698, 4100, 4286, 4670, 4885],
      cmMin: 80,
      cmMax: 165,
      cmAnchors: [
        { cm: 80, y: 3203 },
        { cm: 89.44444444444444, y: 3301 },
        { cm: 98.88888888888889, y: 3459 },
        { cm: 108.33333333333333, y: 3575 },
        { cm: 117.77777777777777, y: 3689 },
        { cm: 127.22222222222223, y: 3803 },
        { cm: 136.66666666666666, y: 3919 },
        { cm: 146.11111111111111, y: 4033 },
        { cm: 155.55555555555554, y: 4152 },
        { cm: 165, y: 4270 },
      ],
    },
    right: {
      ageMin: 12,
      ageMax: 20,
      ageColumnsPx: [5302, 5529, 5770, 5993, 6227, 6458, 6694, 6923, 7161],
      cmMin: 150,
      cmMax: 195,
      cmAnchors: [
        { cm: 150, y: 3202 },
        { cm: 172.5, y: 3089 },
        { cm: 195, y: 2912 },
      ],
    },
  },
  weight: {
    left: 0.2415686274509804,
    width: 0.4922549019607843,
    yMaxTop: 0.5012121212121212,
    yMinTop: 0.7587121212121212,
    xMin: 2,
    xMax: 20,
    yMin: 10,
    yMax: 105,
  },
};

const GIRLS_CHART = {
  endOfGrowthAgeYears: 20,
  stature: {
    splitAge: 12,
    left: {
      ageMin: 2,
      ageMax: 11,
      ageColumnsPx: [2464, 2666, 3006, 3234, 3556, 3698, 4082, 4286, 4670, 4883],
      cmMin: 80,
      cmMax: 165,
      cmAnchors: [
        { cm: 80, y: 3204 },
        { cm: 89.44444444444444, y: 3303 },
        { cm: 98.88888888888889, y: 3459 },
        { cm: 108.33333333333333, y: 3577 },
        { cm: 117.77777777777777, y: 3691 },
        { cm: 127.22222222222223, y: 3803 },
        { cm: 136.66666666666666, y: 3921 },
        { cm: 146.11111111111111, y: 4035 },
        { cm: 155.55555555555554, y: 4154 },
        { cm: 165, y: 4272 },
      ],
    },
    right: {
      ageMin: 12,
      ageMax: 20,
      ageColumnsPx: [5302, 5529, 5770, 5993, 6227, 6458, 6694, 6923, 7162],
      cmMin: 150,
      cmMax: 185,
      cmAnchors: [
        { cm: 150, y: 3204 },
        { cm: 167.5, y: 3091 },
        { cm: 185, y: 2914 },
      ],
    },
  },
  weight: {
    left: 0.2415686274509804,
    width: 0.4922549019607843,
    yMaxTop: 0.5013636363636363,
    yMinTop: 0.7588636363636364,
    xMin: 2,
    xMax: 20,
    yMin: 10,
    yMax: 105,
  },
};

/** Anchor points that must land on a grid intersection (verified against PNG). */
const GRID_ANCHOR_TESTS = [
  { chart: BOYS_CHART, file: "stature-weight-2-20-boys.png", panel: "stature", age: 2, value: 80 },
  { chart: BOYS_CHART, file: "stature-weight-2-20-boys.png", panel: "stature", age: 11, value: 165 },
  { chart: BOYS_CHART, file: "stature-weight-2-20-boys.png", panel: "stature", age: 10.5, value: 138 },
  { chart: BOYS_CHART, file: "stature-weight-2-20-boys.png", panel: "stature", age: 12, value: 127 },
  { chart: BOYS_CHART, file: "stature-weight-2-20-boys.png", panel: "stature", age: 20, value: 195 },
  { chart: BOYS_CHART, file: "stature-weight-2-20-boys.png", panel: "weight", age: 10.5, value: 32 },
  { chart: BOYS_CHART, file: "stature-weight-2-20-boys.png", panel: "weight", age: 20, value: 105 },
  { chart: GIRLS_CHART, file: "stature-weight-2-20-girls.png", panel: "stature", age: 12, value: 127 },
  { chart: GIRLS_CHART, file: "stature-weight-2-20-girls.png", panel: "weight", age: 12, value: 45 },
];

const TEST_CASES = [
  {
    name: "Male — delayed bone age",
    sex: "male",
    chart: BOYS_CHART,
    filename: "stature-weight-2-20-boys.png",
    data: {
      chronAgeYears: 10.5,
      boneAgeYears: 8.0,
      heightCm: 138,
      weightKg: 32,
      parentalTargetCm: 175,
      parentalTargetLabel: "MPH",
    },
  },
  {
    name: "Male — advanced bone age",
    sex: "male",
    chart: BOYS_CHART,
    filename: "stature-weight-2-20-boys.png",
    data: {
      chronAgeYears: 10.5,
      boneAgeYears: 12.0,
      heightCm: 138,
      weightKg: 32,
      parentalTargetCm: 175,
      parentalTargetLabel: "MPH",
    },
  },
  {
    name: "Female — typical adolescent",
    sex: "female",
    chart: GIRLS_CHART,
    filename: "stature-weight-2-20-girls.png",
    data: {
      chronAgeYears: 12.0,
      boneAgeYears: 11.0,
      heightCm: 152,
      weightKg: 45,
      parentalTargetCm: 163,
      parentalTargetLabel: "MPS",
    },
  },
  {
    name: "Male — 12y short boy delayed bone age",
    sex: "male",
    chart: BOYS_CHART,
    filename: "stature-weight-2-20-boys.png",
    data: {
      chronAgeYears: 12.0,
      boneAgeYears: 10.0,
      heightCm: 125,
      weightKg: 30,
      parentalTargetCm: 171,
      parentalTargetLabel: "MPS",
      predictedAdultHeightCm: 161.4,
    },
  },
];

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function dataToStaturePoint(axes, ageYears, heightCm) {
  const ageSegment = ageYears >= axes.splitAge ? axes.right : axes.left;
  const cmSegment =
    ageYears >= axes.splitAge && heightCm >= axes.right.cmMin
      ? axes.right
      : axes.left;
  const age = clamp(ageYears, ageSegment.ageMin, ageSegment.ageMax);
  const cols = ageSegment.ageColumnsPx;
  const tAge = (age - ageSegment.ageMin) / (ageSegment.ageMax - ageSegment.ageMin);
  const f = tAge * (cols.length - 1);
  const i0 = Math.floor(f);
  const i1 = Math.min(i0 + 1, cols.length - 1);
  const x = lerp(cols[i0], cols[i1], f - i0);

  const cm = clamp(heightCm, cmSegment.cmMin, cmSegment.cmMax);
  const lookupCm =
    cmSegment.cmMax <= 170 ? cmSegment.cmMax + cmSegment.cmMin - cm : cm;
  const anchors = cmSegment.cmAnchors;
  let y = anchors[anchors.length - 1].y;
  for (let i = 0; i < anchors.length - 1; i++) {
    const a = anchors[i];
    const b = anchors[i + 1];
    if (lookupCm >= a.cm && lookupCm <= b.cm) {
      y = lerp(a.y, b.y, (lookupCm - a.cm) / (b.cm - a.cm));
      break;
    }
  }
  return { x, y };
}

function dataToPlotPoint(region, ageYears, value, imageWidth, imageHeight) {
  const plotLeft = region.left * imageWidth;
  const plotWidth = region.width * imageWidth;
  const yTop = region.yMaxTop * imageHeight;
  const yBottom = region.yMinTop * imageHeight;

  const ageClamped = clamp(ageYears, region.xMin, region.xMax);
  const valueClamped = clamp(value, region.yMin, region.yMax);

  const xFrac = (ageClamped - region.xMin) / (region.xMax - region.xMin);
  const yFrac = (valueClamped - region.yMin) / (region.yMax - region.yMin);

  return {
    x: plotLeft + xFrac * plotWidth,
    y: yTop + (1 - yFrac) * (yBottom - yTop),
    plotLeft,
    plotTop: yTop,
    plotWidth,
    plotHeight: yBottom - yTop,
  };
}

function statureSegmentBox(segment) {
  const xs = segment.ageColumnsPx;
  const ys = segment.cmAnchors.map((a) => a.y);
  return {
    x: Math.min(...xs),
    y: Math.min(...ys),
    width: Math.max(...xs) - Math.min(...xs),
    height: Math.max(...ys) - Math.min(...ys),
  };
}

function staturePanelBox(axes) {
  const left = statureSegmentBox(axes.left);
  const right = statureSegmentBox(axes.right);
  const x0 = Math.min(left.x, right.x);
  const x1 = Math.max(left.x + left.width, right.x + right.width);
  const y0 = Math.min(left.y, right.y);
  const y1 = Math.max(left.y + left.height, right.y + right.height);
  return { x: x0, y: y0, width: x1 - x0, height: y1 - y0 };
}

function pointInStaturePanel(point, axes, tolerance = 2) {
  return pointInBox(point, staturePanelBox(axes), tolerance);
}

function plotRegionBox(region, w, h) {
  return {
    x: region.left * w,
    y: region.yMaxTop * h,
    width: region.width * w,
    height: (region.yMinTop - region.yMaxTop) * h,
  };
}

function pointInBox(point, box, tolerance = 0.5) {
  return (
    point.x >= box.x - tolerance &&
    point.x <= box.x + box.width + tolerance &&
    point.y >= box.y - tolerance &&
    point.y <= box.y + box.height + tolerance
  );
}

function readPngDimensions(filePath) {
  const buf = fs.readFileSync(filePath);
  if (buf.toString("ascii", 1, 4) !== "PNG") {
    throw new Error(`Not a PNG: ${filePath}`);
  }
  return {
    width: buf.readUInt32BE(16),
    height: buf.readUInt32BE(20),
  };
}

function nearGridPixel(gridFn, x, y, radius = 9) {
  for (let dy = -radius; dy <= radius; dy += 3) {
    for (let dx = -radius; dx <= radius; dx += 3) {
      if (gridFn(x + dx, y + dy)) return true;
    }
  }
  return false;
}

function loadPngGridChecker(filePath) {
  const png = PNG.sync.read(fs.readFileSync(filePath));
  const { width: W, height: H, data } = png;
  return (x, y) => {
    if (x < 0 || y < 0 || x >= W || y >= H) return false;
    const i = (W * y + x) << 2;
    const l = data[i] + data[i + 1] + data[i + 2];
    return l >= 180 && l <= 320;
  };
}

function runGridAnchorTests() {
  console.log("\nGrid anchor alignment (PNG pixel check):");
  const cache = new Map();

  for (const t of GRID_ANCHOR_TESTS) {
    const imagePath = findChartImage(t.file);
    if (!imagePath) {
      console.log(`  ⚠ skip ${t.panel} ${t.age}y ${t.value} — PNG missing`);
      continue;
    }
    if (!cache.has(t.file)) {
      cache.set(t.file, loadPngGridChecker(imagePath));
    }
    const isGrid = cache.get(t.file);
    const pt =
      t.panel === "stature"
        ? dataToStaturePoint(t.chart.stature, t.age, t.value)
        : dataToPlotPoint(t.chart.weight, t.age, t.value, CHART_IMAGE_WIDTH, CHART_IMAGE_HEIGHT);
    const x = Math.round(pt.x);
    const y = Math.round(pt.y);
    const onGrid = nearGridPixel(
      isGrid,
      x,
      y,
      t.panel === "stature" ? 16 : 9,
    );
    assert(
      `${t.panel} (${t.age} y, ${t.value}) → grid`,
      onGrid,
      `(${x}, ${y})`,
    );
  }
}

function findChartImage(filename) {
  for (const dir of [cdcPublic, cdcSrc]) {
    const filePath = path.join(dir, filename);
    if (fs.existsSync(filePath)) return filePath;
  }
  return null;
}

function plotPoints(chart, data, w, h) {
  return {
    heightChron: dataToStaturePoint(chart.stature, data.chronAgeYears, data.heightCm),
    heightBone: dataToStaturePoint(chart.stature, data.boneAgeYears, data.heightCm),
    weightChron: dataToPlotPoint(chart.weight, data.chronAgeYears, data.weightKg, w, h),
    parentalStar: dataToStaturePoint(
      chart.stature,
      chart.endOfGrowthAgeYears,
      data.parentalTargetCm,
    ),
  };
}

function assert(name, condition, detail = "") {
  if (!condition) {
    throw new Error(`FAIL: ${name}${detail ? ` — ${detail}` : ""}`);
  }
  console.log(`  ✓ ${name}`);
}

function runCornerTests(chart, label) {
  console.log(`\nCorner mapping (${label}):`);
  const w = CHART_IMAGE_WIDTH;
  const h = CHART_IMAGE_HEIGHT;
  const weightBox = plotRegionBox(chart.weight, w, h);

  const bl = dataToStaturePoint(chart.stature, 2, 80);
  assert(
    "stature left bottom (age 2, 80 cm)",
    Math.abs(bl.x - 2464) < 2 && Math.abs(bl.y - 4270) < 4,
    `got (${bl.x.toFixed(1)}, ${bl.y.toFixed(1)})`,
  );

  const leftTop = dataToStaturePoint(chart.stature, 11, 165);
  const leftTopY = chart.stature.left.cmAnchors[0].y;
  assert(
    "stature left top (age 11, 165 cm)",
    Math.abs(leftTop.x - chart.stature.left.ageColumnsPx.at(-1)) < 2 &&
      Math.abs(leftTop.y - leftTopY) < 4,
    `got (${leftTop.x.toFixed(1)}, ${leftTop.y.toFixed(1)})`,
  );

  const rightBl = dataToStaturePoint(chart.stature, 12, 127);
  assert(
    "stature age 12 / 127 cm uses right age column and left cm scale",
    Math.abs(rightBl.x - chart.stature.right.ageColumnsPx[0]) < 2 &&
      rightBl.y > 3650 &&
      rightBl.y < 3850,
    `got (${rightBl.x.toFixed(1)}, ${rightBl.y.toFixed(1)})`,
  );

  const rightTr = dataToStaturePoint(
    chart.stature,
    20,
    chart.stature.right.cmMax,
  );
  const rightTopY = chart.stature.right.cmAnchors.at(-1).y;
  assert(
    "stature right top (age 20, max cm)",
    Math.abs(rightTr.x - chart.stature.right.ageColumnsPx.at(-1)) < 2 &&
      Math.abs(rightTr.y - rightTopY) < 6,
    `got (${rightTr.x.toFixed(1)}, ${rightTr.y.toFixed(1)})`,
  );

  const wBl = dataToPlotPoint(chart.weight, chart.weight.xMin, chart.weight.yMin, w, h);
  assert(
    "weight bottom-left corner inside weight panel",
    pointInBox(wBl, weightBox),
    `(${wBl.x.toFixed(1)}, ${wBl.y.toFixed(1)})`,
  );
}

function runCaseTests(testCase) {
  console.log(`\nCase: ${testCase.name}`);
  const w = CHART_IMAGE_WIDTH;
  const h = CHART_IMAGE_HEIGHT;
  const { chart, data } = testCase;
  const points = plotPoints(chart, data, w, h);
  const weightBox = plotRegionBox(chart.weight, w, h);

  assert(
    "height chron point inside stature panel",
    pointInStaturePanel(points.heightChron, chart.stature),
    `(${points.heightChron.x.toFixed(1)}, ${points.heightChron.y.toFixed(1)})`,
  );
  assert(
    "height bone point inside stature panel",
    pointInStaturePanel(points.heightBone, chart.stature),
    `(${points.heightBone.x.toFixed(1)}, ${points.heightBone.y.toFixed(1)})`,
  );
  assert(
    "weight chron point inside weight panel",
    pointInBox(points.weightChron, weightBox),
    `(${points.weightChron.x.toFixed(1)}, ${points.weightChron.y.toFixed(1)})`,
  );
  assert(
    "parental star inside stature panel",
    pointInStaturePanel(points.parentalStar, chart.stature),
    `(${points.parentalStar.x.toFixed(1)}, ${points.parentalStar.y.toFixed(1)})`,
  );

  const chronCmSegment =
    data.chronAgeYears >= chart.stature.splitAge &&
    data.heightCm >= chart.stature.right.cmMin
      ? "right"
      : "left";
  const boneCmSegment =
    data.boneAgeYears >= chart.stature.splitAge &&
    data.heightCm >= chart.stature.right.cmMin
      ? "right"
      : "left";

  if (chronCmSegment === boneCmSegment) {
    assert(
      "bone-age height shares Y with chronologic height (horizontal shift)",
      Math.abs(points.heightChron.y - points.heightBone.y) < 0.001,
      `Δy=${Math.abs(points.heightChron.y - points.heightBone.y).toFixed(4)}`,
    );
  } else {
    console.log(
      "  ↷ skip horizontal bone-age Y check (chron and bone age use different cm scales)",
    );
  }
  assert(
    "bone-age X differs from chronologic X when ages differ",
    Math.abs(points.heightChron.x - points.heightBone.x) > 1,
    `Δx=${Math.abs(points.heightChron.x - points.heightBone.x).toFixed(1)} px`,
  );
  assert(
    "parental star at age 20 column",
    Math.abs(points.parentalStar.x - chart.stature.right.ageColumnsPx.at(-1)) < 2,
    `x=${points.parentalStar.x.toFixed(1)}`,
  );

  if (data.predictedAdultHeightCm != null) {
    const predictedAdult = dataToStaturePoint(
      chart.stature,
      chart.endOfGrowthAgeYears,
      data.predictedAdultHeightCm,
    );
    assert(
      "predicted adult higher on chart than current height when PAH > height",
      data.predictedAdultHeightCm > data.heightCm
        ? predictedAdult.y < points.heightChron.y
        : predictedAdult.y > points.heightChron.y,
      `PAH y=${predictedAdult.y.toFixed(1)} chron y=${points.heightChron.y.toFixed(1)}`,
    );
    assert(
      "parental target higher on chart than PAH when MPS > PAH",
      data.parentalTargetCm > data.predictedAdultHeightCm
        ? points.parentalStar.y < predictedAdult.y
        : points.parentalStar.y > predictedAdult.y,
      `MPS y=${points.parentalStar.y.toFixed(1)} PAH y=${predictedAdult.y.toFixed(1)}`,
    );
  }

  console.log("  Coordinates:");
  console.log(
    `    height chron (${data.chronAgeYears} y, ${data.heightCm} cm): (${points.heightChron.x.toFixed(1)}, ${points.heightChron.y.toFixed(1)})`,
  );
  console.log(
    `    height bone  (${data.boneAgeYears} y, ${data.heightCm} cm): (${points.heightBone.x.toFixed(1)}, ${points.heightBone.y.toFixed(1)})`,
  );
  console.log(
    `    weight chron (${data.chronAgeYears} y, ${data.weightKg} kg): (${points.weightChron.x.toFixed(1)}, ${points.weightChron.y.toFixed(1)})`,
  );
  console.log(
    `    ${data.parentalTargetLabel} star (20 y, ${data.parentalTargetCm} cm): (${points.parentalStar.x.toFixed(1)}, ${points.parentalStar.y.toFixed(1)})`,
  );

  return points;
}

function svgRect(box, stroke, fill = "none", dash = "") {
  return `<rect x="${box.x}" y="${box.y}" width="${box.width}" height="${box.height}" fill="${fill}" stroke="${stroke}" stroke-width="2" ${dash ? `stroke-dasharray="${dash}"` : ""}/>`;
}

function svgCircle(point, fill, r = 8, label = "") {
  return `<circle cx="${point.x.toFixed(1)}" cy="${point.y.toFixed(1)}" r="${r}" fill="${fill}" stroke="#fff" stroke-width="2"/>
  ${label ? `<text x="${(point.x + 12).toFixed(1)}" y="${(point.y + 4).toFixed(1)}" font-size="14" fill="#111">${label}</text>` : ""}`;
}

function buildCalibrationSvg(testCase, points, imagePath, imageDims, imageHref) {
  const w = CHART_IMAGE_WIDTH;
  const h = CHART_IMAGE_HEIGHT;
  const { chart, data } = testCase;
  const leftBox = statureSegmentBox(chart.stature.left);
  const rightBox = statureSegmentBox(chart.stature.right);
  const weightBox = plotRegionBox(chart.weight, w, h);

  const imageTag = imageHref
    ? `<image href="${imageHref}" x="0" y="0" width="${w}" height="${h}"/>`
    : `<rect x="0" y="0" width="${w}" height="${h}" fill="#f8fafc"/>
       <text x="400" y="600" font-size="120" fill="#64748b">No CDC PNG — showing plot regions only</text>`;

  const gridLines = [];
  for (const age of [2, 10, 20]) {
    const p = dataToPlotPoint(chart.weight, age, chart.weight.yMin, w, h);
    const pTop = dataToPlotPoint(chart.weight, age, chart.weight.yMax, w, h);
    gridLines.push(
      `<line x1="${p.x.toFixed(1)}" y1="${weightBox.y}" x2="${p.x.toFixed(1)}" y2="${(weightBox.y + weightBox.height).toFixed(1)}" stroke="#22c55e" stroke-width="1" opacity="0.35"/>`,
    );
    gridLines.push(
      `<text x="${(p.x - 8).toFixed(1)}" y="${(weightBox.y + weightBox.height + 18).toFixed(1)}" font-size="12" fill="#22c55e">${age}y</text>`,
    );
    gridLines.push(
      `<text x="${(weightBox.x - 36).toFixed(1)}" y="${(p.y - 4).toFixed(1)}" font-size="11" fill="#22c55e">${chart.weight.yMin}</text>`,
    );
    gridLines.push(
      `<text x="${(weightBox.x - 36).toFixed(1)}" y="${(pTop.y + 4).toFixed(1)}" font-size="11" fill="#22c55e">${chart.weight.yMax}</text>`,
    );
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
  ${imageTag}
  ${svgRect(leftBox, "#0284c7", "rgba(14,165,233,0.08)")}
  ${svgRect(rightBox, "#0369a1", "rgba(3,105,161,0.08)", "8 6")}
  ${svgRect(weightBox, "#16a34a", "rgba(34,197,94,0.08)")}
  ${gridLines.join("\n  ")}
  <line x1="${points.heightChron.x.toFixed(1)}" y1="${points.heightChron.y.toFixed(1)}" x2="${points.heightBone.x.toFixed(1)}" y2="${points.heightBone.y.toFixed(1)}" stroke="#c2410c" stroke-width="3" marker-end="url(#arrow)"/>
  <defs><marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><polygon points="0,0 8,4 0,8" fill="#c2410c"/></marker></defs>
  ${svgCircle(points.heightChron, "#2563eb", 9, "H chron")}
  ${svgCircle(points.heightBone, "#ea580c", 9, "H bone")}
  ${svgCircle(points.weightChron, "#2563eb", 9, "Wt")}
  ${svgCircle(points.parentalStar, "#f59e0b", 10, data.parentalTargetLabel)}
  <text x="400" y="${h - 180}" font-size="120" fill="#334155">${testCase.name}${imageDims ? ` | PNG ${imageDims.width}×${imageDims.height}` : ""}</text>
</svg>`;
}

function main() {
  console.log("CDC chartManifest calibration test\n");
  console.log(`Assumed viewBox: ${CHART_IMAGE_WIDTH}×${CHART_IMAGE_HEIGHT}`);

  runCornerTests(BOYS_CHART, "boys");
  runCornerTests(GIRLS_CHART, "girls");
  runGridAnchorTests();

  fs.mkdirSync(outDir, { recursive: true });

  for (const testCase of TEST_CASES) {
    const points = runCaseTests(testCase);
    const imagePath = findChartImage(testCase.filename);
    let imageDims = null;
    if (imagePath) {
      imageDims = readPngDimensions(imagePath);
      console.log(`  PNG found: ${imagePath} (${imageDims.width}×${imageDims.height})`);
      if (
        imageDims.width !== CHART_IMAGE_WIDTH ||
        imageDims.height !== CHART_IMAGE_HEIGHT
      ) {
        console.warn(
          `  ⚠ PNG dimensions differ from CHART_IMAGE_WIDTH/HEIGHT — overlay may misalign until dimensions match or viewBox is updated.`,
        );
      } else {
        console.log("  ✓ PNG dimensions match assumed viewBox");
      }
    } else {
      console.log(`  ⚠ PNG missing: ${testCase.filename} (grid-only SVG)`);
    }

    const slug = testCase.sex + "-" + testCase.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const outPath = path.join(outDir, `cdc-calibration-${slug}.svg`);
    const publicHref = imagePath ? `/cdc/${testCase.filename}` : null;
    fs.writeFileSync(
      outPath,
      buildCalibrationSvg(testCase, points, imagePath, imageDims, publicHref),
    );
    console.log(`  Wrote ${outPath}`);
  }

  console.log("\nAll coordinate tests passed.");
  console.log("Open scripts/output/cdc-calibration-*.svg in a browser to visually check plot fractions.");
  if (!findChartImage(TEST_CASES[0].filename)) {
    console.log("\nTo test against real charts, add PNGs to data/cdc/ and run npm run import:data.");
  }
}

try {
  main();
} catch (err) {
  console.error(`\n${err.message}`);
  process.exit(1);
}
