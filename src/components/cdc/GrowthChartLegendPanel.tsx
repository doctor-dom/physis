import type { GrowthChartPlotData } from "@core/cdc/growthChartTypes";
import type { CdcGrowthChartDefinition } from "../../data/cdc/chartManifest";
import { getGrowthChartLegendEntries } from "@core/cdc/growthChartLegendEntries";

interface GrowthChartLegendPanelProps {
  data: GrowthChartPlotData;
  chart: CdcGrowthChartDefinition;
  compact?: boolean;
  className?: string;
}

function LegendIcon({
  kind,
}: {
  kind: "blue-dot" | "orange-dot" | "arrow" | "star" | "diamond";
}) {
  switch (kind) {
    case "blue-dot":
      return (
        <span
          aria-hidden
          className="cdc-chart-legend-icon inline-block h-3 w-3 shrink-0 rounded-full bg-blue-600 ring-2 ring-white"
        />
      );
    case "orange-dot":
      return (
        <span
          aria-hidden
          className="cdc-chart-legend-icon inline-block h-3 w-3 shrink-0 rounded-full bg-orange-600 ring-2 ring-white"
        />
      );
    case "arrow":
      return (
        <span aria-hidden className="cdc-chart-legend-icon shrink-0 text-sm font-bold text-orange-700">
          →
        </span>
      );
    case "star":
      return (
        <span aria-hidden className="cdc-chart-legend-icon shrink-0 text-sm text-amber-500">
          ★
        </span>
      );
    case "diamond":
      return (
        <span
          aria-hidden
          className="cdc-chart-legend-icon inline-block h-3 w-3 shrink-0 rotate-45 bg-violet-600 ring-2 ring-white"
        />
      );
  }
}

function LegendItem({
  icon,
  title,
  detail,
  compact,
}: {
  icon: "blue-dot" | "orange-dot" | "arrow" | "star" | "diamond";
  title: string;
  detail: string;
  compact?: boolean;
}) {
  return (
    <li className={`flex items-start gap-2 ${compact ? "" : "rounded-md border border-teal-100 bg-teal-50/40 p-2"}`}>
      <span className="mt-0.5">{<LegendIcon kind={icon} />}</span>
      <span className="min-w-0">
        <span className={`block font-medium text-teal-950 ${compact ? "text-xs" : "text-sm"}`}>
          {title}
        </span>
        {!compact ? (
          <span className="mt-0.5 block text-xs leading-snug text-teal-800">{detail}</span>
        ) : null}
      </span>
    </li>
  );
}

export default function GrowthChartLegendPanel({
  data,
  chart,
  compact = false,
  className = "",
}: GrowthChartLegendPanelProps) {
  const items = getGrowthChartLegendEntries(data).map((entry) => ({
    icon: entry.icon,
    title: entry.label,
    detail: entry.value,
    compactLabel:
      entry.icon === "blue-dot" && entry.label.startsWith("Height at chronological")
        ? `Height (${data.heightCm.toFixed(1)} cm) & weight (${data.weightKg.toFixed(1)} kg) at chron age ${data.chronAgeYears.toFixed(1)} y`
        : entry.icon === "orange-dot"
          ? `Height at bone age (${data.boneAgeYears.toFixed(1)} y)`
          : entry.icon === "star"
            ? `MPH ${data.mphCm.toFixed(1)} cm @ ${chart.endOfGrowthAgeYears} y`
            : entry.icon === "diamond"
              ? `PAH ${data.predictedAdultHeightCm.toFixed(1)} cm @ ${chart.endOfGrowthAgeYears} y`
              : entry.icon === "arrow"
                ? "Bone age shift"
                : undefined,
  }));

  const compactItems = items.filter(
    (item) => item.compactLabel ?? item.title !== "Weight at chronological age",
  );

  if (compact) {
    return (
      <div className={className}>
        <ul className="flex flex-wrap gap-x-4 gap-y-1">
          {compactItems.map((item) => (
            <li key={item.title} className="flex items-center gap-1.5 text-xs text-teal-900">
              <LegendIcon kind={item.icon} />
              <span>{item.compactLabel ?? item.title}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div className={`cdc-chart-legend-print space-y-3 ${className}`}>
      <div className="cdc-chart-legend-print-header border-b border-teal-200 pb-2">
        <h1 className="text-base font-bold text-teal-950">{chart.label}</h1>
        <p className="mt-1 text-xs text-teal-800">
          Adult height prediction method: <strong>{data.methodLabel}</strong>
        </p>
      </div>

      <div className="cdc-chart-legend-patient-summary grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-teal-900 sm:grid-cols-3">
        <p>
          <span className="font-semibold text-teal-950">Chron age:</span>{" "}
          {data.chronAgeYears.toFixed(1)} y
        </p>
        <p>
          <span className="font-semibold text-teal-950">Bone age:</span>{" "}
          {data.boneAgeYears.toFixed(1)} y
        </p>
        <p>
          <span className="font-semibold text-teal-950">Height:</span>{" "}
          {data.heightCm.toFixed(1)} cm
        </p>
        <p>
          <span className="font-semibold text-teal-950">Weight:</span>{" "}
          {data.weightKg.toFixed(1)} kg
        </p>
        <p>
          <span className="font-semibold text-teal-950">MPH:</span>{" "}
          {data.mphCm.toFixed(1)} cm
        </p>
        <p>
          <span className="font-semibold text-teal-950">PAH:</span>{" "}
          {data.predictedAdultHeightCm.toFixed(1)} cm
        </p>
      </div>

      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wide text-teal-700">
          Plotted markers
        </p>
        <ul className="mt-2 grid gap-2 sm:grid-cols-2">
          {items.map((item, index) => (
            <LegendItem
              key={`${item.icon}-${index}`}
              icon={item.icon}
              title={item.title}
              detail={item.detail}
            />
          ))}
        </ul>
      </div>
    </div>
  );
}
