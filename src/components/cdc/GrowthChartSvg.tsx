import { useId, type ReactNode } from "react";
import {
  dataToStaturePoint,
  dataToWeightPoint,
} from "@core/cdc/chartCoordinates";
import {
  CDC_CHART_IMAGE,
  type CdcGrowthChartDefinition,
} from "../../data/cdc/chartManifest";
import type { GrowthChartPlotData } from "@core/cdc/growthChartTypes";
import GrowthChartSvgMarginLegend from "./GrowthChartSvgMarginLegend";

export const CHART_IMAGE_WIDTH = CDC_CHART_IMAGE.width;
export const CHART_IMAGE_HEIGHT = CDC_CHART_IMAGE.height;

/** SVG units — semi-transparent so grid lines show through. */
export const MARKER_RADIUS = 50;
export const MARKER_STROKE = 10;
export const MARKER_OPACITY = 0.65;
export const STAR_SIZE = 58;
export const ARROW_STROKE = 5;
export const ARROW_HEAD = 14;

export interface ChartTooltipState {
  xPct: number;
  yPct: number;
  title: string;
  lines: string[];
}

interface PlotMarkerProps {
  cx: number;
  cy: number;
  ariaLabel: string;
  tooltip: { title: string; lines: string[] };
  interactive: boolean;
  onHover?: (tooltip: ChartTooltipState | null) => void;
  children: ReactNode;
}

function lineBetweenCircles(
  a: { x: number; y: number },
  b: { x: number; y: number },
  radius: number,
) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.hypot(dx, dy);
  if (len <= radius * 2) {
    return { x1: a.x, y1: a.y, x2: b.x, y2: b.y };
  }
  const ux = dx / len;
  const uy = dy / len;
  return {
    x1: a.x + ux * radius,
    y1: a.y + uy * radius,
    x2: b.x - ux * radius,
    y2: b.y - uy * radius,
  };
}

function PlotMarker({
  cx,
  cy,
  ariaLabel,
  tooltip,
  interactive,
  onHover,
  children,
}: PlotMarkerProps) {
  const hoverHandlers = interactive
    ? {
        onMouseEnter: () =>
          onHover?.({
            xPct: (cx / CHART_IMAGE_WIDTH) * 100,
            yPct: (cy / CHART_IMAGE_HEIGHT) * 100,
            title: tooltip.title,
            lines: tooltip.lines,
          }),
        onMouseLeave: () => onHover?.(null),
        onFocus: () =>
          onHover?.({
            xPct: (cx / CHART_IMAGE_WIDTH) * 100,
            yPct: (cy / CHART_IMAGE_HEIGHT) * 100,
            title: tooltip.title,
            lines: tooltip.lines,
          }),
        onBlur: () => onHover?.(null),
        tabIndex: 0 as const,
        role: "button" as const,
        className: "cursor-pointer",
      }
    : {
        tabIndex: undefined,
        role: undefined,
        className: undefined,
      };

  return (
    <g aria-label={ariaLabel} {...hoverHandlers}>
      <title>{[tooltip.title, ...tooltip.lines].join(" — ")}</title>
      {interactive ? (
        <circle
          cx={cx}
          cy={cy}
          r={MARKER_RADIUS * 1.15}
          fill="transparent"
          stroke="none"
        />
      ) : null}
      {children}
    </g>
  );
}

function StarShape({ cx, cy }: { cx: number; cy: number }) {
  const points = Array.from({ length: 10 }, (_, i) => {
    const angle = (Math.PI / 2) * -1 + (i * Math.PI) / 5;
    const radius = i % 2 === 0 ? STAR_SIZE : STAR_SIZE * 0.45;
    return `${cx + Math.cos(angle) * radius},${cy + Math.sin(angle) * radius}`;
  }).join(" ");

  return (
    <polygon
      points={points}
      fill="#f59e0b"
      fillOpacity={MARKER_OPACITY}
      stroke="#92400e"
      strokeWidth={MARKER_STROKE}
    />
  );
}

function DiamondShape({ cx, cy }: { cx: number; cy: number }) {
  const size = STAR_SIZE;
  const points = [
    `${cx},${cy - size}`,
    `${cx + size},${cy}`,
    `${cx},${cy + size}`,
    `${cx - size},${cy}`,
  ].join(" ");

  return (
    <polygon
      points={points}
      fill="#7c3aed"
      fillOpacity={MARKER_OPACITY}
      stroke="#4c1d95"
      strokeWidth={MARKER_STROKE}
    />
  );
}

export function plotGrowthChartPoints(
  chart: CdcGrowthChartDefinition,
  data: GrowthChartPlotData,
) {
  const heightChron = dataToStaturePoint(
    chart.stature,
    data.chronAgeYears,
    data.heightCm,
  );
  const heightBone = dataToStaturePoint(
    chart.stature,
    data.boneAgeYears,
    data.heightCm,
  );
  const weightChron = dataToWeightPoint(
    chart.weight,
    data.chronAgeYears,
    data.weightKg,
  );
  const parentalStar = dataToStaturePoint(
    chart.stature,
    chart.endOfGrowthAgeYears,
    data.mphCm,
  );
  const predictedAdult = dataToStaturePoint(
    chart.stature,
    chart.endOfGrowthAgeYears,
    data.predictedAdultHeightCm,
  );

  return { heightChron, heightBone, weightChron, parentalStar, predictedAdult };
}

export interface GrowthChartSvgProps {
  chart: CdcGrowthChartDefinition;
  data: GrowthChartPlotData;
  interactive?: boolean;
  nativeSize?: boolean;
  embedMarginLegend?: boolean;
  onMarkerHover?: (tooltip: ChartTooltipState | null) => void;
  className?: string;
  svgRef?: React.RefObject<SVGSVGElement | null>;
}

export default function GrowthChartSvg({
  chart,
  data,
  interactive = false,
  nativeSize = false,
  embedMarginLegend = false,
  onMarkerHover,
  className = "",
  svgRef,
}: GrowthChartSvgProps) {
  const arrowheadId = useId().replace(/:/g, "");
  const points = plotGrowthChartPoints(chart, data);
  const boneAgeShiftYears = data.boneAgeYears - data.chronAgeYears;
  const boneAgeShiftLabel =
    boneAgeShiftYears === 0
      ? "0 y (aligned)"
      : `${boneAgeShiftYears > 0 ? "+" : ""}${boneAgeShiftYears.toFixed(1)} y`;
  const arrowLine = lineBetweenCircles(
    points.heightChron,
    points.heightBone,
    MARKER_RADIUS,
  );

  const mpsUsedInCalculation =
    data.parentalStatureUsedInCalculation === "MPS";

  const mphTooltipLines = [
    `Age: ${chart.endOfGrowthAgeYears} y`,
    `MPH: ${data.mphCm.toFixed(1)} cm`,
    "Panel: stature-for-age (upper chart)",
  ];
  if (mpsUsedInCalculation) {
    mphTooltipLines.splice(
      2,
      0,
      `MPS ${data.mpsCm.toFixed(1)} cm used in PAH calculation (${data.methodLabel})`,
    );
  } else {
    mphTooltipLines.splice(
      2,
      0,
      `MPH used in PAH calculation (${data.methodLabel})`,
    );
  }

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${CHART_IMAGE_WIDTH} ${CHART_IMAGE_HEIGHT}`}
      {...(nativeSize
        ? { width: CHART_IMAGE_WIDTH, height: CHART_IMAGE_HEIGHT }
        : {})}
      className={className}
      role="img"
      aria-label={chart.label}
      preserveAspectRatio="xMidYMid meet"
    >
      <image
        href={chart.src}
        x={0}
        y={0}
        width={CHART_IMAGE_WIDTH}
        height={CHART_IMAGE_HEIGHT}
      />

      <defs>
        <marker
          id={`bone-age-arrowhead-${arrowheadId}`}
          markerWidth={ARROW_HEAD}
          markerHeight={ARROW_HEAD}
          refX={ARROW_HEAD - 2}
          refY={ARROW_HEAD / 2}
          orient="auto"
        >
          <polygon
            points={`0 0, ${ARROW_HEAD} ${ARROW_HEAD / 2}, 0 ${ARROW_HEAD}`}
            fill="#c2410c"
          />
        </marker>
      </defs>

      <line
        x1={arrowLine.x1}
        y1={arrowLine.y1}
        x2={arrowLine.x2}
        y2={arrowLine.y2}
        stroke="#c2410c"
        strokeWidth={ARROW_STROKE}
        markerEnd={`url(#bone-age-arrowhead-${arrowheadId})`}
        opacity={0.85}
      />

      <PlotMarker
        cx={points.weightChron.x}
        cy={points.weightChron.y}
        ariaLabel="Weight at chronological age"
        interactive={interactive}
        onHover={onMarkerHover}
        tooltip={{
          title: "Weight at chronological age",
          lines: [
            `Age: ${data.chronAgeYears.toFixed(1)} y`,
            `Weight: ${data.weightKg.toFixed(1)} kg`,
            "Panel: weight-for-age (lower chart)",
          ],
        }}
      >
        <circle
          cx={points.weightChron.x}
          cy={points.weightChron.y}
          r={MARKER_RADIUS}
          fill="#2563eb"
          fillOpacity={MARKER_OPACITY}
          stroke="#fff"
          strokeWidth={MARKER_STROKE}
        />
      </PlotMarker>

      <PlotMarker
        cx={points.heightChron.x}
        cy={points.heightChron.y}
        ariaLabel="Height at chronological age"
        interactive={interactive}
        onHover={onMarkerHover}
        tooltip={{
          title: "Height at chronological age",
          lines: [
            `Age: ${data.chronAgeYears.toFixed(1)} y`,
            `Height: ${data.heightCm.toFixed(1)} cm`,
            "Panel: stature-for-age (upper chart)",
          ],
        }}
      >
        <circle
          cx={points.heightChron.x}
          cy={points.heightChron.y}
          r={MARKER_RADIUS}
          fill="#2563eb"
          fillOpacity={MARKER_OPACITY}
          stroke="#fff"
          strokeWidth={MARKER_STROKE}
        />
      </PlotMarker>

      <PlotMarker
        cx={points.heightBone.x}
        cy={points.heightBone.y}
        ariaLabel="Height at bone age"
        interactive={interactive}
        onHover={onMarkerHover}
        tooltip={{
          title: "Height at bone age",
          lines: [
            `Bone age: ${data.boneAgeYears.toFixed(1)} y`,
            `Height: ${data.heightCm.toFixed(1)} cm (measured)`,
            `Chronologic age: ${data.chronAgeYears.toFixed(1)} y`,
            `Bone age shift: ${boneAgeShiftLabel}`,
          ],
        }}
      >
        <circle
          cx={points.heightBone.x}
          cy={points.heightBone.y}
          r={MARKER_RADIUS}
          fill="#ea580c"
          fillOpacity={MARKER_OPACITY}
          stroke="#fff"
          strokeWidth={MARKER_STROKE}
        />
      </PlotMarker>

      <PlotMarker
        cx={points.parentalStar.x}
        cy={points.parentalStar.y}
        ariaLabel="MPH at end of growth"
        interactive={interactive}
        onHover={onMarkerHover}
        tooltip={{
          title: "MPH (mid-parental height)",
          lines: mphTooltipLines,
        }}
      >
        <StarShape cx={points.parentalStar.x} cy={points.parentalStar.y} />
      </PlotMarker>

      <PlotMarker
        cx={points.predictedAdult.x}
        cy={points.predictedAdult.y}
        ariaLabel="Predicted adult height at end of growth"
        interactive={interactive}
        onHover={onMarkerHover}
        tooltip={{
          title: "Predicted adult height",
          lines: [
            `Method: ${data.methodLabel}`,
            `Age: ${chart.endOfGrowthAgeYears} y`,
            `Height: ${data.predictedAdultHeightCm.toFixed(1)} cm`,
            "Panel: stature-for-age (upper chart)",
          ],
        }}
      >
        <DiamondShape
          cx={points.predictedAdult.x}
          cy={points.predictedAdult.y}
        />
      </PlotMarker>

      {embedMarginLegend ? (
        <GrowthChartSvgMarginLegend data={data} chart={chart} />
      ) : null}
    </svg>
  );
}
