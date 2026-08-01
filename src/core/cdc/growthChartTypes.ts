export interface GrowthChartPlotData {
  chronAgeYears: number;
  boneAgeYears: number;
  heightCm: number;
  weightKg: number;
  mphCm: number;
  mpsCm: number;
  /** Parental stature term used in the PAH equation (MPH or MPS). */
  parentalStatureUsedInCalculation: "MPH" | "MPS";
  predictedAdultHeightCm: number;
  methodLabel: string;
}
