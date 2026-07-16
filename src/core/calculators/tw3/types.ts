export const TW3_MATURITY_RATINGS = [
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "I",
] as const;

export type Tw3MaturityRating = (typeof TW3_MATURITY_RATINGS)[number];

export const TW3_RUS_LANDMARKS = [
  { id: "radius", label: "Radius", shortLabel: "R" },
  { id: "ulna", label: "Ulna", shortLabel: "U" },
  { id: "metacarpal_1", label: "1st metacarpal", shortLabel: "1st MC" },
  { id: "metacarpal_3", label: "3rd metacarpal", shortLabel: "3rd MC" },
  { id: "metacarpal_5", label: "5th metacarpal", shortLabel: "5th MC" },
  { id: "proximal_phalanx_1", label: "1st proximal phalanx", shortLabel: "1st PP" },
  { id: "proximal_phalanx_3", label: "3rd proximal phalanx", shortLabel: "3rd PP" },
  { id: "proximal_phalanx_5", label: "5th proximal phalanx", shortLabel: "5th PP" },
  { id: "middle_phalanx_3", label: "3rd middle phalanx", shortLabel: "3rd MP" },
  { id: "middle_phalanx_5", label: "5th middle phalanx", shortLabel: "5th MP" },
  { id: "distal_phalanx_1", label: "1st distal phalanx", shortLabel: "1st DP" },
  { id: "distal_phalanx_3", label: "3rd distal phalanx", shortLabel: "3rd DP" },
  { id: "distal_phalanx_5", label: "5th distal phalanx", shortLabel: "5th DP" },
] as const;

export type Tw3LandmarkId = (typeof TW3_RUS_LANDMARKS)[number]["id"];

export interface Tw3LandmarkReference {
  landmarkId: Tw3LandmarkId;
  rating: Tw3MaturityRating;
  imagePath?: string;
  description?: string;
}
