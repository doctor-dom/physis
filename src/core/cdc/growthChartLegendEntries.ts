import type { GrowthChartPlotData } from "@core/cdc/growthChartTypes";

export type LegendIconKind = "blue-dot" | "orange-dot" | "arrow" | "star" | "diamond";

export interface GrowthChartLegendEntry {
  icon: LegendIconKind;
  label: string;
  value: string;
}

export function getGrowthChartLegendEntries(
  data: GrowthChartPlotData,
): GrowthChartLegendEntry[] {
  const mpsUsedInCalculation =
    data.parentalStatureUsedInCalculation === "MPS";
  const boneAgeShiftYears = data.boneAgeYears - data.chronAgeYears;
  const boneAgeShiftLabel =
    boneAgeShiftYears === 0
      ? "0 y (aligned)"
      : `${boneAgeShiftYears > 0 ? "+" : ""}${boneAgeShiftYears.toFixed(1)} y`;

  return [
    {
      icon: "blue-dot",
      label: "Height at chronological age",
      value: `${data.chronAgeYears.toFixed(1)} y · ${data.heightCm.toFixed(1)} cm`,
    },
    {
      icon: "blue-dot",
      label: "Weight at chronological age",
      value: `${data.chronAgeYears.toFixed(1)} y · ${data.weightKg.toFixed(1)} kg`,
    },
    {
      icon: "orange-dot",
      label: "Height at bone age",
      value: `${data.boneAgeYears.toFixed(1)} y · ${data.heightCm.toFixed(1)} cm`,
    },
    {
      icon: "arrow",
      label: "Bone age shift",
      value: boneAgeShiftLabel,
    },
    {
      icon: "star",
      label: "Mid-parental height (MPH)",
      value: mpsUsedInCalculation
        ? `${data.mphCm.toFixed(1)} cm (MPS ${data.mpsCm.toFixed(1)} cm in ${data.methodLabel})`
        : `${data.mphCm.toFixed(1)} cm · ${data.methodLabel}`,
    },
    {
      icon: "diamond",
      label: "Predicted adult height (PAH)",
      value: `${data.predictedAdultHeightCm.toFixed(1)} cm · ${data.methodLabel}`,
    },
  ];
}

/** Margin box in native CDC chart coordinates (upper-left whitespace). */
export const CDC_CHART_MARGIN_LEGEND = {
  x: 240,
  y: 260,
  width: 4000,
  height: 1980,
  padding: 96,
  titleSize: 110,
  summarySize: 90,
  labelSize: 88,
  valueSize: 84,
  lineHeight: 108,
  iconSize: 68,
  iconGap: 24,
  columns: 2,
} as const;
