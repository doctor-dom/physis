import type { Tw3LandmarkId } from "../../core/calculators/tw3/types";

export type HandRegionStatus = "pending" | "active" | "complete";

export interface Tw3HandRegion {
  id: Tw3LandmarkId;
  /** SVG path in `hand graphic.png` pixel coordinates (6000×4200). */
  d: string;
  /** Display title for scoring panel */
  scoringTitle: string;
}

/** Full raster dimensions of `data/atlas/hand graphic.png`. */
export const TW3_HAND_VIEWBOX = { width: 6000, height: 4200 };

/**
 * Cropped viewBox around hand content (removes black padding so the graphic scales up).
 */
export const TW3_HAND_CONTENT_BBOX = {
  x: 2040,
  y: 110,
  width: 1920,
  height: 3700,
};

/** Modest padding so regions stay inside bone silhouettes. */
const HIT_SCALE = 1.05;

/** Joint-gap targets stay inside the pale cartilage band between bones. */
const JOINT_HIT_SCALE = 1;

function rectPath(
  cx: number,
  cy: number,
  w: number,
  h: number,
  scale = HIT_SCALE,
): string {
  const hw = (w * scale) / 2;
  const hh = (h * scale) / 2;
  const x1 = Math.round(cx - hw);
  const y1 = Math.round(cy - hh);
  const x2 = Math.round(cx + hw);
  const y2 = Math.round(cy + hh);
  return `M ${x1} ${y1} L ${x2} ${y1} L ${x2} ${y2} L ${x1} ${y2} Z`;
}

function polygonPath(points: Array<[number, number]>): string {
  const cx = points.reduce((sum, [x]) => sum + x, 0) / points.length;
  const cy = points.reduce((sum, [, y]) => sum + y, 0) / points.length;
  const expanded = points.map(([x, y]) => [
    Math.round(cx + (x - cx) * HIT_SCALE),
    Math.round(cy + (y - cy) * HIT_SCALE),
  ] as [number, number]);
  const [first, ...rest] = expanded;
  return `M ${first[0]} ${first[1]} ${rest.map(([x, y]) => `L ${x} ${y}`).join(" ")} Z`;
}

/**
 * Click targets mapped onto `hand graphic.png` (6000×4200).
 * Sized to fit within individual bone segments without overlapping neighbors.
 */
export const TW3_HAND_REGIONS: Tw3HandRegion[] = [
  {
    id: "radius",
    /** Radial shaft + styloid; left edge kept clear of ulna. */
    d: polygonPath([
      [2825, 3180],
      [2895, 3175],
      [3084, 3355],
      [2825, 3370],
    ]),
    scoringTitle: "Radius",
  },
  {
    id: "ulna",
    d: polygonPath([
      [2288, 3140],
      [2759, 3125],
      [2759, 3340],
      [2288, 3325],
    ]),
    scoringTitle: "Ulna",
  },
  {
    id: "metacarpal_1",
    /** CMC joint — thumb metacarpal base at the wrist. */
    d: rectPath(3265, 2885, 220, 110, JOINT_HIT_SCALE),
    scoringTitle: "1st metacarpal",
  },
  {
    id: "proximal_phalanx_1",
    /** MCP joint between proximal phalanx and metacarpal. */
    d: rectPath(3603, 2220, 280, 95, JOINT_HIT_SCALE),
    scoringTitle: "Proximal phalanx (I)",
  },
  {
    id: "distal_phalanx_1",
    /** IP joint between distal and proximal phalanx. */
    d: rectPath(3765, 1778, 200, 85, JOINT_HIT_SCALE),
    scoringTitle: "Distal phalanx (I)",
  },
  {
    id: "metacarpal_3",
    /** Just below 3rd proximal phalanx. */
    d: rectPath(2900, 1910, 220, 480),
    scoringTitle: "3rd metacarpal",
  },
  {
    id: "proximal_phalanx_3",
    d: rectPath(2936, 1444, 210, 360),
    scoringTitle: "Proximal phalanx (III)",
  },
  {
    id: "middle_phalanx_3",
    d: rectPath(2960, 925, 190, 310),
    scoringTitle: "Middle phalanx (III)",
  },
  {
    id: "distal_phalanx_3",
    d: rectPath(3000, 423, 180, 340),
    scoringTitle: "Distal phalanx (III)",
  },
  {
    id: "metacarpal_5",
    d: rectPath(2300, 2006, 155, 360),
    scoringTitle: "5th metacarpal",
  },
  {
    id: "proximal_phalanx_5",
    /** Just above 5th metacarpal. */
    d: rectPath(2300, 1675, 145, 270),
    scoringTitle: "Proximal phalanx (V)",
  },
  {
    id: "middle_phalanx_5",
    d: rectPath(2235, 1365, 135, 185),
    scoringTitle: "Middle phalanx (V)",
  },
  {
    id: "distal_phalanx_5",
    d: rectPath(2205, 957, 130, 195),
    scoringTitle: "Distal phalanx (V)",
  },
];

export function getHandRegionFill(status: HandRegionStatus): string {
  switch (status) {
    case "active":
      return "#facc15";
    case "complete":
      return "#22c55e";
    default:
      return "#ffffff";
  }
}

export function getHandRegionFillOpacity(status: HandRegionStatus): number {
  switch (status) {
    case "active":
      return 0.55;
    case "complete":
      return 0.5;
    default:
      return 0.4;
  }
}

export function getHandRegionStroke(status: HandRegionStatus): string {
  switch (status) {
    case "active":
      return "#a16207";
    case "complete":
      return "#15803d";
    default:
      return "#94a3b8";
  }
}

export function getHandRegionStrokeWidth(status: HandRegionStatus): number {
  switch (status) {
    case "active":
      return 6;
    case "complete":
      return 4;
    default:
      return 2;
  }
}
