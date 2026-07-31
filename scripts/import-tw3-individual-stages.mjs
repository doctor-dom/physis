/**
 * Imports TW3 individual stage PNGs and markdown descriptions into typed manifests.
 * Source: data/atlas/stages-v2/*.png, data/atlas/stage-descriptions/*.md
 * Run: node scripts/import-tw3-individual-stages.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const stagesV2Src = path.join(root, "data", "atlas", "stages-v2");
const stagesDeploySrc = path.join(root, "data", "atlas", "individual-stages");
const descSrc = path.join(root, "data", "atlas", "stage-descriptions");
const outDir = path.join(root, "src", "data", "tw3");

const RATINGS = ["B", "C", "D", "E", "F", "G", "H", "I"];

/** v2 folder name or canonical prefix → deploy prefix (rad_img_B.png). */
const LOCATION_TO_PREFIX = {
  radius: "rad",
  rad: "rad",
  ulna: "uln",
  uln: "uln",
  "1MC": "1MC",
  "1PP": "1PP",
  "1DP": "1DP",
  "35MC": "35MC",
  "35PP": "35PP",
  "35MP": "35MP",
  "35DP": "35DP",
};

/** Landmark id → image prefix (e.g. rad_img_B.png). */
const LANDMARK_IMAGE_PREFIX = {
  radius: "rad",
  ulna: "uln",
  metacarpal_1: "1MC",
  metacarpal_3: "35MC",
  metacarpal_5: "35MC",
  proximal_phalanx_1: "1PP",
  proximal_phalanx_3: "35PP",
  proximal_phalanx_5: "35PP",
  middle_phalanx_3: "35MP",
  middle_phalanx_5: "35MP",
  distal_phalanx_1: "1DP",
  distal_phalanx_3: "35DP",
  distal_phalanx_5: "35DP",
};

/** Landmark id → stage-descriptions markdown file. */
const LANDMARK_DESC_FILE = {
  radius: "rad_desc.md",
  ulna: "uln_desc.md",
  metacarpal_1: "1MC_desc.md",
  metacarpal_3: "35MC_desc.md",
  metacarpal_5: "35MC_desc.md",
  proximal_phalanx_1: "1PP_desc.md",
  proximal_phalanx_3: "35PP_desc.md",
  proximal_phalanx_5: "35PP_desc.md",
  middle_phalanx_3: "35MP_desc.md",
  middle_phalanx_5: "35MP_desc.md",
  distal_phalanx_1: "1DP_desc.md",
  distal_phalanx_3: "35DP_desc.md",
  distal_phalanx_5: "35DP_desc.md",
};

function resolvePrefix(locationToken) {
  return (
    LOCATION_TO_PREFIX[locationToken] ??
    LOCATION_TO_PREFIX[locationToken.toLowerCase()] ??
    locationToken
  );
}

function parseStageFileName(name) {
  const canonicalMatch = name.match(/^(.+)_img_([A-I])\.png$/i);
  if (canonicalMatch) {
    const prefix = resolvePrefix(canonicalMatch[1]);
    const rating = canonicalMatch[2].toUpperCase();
    return { prefix, rating, canonical: `${prefix}_img_${rating}.png` };
  }

  const v2Match = name.match(/^(.+)-([a-iA-I])\.png$/);
  if (v2Match) {
    const prefix = resolvePrefix(v2Match[1]);
    const rating = v2Match[2].toUpperCase();
    return { prefix, rating, canonical: `${prefix}_img_${rating}.png` };
  }

  return null;
}

function stageImageFile(prefix, rating) {
  return `${prefix}_img_${rating}.png`;
}

function normalizeStagesV2Filenames() {
  if (!fs.existsSync(stagesV2Src)) {
    throw new Error(`Missing ${stagesV2Src}`);
  }

  let renamed = 0;
  for (const name of fs.readdirSync(stagesV2Src)) {
    if (!/\.png$/i.test(name)) continue;

    const parsed = parseStageFileName(name);
    if (!parsed) {
      console.warn(`Skipping unrecognized stage file: ${name}`);
      continue;
    }

    const srcPath = path.join(stagesV2Src, name);
    const destPath = path.join(stagesV2Src, parsed.canonical);
    if (name === parsed.canonical) continue;

    if (fs.existsSync(destPath) && srcPath !== destPath) {
      fs.unlinkSync(destPath);
    }
    fs.renameSync(srcPath, destPath);
    console.log(`Renamed ${name} → ${parsed.canonical}`);
    renamed += 1;
  }

  return renamed;
}

function syncStagesToDeployFolder() {
  fs.mkdirSync(stagesDeploySrc, { recursive: true });

  const canonicalFiles = fs
    .readdirSync(stagesV2Src)
    .filter((name) => /^.+_img_[A-I]\.png$/.test(name));

  for (const name of fs.readdirSync(stagesDeploySrc)) {
    if (/^.+_img_[A-I]\.png$/.test(name) && !canonicalFiles.includes(name)) {
      fs.unlinkSync(path.join(stagesDeploySrc, name));
    }
  }

  for (const name of canonicalFiles) {
    fs.copyFileSync(path.join(stagesV2Src, name), path.join(stagesDeploySrc, name));
  }

  return canonicalFiles.length;
}

function parseStageDescriptions(markdown) {
  const byRating = {};
  const pattern = /\*\*Stage ([A-I])\*\*\s*([\s\S]*?)(?=\*\*Stage [A-I]\*\*|$)/g;
  let match;
  while ((match = pattern.exec(markdown)) !== null) {
    const rating = match[1];
    const body = match[2]
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0 && !line.startsWith("*Note:"));
    byRating[rating] = body;
  }
  return byRating;
}

function buildManifest() {
  const manifest = {};

  for (const [landmarkId, prefix] of Object.entries(LANDMARK_IMAGE_PREFIX)) {
    const descPath = path.join(descSrc, LANDMARK_DESC_FILE[landmarkId]);
    const descriptions = fs.existsSync(descPath)
      ? parseStageDescriptions(fs.readFileSync(descPath, "utf8"))
      : {};

    const entries = [];
    for (const rating of RATINGS) {
      const fileName = stageImageFile(prefix, rating);
      const filePath = path.join(stagesDeploySrc, fileName);
      if (!fs.existsSync(filePath)) continue;
      entries.push({
        rating,
        imageFile: fileName,
        descriptionLines: descriptions[rating] ?? [],
      });
    }

    if (entries.length === 0) {
      console.warn(`No stage images found for ${landmarkId} (${prefix}_img_*.png)`);
    }
    manifest[landmarkId] = entries;
  }

  return manifest;
}

const renamedCount = normalizeStagesV2Filenames();
const syncedCount = syncStagesToDeployFolder();
const manifest = buildManifest();
const totalImages = Object.values(manifest).reduce((n, rows) => n + rows.length, 0);

fs.mkdirSync(outDir, { recursive: true });
const outPath = path.join(outDir, "atlasStageManifest.ts");
fs.writeFileSync(
  outPath,
  `/** Auto-generated by scripts/import-tw3-individual-stages.mjs — run npm run import:data */
import type { Tw3LandmarkId, Tw3MaturityRating } from "../../core/calculators/tw3/types";
import { ATLAS_CACHE_BUST } from "./atlasVersion";

export interface Tw3StageImageEntry {
  rating: Tw3MaturityRating;
  referenceSrc: string;
  descriptionLines: string[];
}

function stageImageUrl(fileName: string): string {
  return \`/atlas/individual-stages/\${encodeURI(fileName)}?v=\${ATLAS_CACHE_BUST}\`;
}

type RawStageRow = {
  rating: Tw3MaturityRating;
  imageFile: string;
  descriptionLines: string[];
};

const RAW_STAGE_MANIFEST: Record<Tw3LandmarkId, RawStageRow[]> = ${JSON.stringify(manifest, null, 2)};

export function getStageImagesForLandmark(landmarkId: Tw3LandmarkId): Tw3StageImageEntry[] {
  return (RAW_STAGE_MANIFEST[landmarkId] ?? []).map((row) => ({
    rating: row.rating,
    referenceSrc: stageImageUrl(row.imageFile),
    descriptionLines: row.descriptionLines,
  }));
}

export function getStageDescription(
  landmarkId: Tw3LandmarkId,
  rating: Tw3MaturityRating,
): string[] {
  const row = (RAW_STAGE_MANIFEST[landmarkId] ?? []).find((entry) => entry.rating === rating);
  return row?.descriptionLines ?? [];
}

export function getAllStageImageUrlsForLandmark(landmarkId: Tw3LandmarkId): string[] {
  return getStageImagesForLandmark(landmarkId).map((entry) => entry.referenceSrc);
}
`,
);

console.log(
  `Wrote ${outPath} (${totalImages} stage images; renamed ${renamedCount} in stages-v2; synced ${syncedCount} to individual-stages).`,
);
