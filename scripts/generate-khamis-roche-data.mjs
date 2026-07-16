/**
 * Generates src/data/khamisRoche/coefficients.ts from erratum tables in KR method.pdf
 * Run: node scripts/generate-khamis-roche-data.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

const ages = [];
for (let a = 4; a <= 17.5; a += 0.5) {
  ages.push(Number(a.toFixed(1)));
}

const maleBeta0 = [
  -10.2567, -10.719, -11.0213, -11.1556, -11.1138, -11.0221, -10.9984, -11.0214,
  -11.0696, -11.122, -11.1571, -11.1405, -11.038, -10.8286, -10.4917, -10.0065,
  -9.3522, -8.6055, -7.8632, -7.1348, -6.4299, -5.7578, -5.1282, -4.5092, -3.9292,
  -3.4873, -3.283, -3.4156,
];

const maleStature = [
  1.23812, 1.15964, 1.10674, 1.0748, 1.05923, 1.05542, 1.05877, 1.06467, 1.06853,
  1.06572, 1.05166, 1.02174, 0.97135, 0.89589, 0.81239, 0.74134, 0.68325, 0.63869,
  0.60818, 0.59228, 0.59151, 0.60643, 0.63757, 0.68548, 0.75069, 0.83375, 0.9352,
  1.05558,
];

const maleWeight = [
  -0.087235, -0.074454, -0.064778, -0.05776, -0.052947, -0.049892, -0.048144,
  -0.047256, -0.046778, -0.046261, -0.045254, -0.043311, -0.039981, -0.034814,
  -0.02905, -0.024167, -0.020076, -0.016681, -0.013895, -0.011624, -0.009776,
  -0.008261, -0.006988, -0.005863, -0.004795, -0.003695, -0.00247, -0.001027,
];

const maleMps = [
  0.50286, 0.52887, 0.53919, 0.53691, 0.52513, 0.50692, 0.48538, 0.46361, 0.44469,
  0.43171, 0.42776, 0.43593, 0.45932, 0.50101, 0.54781, 0.58409, 0.60927, 0.62279,
  0.62407, 0.61253, 0.58762, 0.54875, 0.49536, 0.42687, 0.34271, 0.24231, 0.1251,
  -0.0095,
];

const femaleBeta0 = [
  -8.1325, -6.47656, -5.13583, -4.13791, -3.51039, -3.14322, -2.87645, -2.66291,
  -2.45559, -2.20728, -1.87098, -1.0633, 0.33468, 1.97366, 3.50436, 4.57747, 4.84365,
  4.27869, 3.21417, 1.83456, 0.32425, -1.13224, -2.35055, -3.10326, -3.17885,
  -2.41657, -0.65579, 2.26429,
];

const femaleStature = [
  1.24768, 1.22177, 1.19932, 1.1788, 1.15866, 1.13737, 1.11342, 1.08525, 1.05135,
  1.01018, 0.9602, 0.89989, 0.82771, 0.74213, 0.67173, 0.6415, 0.64452, 0.67386,
  0.7226, 0.78383, 0.85062, 0.91605, 0.97319, 1.01514, 1.03496, 1.02573, 0.98054,
  0.89246,
];

const femaleWeight = [
  -0.19435, -0.18519, -0.1753, -0.16484, -0.154, -0.14294, -0.13184, -0.12086,
  -0.11019, -0.09999, -0.09044, -0.08171, -0.07397, -0.06739, -0.06136, -0.05518,
  -0.04894, -0.04272, -0.03661, -0.03067, -0.025, -0.01967, -0.01477, -0.01037,
  -0.00655, -0.0034, -0.001, 0.00057,
];

const femaleMps = [
  0.44774, 0.41381, 0.38467, 0.36039, 0.34105, 0.32672, 0.31748, 0.3134, 0.31457,
  0.32105, 0.33291, 0.35025, 0.37312, 0.40161, 0.42042, 0.41686, 0.3949, 0.3585,
  0.31163, 0.25826, 0.20235, 0.14787, 0.0988, 0.05909, 0.03272, 0.02364, 0.03584,
  0.07327,
];

function buildCharts(beta0, stature, weight, mps) {
  return ages.map((ageYears, i) => ({
    ageYears,
    coefficients: {
      beta0: beta0[i],
      betaHeightIn: stature[i],
      betaWeightLb: weight[i],
      betaMpsIn: mps[i],
    },
  }));
}

const data = {
  male: buildCharts(maleBeta0, maleStature, maleWeight, maleMps),
  female: buildCharts(femaleBeta0, femaleStature, femaleWeight, femaleMps),
};

const outPath = path.join(root, "src", "data", "khamisRoche", "coefficients.ts");
const content = `/**
 * Khamis-Roche coefficients (Pediatrics 1994 erratum, Tables 1 & 2).
 * Source: data/excel/KR method.pdf
 * Equation uses inches and pounds; calculator converts from cm/kg.
 */
import type { KhamisRocheAgeChart } from "../../core/calculators/khamisRoche/calculateKhamisRocheHeight";

export const khamisRocheCoefficients = ${JSON.stringify(data, null, 2)} as {
  male: KhamisRocheAgeChart[];
  female: KhamisRocheAgeChart[];
};

export const KHAMIS_ROCHE_AGE_MIN = 4;
export const KHAMIS_ROCHE_AGE_MAX = 17.5;
`;

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, content);
console.log(`Wrote ${outPath}`);
