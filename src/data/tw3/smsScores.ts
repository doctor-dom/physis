import type { Tw3LandmarkId, Tw3MaturityRating } from "../../core/calculators/tw3/types";

export type Tw3SmsScoreTable = Record<
  Tw3LandmarkId,
  Partial<Record<Tw3MaturityRating, number>>
>;

/** Table A5 — RUS bone maturity scores, boys */
export const tw3SmsScoresBoys: Tw3SmsScoreTable = {
  radius: { A: 0, B: 16, C: 21, D: 30, E: 39, F: 59, G: 87, H: 138, I: 213 },
  ulna: { A: 0, B: 27, C: 30, D: 32, E: 40, F: 58, G: 107, H: 181 },
  metacarpal_1: { A: 0, B: 6, C: 9, D: 14, E: 21, F: 26, G: 36, H: 49, I: 67 },
  metacarpal_3: { A: 0, B: 4, C: 5, D: 9, E: 12, F: 19, G: 31, H: 43, I: 52 },
  metacarpal_5: { A: 0, B: 4, C: 6, D: 9, E: 14, F: 18, G: 29, H: 43, I: 52 },
  proximal_phalanx_1: { A: 0, B: 7, C: 8, D: 11, E: 17, F: 26, G: 38, H: 52, I: 67 },
  proximal_phalanx_3: { A: 0, B: 4, C: 4, D: 9, E: 15, F: 23, G: 31, H: 40, I: 53 },
  proximal_phalanx_5: { A: 0, B: 4, C: 5, D: 9, E: 15, F: 21, G: 30, H: 39, I: 51 },
  middle_phalanx_3: { A: 0, B: 4, C: 6, D: 9, E: 15, F: 22, G: 32, H: 43, I: 52 },
  middle_phalanx_5: { A: 0, B: 6, C: 7, D: 9, E: 15, F: 23, G: 32, H: 42, I: 49 },
  distal_phalanx_1: { A: 0, B: 5, C: 6, D: 11, E: 17, F: 26, G: 38, H: 46, I: 66 },
  distal_phalanx_3: { A: 0, B: 4, C: 6, D: 8, E: 13, F: 18, G: 28, H: 34, I: 49 },
  distal_phalanx_5: { A: 0, B: 5, C: 6, D: 9, E: 13, F: 18, G: 27, H: 34, I: 48 },
};

/** Table A6 — RUS bone maturity scores, girls */
export const tw3SmsScoresGirls: Tw3SmsScoreTable = {
  radius: { A: 0, B: 23, C: 30, D: 44, E: 56, F: 78, G: 114, H: 160, I: 218 },
  ulna: { A: 0, B: 30, C: 33, D: 37, E: 45, F: 74, G: 118, H: 173 },
  metacarpal_1: { A: 0, B: 8, C: 12, D: 18, E: 24, F: 31, G: 43, H: 53, I: 67 },
  metacarpal_3: { A: 0, B: 5, C: 8, D: 12, E: 16, F: 23, G: 37, H: 47, I: 53 },
  metacarpal_5: { A: 0, B: 6, C: 9, D: 12, E: 17, F: 23, G: 35, H: 48, I: 52 },
  proximal_phalanx_1: { A: 0, B: 9, C: 11, D: 14, E: 20, F: 31, G: 44, H: 56, I: 67 },
  proximal_phalanx_3: { A: 0, B: 5, C: 7, D: 12, E: 19, F: 27, G: 37, H: 44, I: 54 },
  proximal_phalanx_5: { A: 0, B: 6, C: 7, D: 12, E: 18, F: 26, G: 35, H: 42, I: 51 },
  middle_phalanx_3: { A: 0, B: 6, C: 8, D: 12, E: 18, F: 27, G: 36, H: 45, I: 52 },
  middle_phalanx_5: { A: 0, B: 7, C: 8, D: 12, E: 18, F: 28, G: 35, H: 43, I: 49 },
  distal_phalanx_1: { A: 0, B: 7, C: 9, D: 15, E: 22, F: 33, G: 48, H: 51, I: 68 },
  distal_phalanx_3: { A: 0, B: 7, C: 8, D: 11, E: 15, F: 22, G: 33, H: 37, I: 49 },
  distal_phalanx_5: { A: 0, B: 7, C: 8, D: 11, E: 15, F: 22, G: 32, H: 36, I: 47 },
};

export function getTw3SmsScores(sex: "male" | "female"): Tw3SmsScoreTable {
  return sex === "male" ? tw3SmsScoresBoys : tw3SmsScoresGirls;
}
