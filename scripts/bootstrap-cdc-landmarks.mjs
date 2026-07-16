/**
 * Bootstrap landmark JSON for one CDC chart from another template + grid snap.
 *
 * Boys and girls Set 1 PNGs share the same grid layout; this copies template
 * landmarks and snaps each point to the nearest grid pixel on the target PNG.
 *
 * Usage:
 *   node scripts/bootstrap-cdc-landmarks.mjs
 *   node scripts/bootstrap-cdc-landmarks.mjs data/cdc/landmarks/cdc-landmarks-boys.json public/cdc/stature-weight-2-20-girls.png
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { PNG } from "pngjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

function readJson(p) {
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

function isGridPixel(data, W, H, x, y) {
  if (x < 0 || y < 0 || x >= W || y >= H) return false;
  const i = (W * y + x) << 2;
  const l = data[i] + data[i + 1] + data[i + 2];
  return l >= 180 && l <= 320;
}

let H = 0;

function snapToGrid(data, W, H, x, y, radius = 30) {
  if (isGridPixel(data, W, H, x, y)) return { x, y };
  let best = null;
  for (let dy = -radius; dy <= radius; dy++) {
    for (let dx = -radius; dx <= radius; dx++) {
      const nx = x + dx;
      const ny = y + dy;
      if (!isGridPixel(data, W, H, nx, ny)) continue;
      const d = dx * dx + dy * dy;
      if (!best || d < best.d) best = { x: nx, y: ny, d };
    }
  }
  return best ? { x: best.x, y: best.y } : { x, y };
}

function findGridY(data, W, H, x, yHint, yMin, yMax) {
  for (let r = 0; r <= 40; r++) {
    for (const dy of [0, r, -r]) {
      const y = yHint + dy;
      if (y >= yMin && y <= yMax && isGridPixel(data, W, H, x, y)) return y;
    }
  }
  return yHint;
}

function bootstrapLandmarks(template, pngPath, targetFilename) {
  const png = PNG.sync.read(fs.readFileSync(pngPath));
  const { width: W, height, data } = png;
  H = height;

  const landmarks = template.landmarks.map((lm) => {
    const { x, y } = snapToGrid(data, W, H, lm.x, lm.y);
    return { ...lm, x, y };
  });

  // Girls-specific scale caps (same pixel grid, different axis labels).
  if (targetFilename.includes("girls")) {
    const rightCm = landmarks.filter((l) => l.category === "stature-right-cm");
    const maxRight = Math.max(...rightCm.map((l) => l.value));
    if (maxRight > 185) {
      const cm190 = rightCm.find((l) => l.value === 190);
      const filtered = landmarks.filter(
        (l) => l.category !== "stature-right-cm" || l.value <= 180,
      );
      if (cm190 && !filtered.some((l) => l.category === "stature-right-cm" && l.value === 185)) {
        filtered.push({
          category: "stature-right-cm",
          value: 185,
          x: cm190.x,
          y: findGridY(data, W, H, cm190.x, cm190.y, 3200, 5400),
        });
      }
      filtered.sort(
        (a, b) =>
          a.category.localeCompare(b.category) || Number(a.value) - Number(b.value),
      );
      landmarks.length = 0;
      landmarks.push(...filtered);
    }

    const has165 = landmarks.some(
      (l) => l.category === "stature-left-cm" && l.value === 165,
    );
    if (!has165) {
      const cm160 = landmarks.find(
        (l) => l.category === "stature-left-cm" && l.value === 160,
      );
      if (cm160) {
        landmarks.push({
          category: "stature-left-cm",
          value: 165,
          x: cm160.x,
          y: findGridY(data, W, H, cm160.x, cm160.y - 550, 4100, 4900),
        });
        landmarks.sort(
          (a, b) =>
            a.category.localeCompare(b.category) || Number(a.value) - Number(b.value),
        );
      }
    }
  }

  return {
    version: 1,
    filename: targetFilename,
    imageWidth: W,
    imageHeight: height,
    markedAt: new Date().toISOString(),
    bootstrappedFrom: path.basename(template.filename ?? "template"),
    landmarks,
  };
}

function main() {
  const templatePath =
    process.argv[2] ??
    path.join(root, "data", "cdc", "landmarks", "cdc-landmarks-boys.json");
  const pngPath =
    process.argv[3] ?? path.join(root, "public", "cdc", "stature-weight-2-20-girls.png");
  const outPath =
    process.argv[4] ??
    path.join(root, "data", "cdc", "landmarks", "cdc-landmarks-girls.json");

  const template = readJson(templatePath);
  const targetFilename = path.basename(pngPath);
  const output = bootstrapLandmarks(template, pngPath, targetFilename);

  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(output, null, 2));

  console.log(`✓ Bootstrapped ${output.landmarks.length} landmarks`);
  console.log(`  template: ${templatePath}`);
  console.log(`  PNG:      ${pngPath}`);
  console.log(`  wrote:    ${outPath}`);
  console.log("\nNext: npm run apply:cdc-landmarks");
}

main();
