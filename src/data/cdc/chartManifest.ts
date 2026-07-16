import type { Sex } from "../../core/types";
import type { CdcStatureAxes, CdcWeightAxes } from "../../core/cdc/chartCoordinates";
import { CDC_CACHE_BUST } from "./cdcVersion";

/** Native pixel dimensions of the CDC chart PNGs in data/cdc/ (used for SVG viewBox). */
export const CDC_CHART_IMAGE = {
  width: 10200,
  height: 13200,
} as const;

/** Combined CDC Set 1 stature-for-age + weight-for-age (2–20 y) chart filenames in data/cdc/. */
export const CDC_CHART_FILENAMES = {
  male: "stature-weight-2-20-boys.png",
  female: "stature-weight-2-20-girls.png",
} as const;

export interface CdcGrowthChartDefinition {
  filename: string;
  src: string;
  label: string;
  endOfGrowthAgeYears: number;
  stature: CdcStatureAxes;
  weight: CdcWeightAxes;
}

function cdcPath(filename: string): string {
  return `/cdc/${encodeURI(filename)}?v=${CDC_CACHE_BUST}`;
}

/** Hand-marked via data/cdc/landmarks/cdc-landmarks-boys.json (npm run apply:cdc-landmarks). */
const BOYS_CHART: Omit<CdcGrowthChartDefinition, "filename" | "src" | "label"> = {
  endOfGrowthAgeYears: 20,
  stature: {
    splitAge: 12,
    left: {
      ageMin: 2,
      ageMax: 11,
      ageColumnsPx: [
        3021, 3242, 3480, 3710, 3939, 4169, 4407, 4637, 4858, 5088,
      ],
      cmMin: 80,
      cmMax: 160,
      cmAnchors: [
        { cm: 80, y: 8314 },
        { cm: 90, y: 7874 },
        { cm: 100, y: 7440 },
        { cm: 110, y: 7010 },
        { cm: 120, y: 6575 },
        { cm: 130, y: 6158 },
        { cm: 140, y: 5691 },
        { cm: 150, y: 5257 },
        { cm: 160, y: 4825 },
      ],
    },
    right: {
      ageMin: 12,
      ageMax: 20,
      ageColumnsPx: [
        5334, 5564, 5794, 6023, 6261, 6482, 6721, 6942, 7180,
      ],
      cmMin: 150,
      cmMax: 195,
      cmAnchors: [
        { cm: 150, y: 5268 },
        { cm: 160, y: 4826 },
        { cm: 170, y: 4403 },
        { cm: 180, y: 3952 },
        { cm: 190, y: 3519 },
        { cm: 195, y: 3301 },
      ],
    },
  },
  weight: {
    ageMin: 2,
    ageMax: 20,
    ageColumns: [
      { age: 2, x: 3012 },
      { age: 4, x: 3472 },
      { age: 6, x: 3939 },
      { age: 8, x: 4390 },
      { age: 10, x: 4866 },
      { age: 12, x: 5326 },
      { age: 14, x: 5794 },
      { age: 16, x: 6244 },
      { age: 18, x: 6721 },
      { age: 20, x: 7180 },
    ],
    splitKg: 40,
    left: {
      kgMin: 10,
      kgMax: 35,
      kgAnchors: [
        { kg: 10, y: 9830 },
        { kg: 15, y: 9620 },
        { kg: 20, y: 9405 },
        { kg: 25, y: 9183 },
        { kg: 30, y: 8963 },
        { kg: 35, y: 8748 },
      ],
    },
    right: {
      kgMin: 40,
      kgMax: 105,
      kgAnchors: [
        { kg: 40, y: 8533 },
        { kg: 45, y: 8321 },
        { kg: 50, y: 8102 },
        { kg: 60, y: 7655 },
        { kg: 75, y: 6992 },
        { kg: 90, y: 6350 },
        { kg: 105, y: 5699 },
      ],
    },
  },
};

/** Hand-marked via data/cdc/landmarks/cdc-landmarks-girls.json (bootstrapped from boys + grid snap). */
const GIRLS_CHART: Omit<CdcGrowthChartDefinition, "filename" | "src" | "label"> = {
  endOfGrowthAgeYears: 20,
  stature: {
    splitAge: 12,
    left: {
      ageMin: 2,
      ageMax: 11,
      ageColumnsPx: [
        3021, 3242, 3480, 3710, 3939, 4169, 4407, 4637, 4858, 5088,
      ],
      cmMin: 80,
      cmMax: 165,
      cmAnchors: [
        { cm: 80, y: 8314 },
        { cm: 90, y: 7874 },
        { cm: 100, y: 7441 },
        { cm: 110, y: 7010 },
        { cm: 120, y: 6575 },
        { cm: 130, y: 6158 },
        { cm: 140, y: 5691 },
        { cm: 150, y: 5257 },
        { cm: 160, y: 4825 },
        { cm: 165, y: 4275 },
      ],
    },
    right: {
      ageMin: 12,
      ageMax: 20,
      ageColumnsPx: [
        5334, 5564, 5794, 6023, 6261, 6483, 6721, 6942, 7180,
      ],
      cmMin: 150,
      cmMax: 185,
      cmAnchors: [
        { cm: 150, y: 5268 },
        { cm: 160, y: 4826 },
        { cm: 170, y: 4403 },
        { cm: 180, y: 3952 },
        { cm: 185, y: 3519 },
      ],
    },
  },
  weight: {
    ageMin: 2,
    ageMax: 20,
    ageColumns: [
      { age: 2, x: 3012 },
      { age: 4, x: 3472 },
      { age: 6, x: 3939 },
      { age: 8, x: 4390 },
      { age: 10, x: 4866 },
      { age: 12, x: 5326 },
      { age: 14, x: 5794 },
      { age: 16, x: 6244 },
      { age: 18, x: 6721 },
      { age: 20, x: 7180 },
    ],
    splitKg: 40,
    left: {
      kgMin: 10,
      kgMax: 35,
      kgAnchors: [
        { kg: 10, y: 9830 },
        { kg: 15, y: 9620 },
        { kg: 20, y: 9405 },
        { kg: 25, y: 9183 },
        { kg: 30, y: 8963 },
        { kg: 35, y: 8748 },
      ],
    },
    right: {
      kgMin: 40,
      kgMax: 105,
      kgAnchors: [
        { kg: 40, y: 8533 },
        { kg: 45, y: 8321 },
        { kg: 50, y: 8102 },
        { kg: 60, y: 7655 },
        { kg: 75, y: 6992 },
        { kg: 90, y: 6350 },
        { kg: 105, y: 5699 },
      ],
    },
  },
};

function buildChart(
  sex: Sex,
  config: Omit<CdcGrowthChartDefinition, "filename" | "src" | "label">,
): CdcGrowthChartDefinition {
  const filename = CDC_CHART_FILENAMES[sex];
  return {
    filename,
    src: cdcPath(filename),
    label:
      sex === "male"
        ? "CDC boys stature-for-age & weight-for-age (2–20 y)"
        : "CDC girls stature-for-age & weight-for-age (2–20 y)",
    ...config,
  };
}

export const CDC_GROWTH_CHARTS: Record<Sex, CdcGrowthChartDefinition> = {
  male: buildChart("male", BOYS_CHART),
  female: buildChart("female", GIRLS_CHART),
};

export function getCdcGrowthChart(sex: Sex): CdcGrowthChartDefinition {
  return CDC_GROWTH_CHARTS[sex];
}
