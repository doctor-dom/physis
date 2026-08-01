import type { GrowthChartPlotData } from "@core/cdc/growthChartTypes";
import type { CdcGrowthChartDefinition } from "../../data/cdc/chartManifest";
import {
  CDC_CHART_MARGIN_LEGEND,
  getGrowthChartLegendEntries,
  type LegendIconKind,
} from "@core/cdc/growthChartLegendEntries";

const LEGEND = CDC_CHART_MARGIN_LEGEND;

function LegendMarkerIcon({
  kind,
  cx,
  cy,
  size,
}: {
  kind: LegendIconKind;
  cx: number;
  cy: number;
  size: number;
}) {
  switch (kind) {
    case "blue-dot":
      return (
        <circle
          cx={cx}
          cy={cy}
          r={size * 0.42}
          fill="#2563eb"
          fillOpacity={0.85}
          stroke="#fff"
          strokeWidth={size * 0.08}
        />
      );
    case "orange-dot":
      return (
        <circle
          cx={cx}
          cy={cy}
          r={size * 0.42}
          fill="#ea580c"
          fillOpacity={0.85}
          stroke="#fff"
          strokeWidth={size * 0.08}
        />
      );
    case "arrow":
      return (
        <g transform={`translate(${cx - size * 0.55}, ${cy - size * 0.18})`}>
          <line
            x1={0}
            y1={size * 0.18}
            x2={size * 0.72}
            y2={size * 0.18}
            stroke="#c2410c"
            strokeWidth={size * 0.12}
          />
          <polygon
            points={`${size * 0.72},${size * 0.18} ${size * 0.52},${size * 0.04} ${size * 0.52},${size * 0.32}`}
            fill="#c2410c"
          />
        </g>
      );
    case "star": {
      const points = Array.from({ length: 10 }, (_, i) => {
        const angle = (Math.PI / 2) * -1 + (i * Math.PI) / 5;
        const radius = i % 2 === 0 ? size * 0.45 : size * 0.2;
        return `${cx + Math.cos(angle) * radius},${cy + Math.sin(angle) * radius}`;
      }).join(" ");
      return (
        <polygon
          points={points}
          fill="#f59e0b"
          fillOpacity={0.85}
          stroke="#92400e"
          strokeWidth={size * 0.08}
        />
      );
    }
    case "diamond": {
      const half = size * 0.4;
      return (
        <polygon
          points={`${cx},${cy - half} ${cx + half},${cy} ${cx},${cy + half} ${cx - half},${cy}`}
          fill="#7c3aed"
          fillOpacity={0.85}
          stroke="#4c1d95"
          strokeWidth={size * 0.08}
        />
      );
    }
  }
}

interface GrowthChartSvgMarginLegendProps {
  data: GrowthChartPlotData;
  chart: CdcGrowthChartDefinition;
}

export default function GrowthChartSvgMarginLegend({
  data,
  chart,
}: GrowthChartSvgMarginLegendProps) {
  const entries = getGrowthChartLegendEntries(data);
  const innerWidth = LEGEND.width - LEGEND.padding * 2;
  const columnWidth = innerWidth / LEGEND.columns;
  const rowHeight = LEGEND.lineHeight * 2.45;

  const headerBottom =
    LEGEND.y +
    LEGEND.padding +
    LEGEND.titleSize +
    LEGEND.lineHeight * 2.65 +
    LEGEND.lineHeight * 0.5;

  return (
    <g aria-label="Plotted marker legend" className="cdc-chart-margin-legend">
      <rect
        x={LEGEND.x}
        y={LEGEND.y}
        width={LEGEND.width}
        height={LEGEND.height}
        rx={40}
        fill="#ffffff"
        fillOpacity={0.94}
        stroke="#0f766e"
        strokeWidth={8}
      />

      <text
        x={LEGEND.x + LEGEND.padding}
        y={LEGEND.y + LEGEND.padding + LEGEND.titleSize * 0.82}
        fill="#134e4a"
        fontSize={LEGEND.titleSize}
        fontWeight={700}
        fontFamily="Segoe UI, system-ui, sans-serif"
      >
        Plotted markers
      </text>

      <text
        x={LEGEND.x + LEGEND.padding}
        y={LEGEND.y + LEGEND.padding + LEGEND.titleSize + LEGEND.lineHeight * 0.85}
        fill="#115e59"
        fontSize={LEGEND.summarySize}
        fontWeight={600}
        fontFamily="Segoe UI, system-ui, sans-serif"
      >
        CA {data.chronAgeYears.toFixed(1)} y · BA {data.boneAgeYears.toFixed(1)} y · Ht{" "}
        {data.heightCm.toFixed(1)} cm · Wt {data.weightKg.toFixed(1)} kg · MPH{" "}
        {data.mphCm.toFixed(1)} cm · PAH {data.predictedAdultHeightCm.toFixed(1)} cm
      </text>

      <text
        x={LEGEND.x + LEGEND.padding}
        y={LEGEND.y + LEGEND.padding + LEGEND.titleSize + LEGEND.lineHeight * 1.75}
        fill="#0f766e"
        fontSize={LEGEND.valueSize}
        fontFamily="Segoe UI, system-ui, sans-serif"
      >
        {data.methodLabel} · age {chart.endOfGrowthAgeYears} y endpoints
      </text>

      <line
        x1={LEGEND.x + LEGEND.padding}
        y1={headerBottom}
        x2={LEGEND.x + LEGEND.width - LEGEND.padding}
        y2={headerBottom}
        stroke="#99f6e4"
        strokeWidth={6}
      />

      {entries.map((entry, index) => {
        const column = index % LEGEND.columns;
        const row = Math.floor(index / LEGEND.columns);
        const cellX = LEGEND.x + LEGEND.padding + column * columnWidth;
        const cellY = headerBottom + LEGEND.lineHeight * 0.65 + row * rowHeight;
        const iconCx = cellX + LEGEND.iconSize * 0.5;
        const iconCy = cellY + LEGEND.iconSize * 0.45;
        const textX = cellX + LEGEND.iconSize + LEGEND.iconGap;

        return (
          <g key={entry.label}>
            <LegendMarkerIcon kind={entry.icon} cx={iconCx} cy={iconCy} size={LEGEND.iconSize} />
            <text
              x={textX}
              y={cellY + LEGEND.labelSize * 0.35}
              fill="#134e4a"
              fontSize={LEGEND.labelSize}
              fontWeight={600}
              fontFamily="Segoe UI, system-ui, sans-serif"
            >
              {entry.label}
            </text>
            <text
              x={textX}
              y={cellY + LEGEND.labelSize + LEGEND.valueSize * 0.95}
              fill="#115e59"
              fontSize={LEGEND.valueSize}
              fontFamily="Segoe UI, system-ui, sans-serif"
            >
              {entry.value.length > 88 ? `${entry.value.slice(0, 85)}…` : entry.value}
            </text>
          </g>
        );
      })}
    </g>
  );
}
