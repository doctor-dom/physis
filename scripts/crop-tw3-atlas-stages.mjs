/**
 * Crops TW3 composite atlas panels into per-stage reference + description PNGs.
 * Output: data/atlas/stages/{landmark_id}/{RATING}.png and {RATING}-desc.png
 * Run: node scripts/crop-tw3-atlas-stages.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { PNG } from "pngjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const atlasRoot = fs.existsSync(path.join(root, "data", "atlas"))
  ? path.join(root, "data", "atlas")
  : path.join(root, "public", "atlas");
const stagesOut = path.join(root, "data", "atlas", "stages");
const manifestOut = path.join(root, "src", "data", "tw3", "atlasStageManifest.ts");
const publicStagesOut = path.join(root, "public", "atlas", "stages");

const RATING_PANEL_INDEX = {
  A: -1,
  B: 0,
  C: 0,
  D: 0,
  E: 0,
  F: 1,
  G: 1,
  H: 1,
  I: 1,
};

const RATING_STAGE_INDEX = {
  A: -1,
  B: 0,
  C: 1,
  D: 2,
  E: 3,
  F: 0,
  G: 1,
  H: 2,
  I: 3,
};

/** Ratings with no atlas drawing (handled separately in UI). */
const SKIP_RATINGS = {
  ulna: new Set(["I"]),
};

/**
 * Measured horizontal anchor positions (0–1 within panel) from source PNGs.
 * Crop bounds = midpoints between adjacent anchors, with outer padding on ends.
 */
const PANEL_ANCHOR_X = {
  ulna: {
    0: { B: 0.04, C: 0.312, D: 0.556, E: 0.87 },
    1: { F: 0.051, G: 0.443, H: 0.836 },
  },
};

const LANDMARK_PANELS = {
  radius: {
    reference: ["radius image.png", "radius2 image.png"],
    description: ["radius description.png", "radius2 description.png"],
  },
  ulna: {
    reference: ["ulna image.png", "ulna2 image.png"],
    description: ["ulna description.png", "ulna2 description.png"],
  },
  metacarpal_1: {
    reference: ["1st metacarpal image.png", "1st metacarpal2 image.png"],
    description: ["1st metacarpal description.png", "1st metacarpal2 description.png"],
  },
  metacarpal_3: {
    reference: ["3rd 5th metacarpal image.png", "3rd 5th metacarpal2 image.png"],
    description: ["3rd 5th metacarpal description.png", "3rd 5th metacarpal2 description.png"],
  },
  metacarpal_5: {
    reference: ["3rd 5th metacarpal image.png", "3rd 5th metacarpal2 image.png"],
    description: ["3rd 5th metacarpal description.png", "3rd 5th metacarpal2 description.png"],
  },
  proximal_phalanx_1: {
    reference: ["proximal thumb image.png", "proximal thumb2 description.png"],
    description: ["proximal thumb description.png", "proximal thumb2 image.png"],
  },
  proximal_phalanx_3: {
    reference: ["3rd 5th proximal image.png", "3rd 5th proximal2 image.png"],
    description: ["3rd 5th proximal description.png", "3rd 5th proximal2 description.png"],
  },
  proximal_phalanx_5: {
    reference: ["3rd 5th proximal image.png", "3rd 5th proximal2 image.png"],
    description: ["3rd 5th proximal description.png", "3rd 5th proximal2 description.png"],
  },
  middle_phalanx_3: {
    reference: ["3rd 5th medial image.png", "3rd 5th medial2 image.png"],
    description: ["3rd 5th medial description.png", "3rd 5th medial2 description.png"],
  },
  middle_phalanx_5: {
    reference: ["3rd 5th medial image.png", "3rd 5th medial2 image.png"],
    description: ["3rd 5th medial description.png", "3rd 5th medial2 description.png"],
  },
  distal_phalanx_1: {
    reference: ["distal thumb image.png", "distal thumb2 image.png"],
    description: ["distal thumb description.png", "distal thumb2 description.png"],
  },
  distal_phalanx_3: {
    reference: ["3rd 5th distal image.png", "3rd 5th distal2 image.png"],
    description: ["3rd 5th distal description.png", "3rd 5th distal2 description.png"],
  },
  distal_phalanx_5: {
    reference: ["3rd 5th distal image.png", "3rd 5th distal2 image.png"],
    description: ["3rd 5th distal description.png", "3rd 5th distal2 description.png"],
  },
};

const ALL_DRAWABLE = ["B", "C", "D", "E", "F", "G", "H", "I"];

function clampRect(rect, width, height) {
  const x = Math.max(0, rect.x);
  const y = Math.max(0, rect.y);
  const w = Math.min(width - x, rect.w);
  const h = Math.min(height - y, rect.h);
  return { x, y, w: Math.max(1, w), h: Math.max(1, h) };
}

function rectFromRatios(left, right, width, height) {
  const x = Math.floor(left * width);
  const w = Math.ceil((right - left) * width);
  return clampRect({ x, y: 0, w, h: height }, width, height);
}

function boundsFromAnchors(anchorsByRating, rating) {
  const ratings = Object.keys(anchorsByRating).sort();
  const idx = ratings.indexOf(rating);
  if (idx < 0) return null;

  const values = ratings.map((r) => anchorsByRating[r]);
  const outerPad = 0.01;
  const innerInset = 0.01;

  let left =
    idx === 0
      ? 0
      : (values[idx - 1] + values[idx]) / 2 + innerInset;
  let right =
    idx === ratings.length - 1
      ? 1
      : (values[idx] + values[idx + 1]) / 2 - innerInset;

  if (idx === 0) left -= outerPad;
  if (idx === ratings.length - 1) right += outerPad;

  return { left: Math.max(0, left), right: Math.min(1, right) };
}

/** Default equal-quad crop with inset at shared edges to avoid neighbor bleed. */
function defaultQuadBounds(stageIndex) {
  const n = 4;
  const outerPad = 0.012;
  const innerInset = 0.008;

  let left = stageIndex / n;
  let right = (stageIndex + 1) / n;

  if (stageIndex === 0) left -= outerPad;
  else left += innerInset;

  if (stageIndex === n - 1) right += outerPad;
  else right -= innerInset;

  return { left: Math.max(0, left), right: Math.min(1, right) };
}

function cropRectPx(landmarkId, rating, stageIndex, panelIndex, width, height) {
  const panelAnchors = PANEL_ANCHOR_X[landmarkId]?.[panelIndex];
  if (panelAnchors && panelAnchors[rating]) {
    const bounds = boundsFromAnchors(panelAnchors, rating);
    if (bounds) return rectFromRatios(bounds.left, bounds.right, width, height);
  }

  const bounds = defaultQuadBounds(stageIndex);
  return rectFromRatios(bounds.left, bounds.right, width, height);
}

function readPng(filePath) {
  return PNG.sync.read(fs.readFileSync(filePath));
}

function writeCrop(srcPath, destPath, rect) {
  const png = readPng(srcPath);
  const out = new PNG({ width: rect.w, height: rect.h });
  for (let y = 0; y < rect.h; y++) {
    for (let x = 0; x < rect.w; x++) {
      const sx = rect.x + x;
      const sy = rect.y + y;
      const srcIdx = (sy * png.width + sx) << 2;
      const dstIdx = (y * rect.w + x) << 2;
      out.data[dstIdx] = png.data[srcIdx];
      out.data[dstIdx + 1] = png.data[srcIdx + 1];
      out.data[dstIdx + 2] = png.data[srcIdx + 2];
      out.data[dstIdx + 3] = png.data[srcIdx + 3];
    }
  }
  fs.mkdirSync(path.dirname(destPath), { recursive: true });
  fs.writeFileSync(destPath, PNG.sync.write(out));
}

function resolveAtlasFile(name) {
  const direct = path.join(atlasRoot, name);
  if (fs.existsSync(direct)) return direct;
  const pub = path.join(root, "public", "atlas", name);
  if (fs.existsSync(pub)) return pub;
  return null;
}

function drawableRatingsForLandmark(landmarkId) {
  const skip = SKIP_RATINGS[landmarkId] ?? new Set();
  return ALL_DRAWABLE.filter((r) => !skip.has(r));
}

function cropLandmarkStages(landmarkId, panels) {
  const outDir = path.join(stagesOut, landmarkId);
  fs.mkdirSync(outDir, { recursive: true });

  for (const existing of fs.readdirSync(outDir)) {
    if (existing.endsWith(".png")) fs.unlinkSync(path.join(outDir, existing));
  }

  const entries = [];
  const qcWarnings = [];

  for (const rating of drawableRatingsForLandmark(landmarkId)) {
    const panelIndex = RATING_PANEL_INDEX[rating];
    const stageIndex = RATING_STAGE_INDEX[rating];
    const refName = panels.reference[panelIndex];
    const descName = panels.description[panelIndex];
    const refSrc = resolveAtlasFile(refName);
    const descSrc = resolveAtlasFile(descName);
    if (!refSrc || !descSrc) {
      console.warn(`  Skip ${landmarkId} ${rating}: missing panel source`);
      continue;
    }

    const refPng = readPng(refSrc);
    const rect = cropRectPx(
      landmarkId,
      rating,
      stageIndex,
      panelIndex,
      refPng.width,
      refPng.height,
    );

    const widthPct = (rect.w / refPng.width) * 100;
    const expectedMax =
      landmarkId === "ulna" && panelIndex === 1 ? 38 : 28;
    if (widthPct > expectedMax) {
      qcWarnings.push(
        `${landmarkId} ${rating}: crop width ${widthPct.toFixed(1)}% (>${expectedMax}%)`,
      );
    }

    const refOut = path.join(outDir, `${rating}.png`);
    const descOut = path.join(outDir, `${rating}-desc.png`);
    writeCrop(refSrc, refOut, rect);
    writeCrop(descSrc, descOut, rect);
    entries.push({ rating, referenceFile: `${rating}.png`, descriptionFile: `${rating}-desc.png` });
  }

  return { entries, qcWarnings };
}

function copyStagesToPublic() {
  if (!fs.existsSync(stagesOut)) return;
  for (const landmarkId of fs.readdirSync(stagesOut)) {
    const srcDir = path.join(stagesOut, landmarkId);
    if (!fs.statSync(srcDir).isDirectory()) continue;
    const destDir = path.join(publicStagesOut, landmarkId);
    fs.mkdirSync(destDir, { recursive: true });

    const srcFiles = new Set(fs.readdirSync(srcDir));
    for (const existing of fs.readdirSync(destDir)) {
      if (!srcFiles.has(existing)) {
        fs.unlinkSync(path.join(destDir, existing));
      }
    }

    for (const file of srcFiles) {
      fs.copyFileSync(path.join(srcDir, file), path.join(destDir, file));
    }
  }
}

const rawEntries = {};
let totalCrops = 0;
const allWarnings = [];

console.log(`Atlas source: ${atlasRoot}`);
for (const [landmarkId, panels] of Object.entries(LANDMARK_PANELS)) {
  console.log(`Cropping ${landmarkId}…`);
  const { entries, qcWarnings } = cropLandmarkStages(landmarkId, panels);
  rawEntries[landmarkId] = entries;
  totalCrops += entries.length;
  allWarnings.push(...qcWarnings);
}

fs.mkdirSync(path.dirname(manifestOut), { recursive: true });
fs.writeFileSync(
  manifestOut,
  `/** Auto-generated by scripts/crop-tw3-atlas-stages.mjs — run npm run import:data */
import type { Tw3LandmarkId, Tw3MaturityRating } from "../../core/calculators/tw3/types";
import { ATLAS_CACHE_BUST } from "./atlasVersion";

export interface Tw3StageImageEntry {
  rating: Tw3MaturityRating;
  referenceSrc: string;
  descriptionSrc: string;
}

function stageUrl(landmarkId: Tw3LandmarkId, file: string): string {
  return \`/atlas/stages/\${landmarkId}/\${encodeURI(file)}?v=\${ATLAS_CACHE_BUST}\`;
}

const RAW_STAGE_FILES: Record<
  Tw3LandmarkId,
  { rating: Tw3MaturityRating; referenceFile: string; descriptionFile: string }[]
> = ${JSON.stringify(
    Object.fromEntries(
      Object.entries(rawEntries).map(([id, rows]) => [
        id,
        rows.map((r) => ({
          rating: r.rating,
          referenceFile: r.referenceFile,
          descriptionFile: r.descriptionFile,
        })),
      ]),
    ),
    null,
    2,
  )};

export function getStageImagesForLandmark(landmarkId: Tw3LandmarkId): Tw3StageImageEntry[] {
  return (RAW_STAGE_FILES[landmarkId] ?? []).map((row) => ({
    rating: row.rating,
    referenceSrc: stageUrl(landmarkId, row.referenceFile),
    descriptionSrc: stageUrl(landmarkId, row.descriptionFile),
  }));
}

export function getAllStageImageUrlsForLandmark(landmarkId: Tw3LandmarkId): string[] {
  return getStageImagesForLandmark(landmarkId).flatMap((entry) => [
    entry.referenceSrc,
    entry.descriptionSrc,
  ]);
}
`,
);
console.log(`Wrote ${manifestOut}`);

copyStagesToPublic();
console.log(`Copied stages to ${publicStagesOut}`);
console.log(`Cropped ${totalCrops} stage pairs across ${Object.keys(rawEntries).length} landmarks.`);

if (allWarnings.length > 0) {
  console.warn("QC warnings:");
  for (const w of allWarnings) console.warn(`  - ${w}`);
} else {
  console.log("QC: all crop widths within expected bounds.");
}
