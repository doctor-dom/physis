import type { Tw3LandmarkId } from "../../core/calculators/tw3/types";
import { ATLAS_CACHE_BUST } from "./atlasVersion";

export interface Tw3AtlasAsset {
  /** Public URL path under /atlas/ */
  src: string;
  label: string;
}

export interface Tw3LandmarkAtlas {
  landmarkId: Tw3LandmarkId;
  referenceImages: Tw3AtlasAsset[];
  descriptionImages: Tw3AtlasAsset[];
}

export interface Tw3AtlasStagePanel {
  reference: Tw3AtlasAsset;
  description: Tw3AtlasAsset;
}

function atlasPath(filename: string): string {
  return `/atlas/${encodeURI(filename)}?v=${ATLAS_CACHE_BUST}`;
}

export const TW3_ATLAS_MANIFEST: Tw3LandmarkAtlas[] = [
  {
    landmarkId: "radius",
    referenceImages: [
      { src: atlasPath("radius image.png"), label: "Stages B–E" },
      { src: atlasPath("radius2 image.png"), label: "Stages F–I" },
    ],
    descriptionImages: [
      { src: atlasPath("radius description.png"), label: "Stages B–E descriptions" },
      { src: atlasPath("radius2 description.png"), label: "Stages F–I descriptions" },
    ],
  },
  {
    landmarkId: "ulna",
    referenceImages: [
      { src: atlasPath("ulna image.png"), label: "Stages B–E" },
      { src: atlasPath("ulna2 image.png"), label: "Stages F–I" },
    ],
    descriptionImages: [
      { src: atlasPath("ulna description.png"), label: "Stages B–E descriptions" },
      { src: atlasPath("ulna2 description.png"), label: "Stages F–I descriptions" },
    ],
  },
  {
    landmarkId: "metacarpal_1",
    referenceImages: [
      { src: atlasPath("1st metacarpal image.png"), label: "Stages B–E" },
      { src: atlasPath("1st metacarpal2 image.png"), label: "Stages F–I" },
    ],
    descriptionImages: [
      { src: atlasPath("1st metacarpal description.png"), label: "Stages B–E descriptions" },
      { src: atlasPath("1st metacarpal2 description.png"), label: "Stages F–I descriptions" },
    ],
  },
  {
    landmarkId: "metacarpal_3",
    referenceImages: [
      { src: atlasPath("3rd 5th metacarpal image.png"), label: "Stages B–E (3rd & 5th)" },
      { src: atlasPath("3rd 5th metacarpal2 image.png"), label: "Stages F–I (3rd & 5th)" },
    ],
    descriptionImages: [
      { src: atlasPath("3rd 5th metacarpal description.png"), label: "Stages B–E descriptions" },
      { src: atlasPath("3rd 5th metacarpal2 description.png"), label: "Stages F–I descriptions" },
    ],
  },
  {
    landmarkId: "metacarpal_5",
    referenceImages: [
      { src: atlasPath("3rd 5th metacarpal image.png"), label: "Stages B–E (3rd & 5th)" },
      { src: atlasPath("3rd 5th metacarpal2 image.png"), label: "Stages F–I (3rd & 5th)" },
    ],
    descriptionImages: [
      { src: atlasPath("3rd 5th metacarpal description.png"), label: "Stages B–E descriptions" },
      { src: atlasPath("3rd 5th metacarpal2 description.png"), label: "Stages F–I descriptions" },
    ],
  },
  {
    landmarkId: "proximal_phalanx_1",
    referenceImages: [
      { src: atlasPath("proximal thumb image.png"), label: "Stages B–E" },
      // Source PNGs for F–I are misnamed on disk (drawings in *description*, text in *image*).
      { src: atlasPath("proximal thumb2 description.png"), label: "Stages F–I" },
    ],
    descriptionImages: [
      { src: atlasPath("proximal thumb description.png"), label: "Stages B–E descriptions" },
      { src: atlasPath("proximal thumb2 image.png"), label: "Stages F–I descriptions" },
    ],
  },
  {
    landmarkId: "proximal_phalanx_3",
    referenceImages: [
      { src: atlasPath("3rd 5th proximal image.png"), label: "Stages B–E (3rd & 5th)" },
      { src: atlasPath("3rd 5th proximal2 image.png"), label: "Stages F–I (3rd & 5th)" },
    ],
    descriptionImages: [
      { src: atlasPath("3rd 5th proximal description.png"), label: "Stages B–E descriptions" },
      { src: atlasPath("3rd 5th proximal2 description.png"), label: "Stages F–I descriptions" },
    ],
  },
  {
    landmarkId: "proximal_phalanx_5",
    referenceImages: [
      { src: atlasPath("3rd 5th proximal image.png"), label: "Stages B–E (3rd & 5th)" },
      { src: atlasPath("3rd 5th proximal2 image.png"), label: "Stages F–I (3rd & 5th)" },
    ],
    descriptionImages: [
      { src: atlasPath("3rd 5th proximal description.png"), label: "Stages B–E descriptions" },
      { src: atlasPath("3rd 5th proximal2 description.png"), label: "Stages F–I descriptions" },
    ],
  },
  {
    landmarkId: "middle_phalanx_3",
    referenceImages: [
      { src: atlasPath("3rd 5th medial image.png"), label: "Stages B–E (3rd & 5th)" },
      { src: atlasPath("3rd 5th medial2 image.png"), label: "Stages F–I (3rd & 5th)" },
    ],
    descriptionImages: [
      { src: atlasPath("3rd 5th medial description.png"), label: "Stages B–E descriptions" },
      { src: atlasPath("3rd 5th medial2 description.png"), label: "Stages F–I descriptions" },
    ],
  },
  {
    landmarkId: "middle_phalanx_5",
    referenceImages: [
      { src: atlasPath("3rd 5th medial image.png"), label: "Stages B–E (3rd & 5th)" },
      { src: atlasPath("3rd 5th medial2 image.png"), label: "Stages F–I (3rd & 5th)" },
    ],
    descriptionImages: [
      { src: atlasPath("3rd 5th medial description.png"), label: "Stages B–E descriptions" },
      { src: atlasPath("3rd 5th medial2 description.png"), label: "Stages F–I descriptions" },
    ],
  },
  {
    landmarkId: "distal_phalanx_1",
    referenceImages: [
      { src: atlasPath("distal thumb image.png"), label: "Stages B–E" },
      { src: atlasPath("distal thumb2 image.png"), label: "Stages F–I" },
    ],
    descriptionImages: [
      { src: atlasPath("distal thumb description.png"), label: "Stages B–E descriptions" },
      { src: atlasPath("distal thumb2 description.png"), label: "Stages F–I descriptions" },
    ],
  },
  {
    landmarkId: "distal_phalanx_3",
    referenceImages: [
      { src: atlasPath("3rd 5th distal image.png"), label: "Stages B–E (3rd & 5th)" },
      { src: atlasPath("3rd 5th distal2 image.png"), label: "Stages F–I (3rd & 5th)" },
    ],
    descriptionImages: [
      { src: atlasPath("3rd 5th distal description.png"), label: "Stages B–E descriptions" },
      { src: atlasPath("3rd 5th distal2 description.png"), label: "Stages F–I descriptions" },
    ],
  },
  {
    landmarkId: "distal_phalanx_5",
    referenceImages: [
      { src: atlasPath("3rd 5th distal image.png"), label: "Stages B–E (3rd & 5th)" },
      { src: atlasPath("3rd 5th distal2 image.png"), label: "Stages F–I (3rd & 5th)" },
    ],
    descriptionImages: [
      { src: atlasPath("3rd 5th distal description.png"), label: "Stages B–E descriptions" },
      { src: atlasPath("3rd 5th distal2 description.png"), label: "Stages F–I descriptions" },
    ],
  },
];

export const TW3_REFERENCE_CHARTS = {
  /** Stage drawing rubric (sex-neutral staging criteria). */
  rubric: atlasPath("Bone maturity stage scoring rubric.png"),
  /** Table A1 — SMS → bone age, boys */
  smsChartBoys: atlasPath("TW3 Maturity Score - boys.png"),
  /** Table A3 — SMS → bone age, girls */
  smsChartGirls: atlasPath("TW3 Maturity Score - girls.png"),
  /** Table A5 — RUS letter point values, boys */
  maturityScoreBoys: atlasPath("Maturity Score Boys.png"),
  /** Table A6 — RUS letter point values, girls */
  maturityScoreGirls: atlasPath("Maturity Score Girls.png"),
  handGraphic: atlasPath("hand graphic.png"),
} as const;

export function getTw3ReferenceChartsForSex(sex: "male" | "female") {
  const isMale = sex === "male";
  return {
    rusPointTable: isMale
      ? TW3_REFERENCE_CHARTS.maturityScoreBoys
      : TW3_REFERENCE_CHARTS.maturityScoreGirls,
    rusPointTableLabel: isMale
      ? "Table A5 — RUS maturity scores (boys)"
      : "Table A6 — RUS maturity scores (girls)",
    smsToBoneAgeChart: isMale
      ? TW3_REFERENCE_CHARTS.smsChartBoys
      : TW3_REFERENCE_CHARTS.smsChartGirls,
    smsToBoneAgeLabel: isMale
      ? "Table A1 — SMS to bone age (boys)"
      : "Table A3 — SMS to bone age (girls)",
  };
}

export function getAtlasForLandmark(landmarkId: Tw3LandmarkId): Tw3LandmarkAtlas | undefined {
  return TW3_ATLAS_MANIFEST.find((entry) => entry.landmarkId === landmarkId);
}

/** Pairs each reference drawing with its matching description panel (same index). */
export function getAtlasStagePanels(atlas: Tw3LandmarkAtlas): Tw3AtlasStagePanel[] {
  return atlas.referenceImages.flatMap((reference, index) => {
    const description = atlas.descriptionImages[index];
    return description ? [{ reference, description }] : [];
  });
}
