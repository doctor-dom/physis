import type { ParentalInputMode } from "../calculators/parentalStature";
import type { Tw3MenarchalStatus } from "../calculators/tw3/calculateTw3PredictedHeight";
import type { Tw3LandmarkId, Tw3MaturityRating } from "../calculators/tw3/types";
import type { Sex } from "../types";

export type ShowWorkMethod =
  | "tw3"
  | "adjusted-rwt"
  | "original-rwt"
  | "khamis-roche";

export type QcSeverity = "error" | "warning";

export interface QcIssue {
  id: string;
  severity: QcSeverity;
  message: string;
  troubleshooting: string;
  suggestedFix?: string;
}

export interface ShowWorkLandmarkRow {
  landmarkId: Tw3LandmarkId;
  label: string;
  rating: Tw3MaturityRating;
  smsPoints: number;
}

export interface InterpolationBracket {
  lower: { x: number; y: number };
  upper: { x: number; y: number };
  target: number;
  result: number;
  formula: string;
}

export interface Tw3WorkSection {
  landmarkRows: ShowWorkLandmarkRow[];
  smsTotal: number;
  boneAgeFromSms: number;
  smsInterpolation: InterpolationBracket;
  enteredBoneAgeYears: number;
  completedLandmarks: number;
  totalLandmarks: number;
}

export interface ParentalWorkSection {
  fatherCm?: number;
  motherCm?: number;
  parentalSumCm: number;
  sex: Sex;
  inputMode: ParentalInputMode;
  mphDirectCm?: number;
  derivedFromMph: boolean;
  mphFormula: string;
  mphCm: number;
  mpsFormula: string;
  mpsCm: number;
  mphRangeLowCm: number;
  mphRangeHighCm: number;
}

export interface CoefficientTerm {
  name: string;
  symbol: string;
  value: number;
  coefficient: number;
  product: number;
}

export interface PredictionWorkSection {
  method: ShowWorkMethod;
  methodLabel: string;
  equation: string;
  terms: CoefficientTerm[];
  intercept: number;
  predictedCm: number;
  displayedCm: number | null;
  chronAgeYears: number;
  coefficientInterpolation?: InterpolationBracket[];
  coefficientTableRows?: { ageYears: number; coefficients: Record<string, number> }[];
  heightAdjustmentCm?: number;
  heightUsedCm?: number;
  unitConversions?: { label: string; value: string }[];
}

export interface ReferenceAsset {
  title: string;
  src: string;
  alt: string;
}

export interface ShowWorkReport {
  qcPassed: boolean;
  qcIssues: QcIssue[];
  tw3Used: boolean;
  tw3Section: Tw3WorkSection | null;
  parentalSection: ParentalWorkSection | null;
  predictionSection: PredictionWorkSection | null;
  references: ReferenceAsset[];
}

export interface ShowWorkInput {
  sex: Sex;
  chronAgeYears: string;
  boneAgeYears: string;
  boneAgeFromTw3: boolean;
  fatherCm: string;
  motherCm: string;
  parentalInputMode: ParentalInputMode;
  mphDirectCm: string;
  heightCm: string;
  weightKg: string;
  heightIsStandingVertical: boolean;
  menarchalStatus?: Tw3MenarchalStatus | null;
  tw3ApplyMphAdjustment?: boolean;
  method: ShowWorkMethod;
  ratings: Partial<Record<Tw3LandmarkId, Tw3MaturityRating>>;
  displayedPredictionCm: number | null;
}
