export type Sex = "male" | "female";

export interface CalculatorResult<T> {
  value: T;
  interpretation?: string;
  warning?: string;
}

export interface ChartPoint {
  x: number;
  y: number;
}

export interface AgeChartRow {
  ageYears: number;
  values: Record<string, number>;
}
