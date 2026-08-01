import type { GrowthChartPlotData } from "./growthChartTypes";

export const CDC_CHART_VIEW_STORAGE_KEY = "physis-cdc-chart-view";

export interface GrowthChartViewPayload {
  sex: "male" | "female";
  data: GrowthChartPlotData;
}

export function saveGrowthChartViewPayload(payload: GrowthChartViewPayload): void {
  localStorage.setItem(CDC_CHART_VIEW_STORAGE_KEY, JSON.stringify(payload));
}

export function loadGrowthChartViewPayload(): GrowthChartViewPayload | null {
  const raw = localStorage.getItem(CDC_CHART_VIEW_STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as GrowthChartViewPayload;
  } catch {
    return null;
  }
}

export function openGrowthChartViewer(payload: GrowthChartViewPayload): void {
  saveGrowthChartViewPayload(payload);
  window.open("/growth/chart-view", "_blank", "noopener,noreferrer");
}
