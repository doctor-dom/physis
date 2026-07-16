import { useEffect, useState, type ReactNode } from "react";
import {
  dataToStaturePoint,
  dataToWeightPoint,
} from "@core/cdc/chartCoordinates";
import {
  getCdcGrowthChart,
  CDC_CHART_IMAGE,
  type CdcGrowthChartDefinition,
} from "../../data/cdc/chartManifest";

const CHART_IMAGE_WIDTH = CDC_CHART_IMAGE.width;
const CHART_IMAGE_HEIGHT = CDC_CHART_IMAGE.height;

/** SVG units — semi-transparent so grid lines show through. */
const MARKER_RADIUS = 50;
const MARKER_STROKE = 10;
const MARKER_OPACITY = 0.65;
const STAR_SIZE = 58;
const ARROW_STROKE = 5;
const ARROW_HEAD = 14;

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

interface GrowthChartPlotProps {
  sex: "male" | "female";
  data: GrowthChartPlotData;
  onShowWork?: () => void;
}

interface ChartTooltipState {
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
  onHover: (tooltip: ChartTooltipState | null) => void;
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
  onHover,
  children,
}: PlotMarkerProps) {
  return (
    <g
      aria-label={ariaLabel}
      className="cursor-pointer"
      onMouseEnter={() =>
        onHover({
          xPct: (cx / CHART_IMAGE_WIDTH) * 100,
          yPct: (cy / CHART_IMAGE_HEIGHT) * 100,
          title: tooltip.title,
          lines: tooltip.lines,
        })
      }
      onMouseLeave={() => onHover(null)}
      onFocus={() =>
        onHover({
          xPct: (cx / CHART_IMAGE_WIDTH) * 100,
          yPct: (cy / CHART_IMAGE_HEIGHT) * 100,
          title: tooltip.title,
          lines: tooltip.lines,
        })
      }
      onBlur={() => onHover(null)}
      tabIndex={0}
      role="button"
    >
      <title>{[tooltip.title, ...tooltip.lines].join(" — ")}</title>
      <circle
        cx={cx}
        cy={cy}
        r={MARKER_RADIUS * 1.15}
        fill="transparent"
        stroke="none"
      />
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

function plotPoints(
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

export default function GrowthChartPlot({ sex, data, onShowWork }: GrowthChartPlotProps) {
  const chart = getCdcGrowthChart(sex);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [tooltip, setTooltip] = useState<ChartTooltipState | null>(null);

  useEffect(() => {
    setImageLoaded(false);
    setImageError(false);
    const img = new Image();
    img.onload = () => setImageLoaded(true);
    img.onerror = () => setImageError(true);
    img.src = chart.src;
  }, [chart.src]);

  const points = plotPoints(chart, data);
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
    <div className="mx-auto flex max-w-4xl flex-col gap-3 sm:flex-row sm:items-start">
      <figure className="relative min-w-0 flex-1 overflow-hidden rounded-xl border border-teal-200 bg-white shadow-sm">
        {!imageLoaded && !imageError && (
          <div
            className="flex items-center justify-center bg-teal-50/40 text-sm text-teal-700"
            style={{ aspectRatio: `${CHART_IMAGE_WIDTH} / ${CHART_IMAGE_HEIGHT}` }}
          >
            Loading CDC chart…
          </div>
        )}
        {imageError && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900">
            <p className="font-medium">CDC chart image not found</p>
            <p className="mt-2">
              Add{" "}
              <code className="rounded bg-amber-100 px-1">{chart.filename}</code>{" "}
              to <code className="rounded bg-amber-100 px-1">data/cdc/</code> and
              run <code className="rounded bg-amber-100 px-1">npm run import:data</code>.
              See <code className="rounded bg-amber-100 px-1">data/cdc/README.md</code>.
            </p>
          </div>
        )}

        {tooltip && (
          <div
            className="pointer-events-none absolute z-10 max-w-[14rem] rounded-lg border border-teal-200 bg-white/95 px-3 py-2 text-xs text-teal-900 shadow-lg backdrop-blur-sm"
            style={{
              left: `${tooltip.xPct}%`,
              top: `${tooltip.yPct}%`,
              transform: "translate(-50%, calc(-100% - 12px))",
            }}
          >
            <p className="font-semibold text-teal-950">{tooltip.title}</p>
            <ul className="mt-1 space-y-0.5 text-teal-800">
              {tooltip.lines.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </div>
        )}

        <svg
          viewBox={`0 0 ${CHART_IMAGE_WIDTH} ${CHART_IMAGE_HEIGHT}`}
          className={`w-full h-auto block ${imageLoaded ? "" : "hidden"}`}
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
              id="bone-age-arrowhead"
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

          {/* Arrow behind markers — edge to edge so it does not cover dots */}
          <line
            x1={arrowLine.x1}
            y1={arrowLine.y1}
            x2={arrowLine.x2}
            y2={arrowLine.y2}
            stroke="#c2410c"
            strokeWidth={ARROW_STROKE}
            markerEnd="url(#bone-age-arrowhead)"
            opacity={0.85}
          />

          <PlotMarker
            cx={points.weightChron.x}
            cy={points.weightChron.y}
            ariaLabel="Weight at chronological age"
            onHover={setTooltip}
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
            onHover={setTooltip}
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
            onHover={setTooltip}
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
            onHover={setTooltip}
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
            onHover={setTooltip}
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
        </svg>

        <figcaption className="border-t border-teal-100 px-4 py-3 text-sm text-teal-800">
          {chart.label}
          <span className="mt-1 block text-xs text-teal-600">
            Hover a marker to see the values used to plot it.
          </span>
        </figcaption>
      </figure>

      <aside className="w-full shrink-0 rounded-xl border border-teal-100 bg-white px-3 py-3 shadow-sm sm:w-44 md:w-48 lg:w-52">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-teal-600">
          Legend
        </p>
        <ul className="mt-2 space-y-2.5 text-xs leading-snug text-teal-800">
          <li className="flex items-start gap-2">
            <span className="mt-0.5 inline-block h-3 w-3 shrink-0 rounded-full bg-blue-600 ring-2 ring-white" />
            <span>
              Height & weight at chronological age ({data.chronAgeYears.toFixed(1)} y)
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 inline-block h-3 w-3 shrink-0 rounded-full bg-orange-600 ring-2 ring-white" />
            <span>Height at bone age ({data.boneAgeYears.toFixed(1)} y)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 shrink-0 text-orange-700">→</span>
            <span>Bone age shift (same measured height)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 shrink-0 text-amber-500">★</span>
            <span>
              MPH {data.mphCm.toFixed(1)} cm at age {chart.endOfGrowthAgeYears} y
            </span>
          </li>
          {mpsUsedInCalculation ? (
            <li className="pl-5 text-teal-700/90">
              MPS {data.mpsCm.toFixed(1)} cm — used in PAH calculation per{" "}
              {data.methodLabel}
            </li>
          ) : null}
          <li className="flex items-start gap-2">
            <span className="mt-0.5 inline-block h-3 w-3 shrink-0 rotate-45 bg-violet-600 ring-2 ring-white" />
            <span>
              Predicted adult height {data.predictedAdultHeightCm.toFixed(1)} cm at age{" "}
              {chart.endOfGrowthAgeYears} y
            </span>
          </li>
        </ul>
        {onShowWork ? (
          <button
            type="button"
            onClick={onShowWork}
            className="mt-4 w-full rounded-lg border border-teal-200 bg-teal-50 px-2 py-2 text-xs font-medium text-teal-800 hover:bg-teal-100"
          >
            Show work & QC →
          </button>
        ) : null}
      </aside>
    </div>
  );
}
