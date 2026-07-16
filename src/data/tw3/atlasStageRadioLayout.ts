import type { Tw3LandmarkId, Tw3MaturityRating } from "../../core/calculators/tw3/types";

export type Tw3AtlasFingerColumn = "single" | "third" | "fifth";

const STAGES_PER_PANEL = 4;

export const RATING_PANEL_INDEX: Record<Tw3MaturityRating, number> = {
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

const RATING_STAGE_INDEX: Record<Tw3MaturityRating, number> = {
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

/** Top of radio control — just below the printed column letter row (legacy layouts). */
const STAGE_RADIO_Y_RATIO = 0.112;

/**
 * Horizontal position within each stage column (0 = column left, 1 = column right).
 * Atlas panels place the printed letter on the left; the drawing is on the right.
 */
const LETTER_X_IN_COLUMN = 0.16;

/**
 * Horizontal position within each stage column for dual-finger panels.
 * Each column shows 3rd and 5th digits side by side; anchor on the scored digit.
 */
const FINGER_X_IN_COLUMN: Record<"third" | "fifth", number> = {
  third: 0.26,
  fifth: 0.74,
};

/** Vertical center of the PIP joint row on middle-phalanx atlas panels. */
const MIDDLE_PHALANX_PIP_Y_RATIO = 0.5;

/** MCP joint row on proximal-phalanx dual-finger panels (slightly below printed dot). */
const PROXIMAL_PHALANX_MCP_Y_RATIO = 0.38;

/** MCP joint row on proximal-phalanx dual-finger F–I panels. */
const PROXIMAL_PHALANX_MCP_Y_RATIO_PANEL2 = 0.2;

/** Horizontal anchor within each stage column for proximal phalanx dual panels. */
const PROXIMAL_PHALANX_FINGER_X: Record<"third" | "fifth", number> = {
  third: 0.188,
  fifth: 0.672,
};

/** Horizontal anchor for 3rd / 5th metacarpal dual panels. */
const METACARPAL_FINGER_X: Record<"third" | "fifth", number> = {
  third: 0.168,
  fifth: 0.676,
};

/**
 * Panel 2 (F–I): 5th-digit G/H/I letters sit between the 3rd and 5th drawings.
 * xInColumn values measured from atlas PNGs (not on the 5th drawing itself).
 */
const FIFTH_GHI_PANEL2_X_IN_COLUMN: Partial<
  Record<Tw3LandmarkId, Record<1 | 2 | 3, number>>
> = {
  metacarpal_5: { 1: 0.497, 2: 0.497, 3: 0.49 },
  middle_phalanx_5: { 1: 0.496, 2: 0.494, 3: 0.529 },
  distal_phalanx_5: { 1: 0.519, 2: 0.494, 3: 0.545 },
};

const METACARPAL_JOINT_Y_RATIO = 0.2;

/** Shared 3rd / 5th finger bands on dual-finger atlas panels (fractions of panel width). */
const DUAL_FINGER_BANDS = {
  third: { left: 0.035, right: 0.465 },
  fifth: { left: 0.535, right: 0.965 },
} as const;

const SINGLE_FINGER_BAND = { left: 0.04, right: 0.96 } as const;

/** Thumb (1st digit) atlas panels — joint markers sit right of the printed letter. */
interface PanelStageLayout {
  yRatio: number | number[];
  /** Uniform x within each stage column, or per-stage override for irregular panels. */
  xInColumn: number | number[];
}

/** @deprecated alias */
type ThumbPanelLayout = PanelStageLayout;

/**
 * Ulna stage letters — measured from atlas PNGs (letters left of each drawing).
 * Panel 2 has only F/G/H drawings spread across the strip (not 4 equal columns).
 */
const ULNA_RATING_POSITIONS: Partial<
  Record<Tw3MaturityRating, { xRatio: number; yRatio: number }>
> = {
  B: { xRatio: 0.04, yRatio: 0.493 },
  C: { xRatio: 0.312, yRatio: 0.49 },
  D: { xRatio: 0.556, yRatio: 0.49 },
  E: { xRatio: 0.87, yRatio: 0.487 },
  F: { xRatio: 0.051, yRatio: 0.497 },
  G: { xRatio: 0.443, yRatio: 0.494 },
  H: { xRatio: 0.836, yRatio: 0.482 },
};

const THUMB_PANEL_LAYOUTS: Record<
  "metacarpal_1" | "proximal_phalanx_1" | "distal_phalanx_1",
  Record<number, ThumbPanelLayout>
> = {
  metacarpal_1: {
    0: { yRatio: 0.344, xInColumn: 0.35 },
    1: { yRatio: 0.215, xInColumn: 0.35 },
  },
  proximal_phalanx_1: {
    0: { yRatio: 0.345, xInColumn: 0.35 },
    1: { yRatio: 0.198, xInColumn: [0.448, 0.688, 0.652, 0.352] },
  },
  distal_phalanx_1: {
    0: { yRatio: 0.345, xInColumn: 0.35 },
    1: { yRatio: 0.196, xInColumn: 0.35 },
  },
};

export function getAtlasFingerColumn(landmarkId: Tw3LandmarkId): Tw3AtlasFingerColumn {
  if (landmarkId.endsWith("_5")) return "fifth";
  if (landmarkId.endsWith("_3")) return "third";
  return "single";
}

export interface AtlasStageRadioPosition {
  rating: Tw3MaturityRating;
  panelIndex: number;
  /** 0–1 within the panel image width */
  xRatio: number;
  /** 0–1 within the panel image height */
  yRatio: number;
  /** Whether x/y refer to the circle center or the circle top edge. */
  anchorOrigin: "center" | "top";
}

function stageColumnX(
  band: { left: number; right: number },
  stageIndex: number,
): number {
  const columnWidth = (band.right - band.left) / STAGES_PER_PANEL;
  return band.left + stageIndex * columnWidth + LETTER_X_IN_COLUMN * columnWidth;
}

function resolveStageY(layout: PanelStageLayout, stageIndex: number): number {
  return typeof layout.yRatio === "number"
    ? layout.yRatio
    : layout.yRatio[stageIndex] ?? layout.yRatio[0] ?? 0.5;
}

function thumbStageColumnX(panelLayout: PanelStageLayout, stageIndex: number): number {
  const columnWidth = 1 / STAGES_PER_PANEL;
  const xInColumn =
    typeof panelLayout.xInColumn === "number"
      ? panelLayout.xInColumn
      : panelLayout.xInColumn[stageIndex] ?? 0.35;
  return stageIndex * columnWidth + xInColumn * columnWidth;
}

function dualFingerStageColumnX(
  fingerColumn: "third" | "fifth",
  stageIndex: number,
  fingerXInColumn: Record<"third" | "fifth", number> = FINGER_X_IN_COLUMN,
): number {
  const columnWidth = 1 / STAGES_PER_PANEL;
  return stageIndex * columnWidth + fingerXInColumn[fingerColumn] * columnWidth;
}

function dualFingerStagePosition(
  landmarkId: Tw3LandmarkId,
  fingerColumn: "third" | "fifth",
  panelIndex: number,
  stageIndex: number,
  defaultFingerX: Record<"third" | "fifth", number>,
  defaultYRatio: number,
): Pick<AtlasStageRadioPosition, "xRatio" | "yRatio" | "anchorOrigin"> {
  const ghiX = FIFTH_GHI_PANEL2_X_IN_COLUMN[landmarkId]?.[stageIndex as 1 | 2 | 3];
  if (
    panelIndex === 1 &&
    fingerColumn === "fifth" &&
    stageIndex >= 1 &&
    ghiX !== undefined
  ) {
    const columnWidth = 1 / STAGES_PER_PANEL;
    return {
      xRatio: stageIndex * columnWidth + ghiX * columnWidth,
      yRatio: STAGE_RADIO_Y_RATIO,
      anchorOrigin: "top",
    };
  }
  return {
    xRatio: dualFingerStageColumnX(fingerColumn, stageIndex, defaultFingerX),
    yRatio: defaultYRatio,
    anchorOrigin: "center",
  };
}

function isMiddlePhalanx(landmarkId: Tw3LandmarkId): boolean {
  return landmarkId === "middle_phalanx_3" || landmarkId === "middle_phalanx_5";
}

function isProximalPhalanxDual(landmarkId: Tw3LandmarkId): boolean {
  return landmarkId === "proximal_phalanx_3" || landmarkId === "proximal_phalanx_5";
}

function isMetacarpalDual(landmarkId: Tw3LandmarkId): boolean {
  return landmarkId === "metacarpal_3" || landmarkId === "metacarpal_5";
}

/** Horizontal anchor for 3rd / 5th distal-phalanx dual panels (beside column letters). */
const DISTAL_PHALANX_FINGER_X: Record<"third" | "fifth", number> = {
  third: 0.17,
  fifth: 0.67,
};

/** Vertical anchor for distal-phalanx dual panels (letter row beside each column). */
const DISTAL_PHALANX_Y_RATIO = 0.46;

/** Single-column atlas panels (ulna, radius) — letters sit left of each stage drawing. */
const SINGLE_COLUMN_PANEL_LAYOUTS: Record<number, ThumbPanelLayout> = {
  0: { yRatio: 0.5, xInColumn: 0.15 },
  1: { yRatio: 0.5, xInColumn: 0.15 },
};

function isDistalPhalanxDual(landmarkId: Tw3LandmarkId): boolean {
  return landmarkId === "distal_phalanx_3" || landmarkId === "distal_phalanx_5";
}

function isUlna(landmarkId: Tw3LandmarkId): boolean {
  return landmarkId === "ulna";
}

function isSingleColumnBone(landmarkId: Tw3LandmarkId): boolean {
  return landmarkId === "radius";
}

function letterRowStagePosition(
  fingerColumn: "third" | "fifth",
  stageIndex: number,
): Pick<AtlasStageRadioPosition, "xRatio" | "yRatio" | "anchorOrigin"> {
  const band =
    fingerColumn === "third" ? DUAL_FINGER_BANDS.third : DUAL_FINGER_BANDS.fifth;
  return {
    xRatio: stageColumnX(band, stageIndex),
    yRatio: STAGE_RADIO_Y_RATIO,
    anchorOrigin: "top",
  };
}

/**
 * Per-landmark / per-rating tweaks measured from atlas PNGs where default
 * joint-centered anchors overlap the line drawings.
 */
const LANDMARK_RATING_OVERRIDES: Partial<
  Record<
    Tw3LandmarkId,
    Partial<
      Record<
        Tw3MaturityRating,
        Partial<Pick<AtlasStageRadioPosition, "xRatio" | "yRatio" | "anchorOrigin">>
      >
    >
  >
> = {
  middle_phalanx_3: {
    F: letterRowStagePosition("third", 0),
  },
  middle_phalanx_5: {
    // D column: left of default bone anchor, right of printed letter (~0.55).
    D: { xRatio: 0.618, yRatio: STAGE_RADIO_Y_RATIO, anchorOrigin: "top" },
    E: letterRowStagePosition("fifth", 3),
  },
  distal_phalanx_1: {
    B: { xRatio: 0.087, yRatio: STAGE_RADIO_Y_RATIO, anchorOrigin: "top" },
  },
  distal_phalanx_5: {
    // D column: left of default bone anchor, right of printed letter (~0.55).
    D: { xRatio: 0.618, yRatio: STAGE_RADIO_Y_RATIO, anchorOrigin: "top" },
    E: letterRowStagePosition("fifth", 3),
  },
};

function applyRatingOverride(
  landmarkId: Tw3LandmarkId,
  rating: Tw3MaturityRating,
  position: AtlasStageRadioPosition,
): AtlasStageRadioPosition {
  const override = LANDMARK_RATING_OVERRIDES[landmarkId]?.[rating];
  if (!override) return position;
  return { ...position, ...override };
}

function isThumbLandmark(landmarkId: Tw3LandmarkId): boolean {
  return (
    landmarkId === "metacarpal_1" ||
    landmarkId === "proximal_phalanx_1" ||
    landmarkId === "distal_phalanx_1"
  );
}

/** Atlas description pager index (0 = B–E panel, 1 = F–I panel). */
export function getDescriptionImageIndexForRating(
  rating: Tw3MaturityRating,
): number {
  const panelIndex = RATING_PANEL_INDEX[rating];
  return panelIndex < 0 ? 0 : panelIndex;
}

export function getScrollRatioForRating(
  scrollEl: HTMLDivElement,
  landmarkId: Tw3LandmarkId,
  rating: Tw3MaturityRating,
): number {
  const anchor = getAtlasStageRadioPositions(landmarkId).find(
    (pos) => pos.rating === rating,
  );
  if (!anchor) return 0;

  const panelEls = scrollEl.querySelectorAll<HTMLElement>("[data-atlas-panel]");
  if (panelEls.length === 0) return 0;

  let anchorX = 0;
  for (let i = 0; i < anchor.panelIndex; i++) {
    anchorX += panelEls[i]?.offsetWidth ?? 0;
  }
  const panel = panelEls[anchor.panelIndex];
  if (!panel) return 0;
  anchorX += panel.offsetWidth * anchor.xRatio;

  const maxScroll = scrollEl.scrollWidth - scrollEl.clientWidth;
  if (maxScroll <= 0) return 0;

  const targetScroll = anchorX - scrollEl.clientWidth / 2;
  return Math.min(1, Math.max(0, targetScroll / maxScroll));
}

export function getAtlasStageRadioPositions(
  landmarkId: Tw3LandmarkId,
): AtlasStageRadioPosition[] {
  const ratings: Tw3MaturityRating[] = ["B", "C", "D", "E", "F", "G", "H", "I"];
  const fingerColumn = getAtlasFingerColumn(landmarkId);

  if (isThumbLandmark(landmarkId)) {
    const thumbLayouts =
      THUMB_PANEL_LAYOUTS[landmarkId as keyof typeof THUMB_PANEL_LAYOUTS];
    return ratings.map((rating) => {
      const panelIndex = RATING_PANEL_INDEX[rating];
      const stageIndex = RATING_STAGE_INDEX[rating];
      const panelLayout = thumbLayouts[panelIndex];
      return applyRatingOverride(landmarkId, rating, {
        rating,
        panelIndex,
        xRatio: thumbStageColumnX(panelLayout, stageIndex),
        yRatio: resolveStageY(panelLayout, stageIndex),
        anchorOrigin: "center",
      });
    });
  }

  if (isProximalPhalanxDual(landmarkId) && fingerColumn !== "single") {
    return ratings.map((rating) => {
      const panelIndex = RATING_PANEL_INDEX[rating];
      const stageIndex = RATING_STAGE_INDEX[rating];
      const yRatio =
        panelIndex === 0
          ? PROXIMAL_PHALANX_MCP_Y_RATIO
          : PROXIMAL_PHALANX_MCP_Y_RATIO_PANEL2;
      return applyRatingOverride(landmarkId, rating, {
        rating,
        panelIndex,
        xRatio: dualFingerStageColumnX(
          fingerColumn,
          stageIndex,
          PROXIMAL_PHALANX_FINGER_X,
        ),
        yRatio,
        anchorOrigin: "center",
      });
    });
  }

  if (isMetacarpalDual(landmarkId) && fingerColumn !== "single") {
    return ratings.map((rating) => {
      const panelIndex = RATING_PANEL_INDEX[rating];
      const stageIndex = RATING_STAGE_INDEX[rating];
      const pos = dualFingerStagePosition(
        landmarkId,
        fingerColumn,
        panelIndex,
        stageIndex,
        METACARPAL_FINGER_X,
        METACARPAL_JOINT_Y_RATIO,
      );
      return applyRatingOverride(landmarkId, rating, {
        rating,
        panelIndex,
        xRatio: pos.xRatio,
        yRatio: pos.yRatio,
        anchorOrigin: pos.anchorOrigin,
      });
    });
  }

  if (isMiddlePhalanx(landmarkId) && fingerColumn !== "single") {
    return ratings.map((rating) => {
      const panelIndex = RATING_PANEL_INDEX[rating];
      const stageIndex = RATING_STAGE_INDEX[rating];
      const pos = dualFingerStagePosition(
        landmarkId,
        fingerColumn,
        panelIndex,
        stageIndex,
        FINGER_X_IN_COLUMN,
        MIDDLE_PHALANX_PIP_Y_RATIO,
      );
      return applyRatingOverride(landmarkId, rating, {
        rating,
        panelIndex,
        xRatio: pos.xRatio,
        yRatio: pos.yRatio,
        anchorOrigin: pos.anchorOrigin,
      });
    });
  }

  if (isDistalPhalanxDual(landmarkId) && fingerColumn !== "single") {
    return ratings.map((rating) => {
      const panelIndex = RATING_PANEL_INDEX[rating];
      const stageIndex = RATING_STAGE_INDEX[rating];
      const pos = dualFingerStagePosition(
        landmarkId,
        fingerColumn,
        panelIndex,
        stageIndex,
        DISTAL_PHALANX_FINGER_X,
        DISTAL_PHALANX_Y_RATIO,
      );
      return applyRatingOverride(landmarkId, rating, {
        rating,
        panelIndex,
        xRatio: pos.xRatio,
        yRatio: pos.yRatio,
        anchorOrigin: pos.anchorOrigin,
      });
    });
  }

  if (isUlna(landmarkId)) {
    return ratings.map((rating) => {
      const panelIndex = RATING_PANEL_INDEX[rating];
      const pos = ULNA_RATING_POSITIONS[rating];
      return {
        rating,
        panelIndex,
        xRatio: pos?.xRatio ?? thumbStageColumnX(SINGLE_COLUMN_PANEL_LAYOUTS[panelIndex], RATING_STAGE_INDEX[rating]),
        yRatio: pos?.yRatio ?? resolveStageY(SINGLE_COLUMN_PANEL_LAYOUTS[panelIndex], RATING_STAGE_INDEX[rating]),
        anchorOrigin: "center",
      };
    });
  }

  if (isSingleColumnBone(landmarkId)) {
    return ratings.map((rating) => {
      const panelIndex = RATING_PANEL_INDEX[rating];
      const stageIndex = RATING_STAGE_INDEX[rating];
      const panelLayout = SINGLE_COLUMN_PANEL_LAYOUTS[panelIndex];
      return {
        rating,
        panelIndex,
        xRatio: thumbStageColumnX(panelLayout, stageIndex),
        yRatio: resolveStageY(panelLayout, stageIndex),
        anchorOrigin: "center",
      };
    });
  }

  const band =
    fingerColumn === "third"
      ? DUAL_FINGER_BANDS.third
      : fingerColumn === "fifth"
        ? DUAL_FINGER_BANDS.fifth
        : SINGLE_FINGER_BAND;

  return ratings.map((rating) => {
    const panelIndex = RATING_PANEL_INDEX[rating];
    const stageIndex = RATING_STAGE_INDEX[rating];
    return {
      rating,
      panelIndex,
      xRatio: stageColumnX(band, stageIndex),
      yRatio: STAGE_RADIO_Y_RATIO,
      anchorOrigin: "top",
    };
  });
}
