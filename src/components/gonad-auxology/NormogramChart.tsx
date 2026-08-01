import type {
  NormogramChartScale,
  NormogramExtraCurve,
  NormogramResult,
} from "@core/calculators/gonad-auxology/normogramUtils";
import { formatPercentileAndSds } from "@core/calculators/gonad-auxology/normogramUtils";

const DEFAULT_WIDTH = 640;
const DEFAULT_HEIGHT = 360;
const DEFAULT_MARGIN = { top: 28, right: 24, bottom: 48, left: 56 };

const CURVE_STYLES: Partial<Record<number, { stroke: string; dash?: string }>> = {
  5: { stroke: "#0d9488", dash: "6 4" },
  10: { stroke: "#0d9488", dash: "6 4" },
  50: { stroke: "#0f766e" },
  90: { stroke: "#0d9488", dash: "6 4" },
  95: { stroke: "#0d9488", dash: "6 4" },
};

function mapX(
  x: number,
  xMin: number,
  xMax: number,
  width: number,
  margin: typeof DEFAULT_MARGIN,
) {
  const inner = width - margin.left - margin.right;
  return margin.left + ((x - xMin) / (xMax - xMin)) * inner;
}

function mapY(
  y: number,
  yMin: number,
  yMax: number,
  height: number,
  margin: typeof DEFAULT_MARGIN,
) {
  const inner = height - margin.top - margin.bottom;
  return margin.top + inner - ((y - yMin) / (yMax - yMin)) * inner;
}

function polylinePoints(
  points: { x: number; y: number }[],
  xMin: number,
  xMax: number,
  yMin: number,
  yMax: number,
  width: number,
  height: number,
  margin: typeof DEFAULT_MARGIN,
): string {
  return points
    .map((p) =>
      `${mapX(p.x, xMin, xMax, width, margin)},${mapY(p.y, yMin, yMax, height, margin)}`,
    )
    .join(" ");
}

function formatAxisTick(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

export interface NormogramChartProps {
  result: NormogramResult;
  title: string;
  xDomain: { min: number; max: number };
  yDomain: { min: number; max: number };
  citation?: string;
  extraCurves?: NormogramExtraCurve[];
  scale?: NormogramChartScale;
  embedded?: boolean;
}

export default function NormogramChart({
  result,
  title,
  xDomain,
  yDomain,
  citation,
  extraCurves = [],
  scale,
  embedded = false,
}: NormogramChartProps) {
  const width = scale?.width ?? DEFAULT_WIDTH;
  const height = scale?.height ?? DEFAULT_HEIGHT;
  const margin = scale?.margin ?? DEFAULT_MARGIN;
  const tickFontSize = scale?.tickFontSize ?? 10;
  const axisFontSize = scale?.axisFontSize ?? 11;
  const curveLabelFontSize = scale?.curveLabelFontSize ?? 10;

  const xMin = xDomain.min;
  const xMax = xDomain.max;
  const yMin = yDomain.min;
  const yMax = yDomain.max;
  const displayCurves = [
    result.lowCurve,
    ...result.curves.filter((c) => c.percentile === 50),
    result.highCurve,
  ];

  const xTicks = 5;
  const yTicks = 5;
  const xTickValues = Array.from({ length: xTicks }, (_, i) =>
    xMin + (i * (xMax - xMin)) / (xTicks - 1),
  );
  const yTickValues = Array.from({ length: yTicks }, (_, i) =>
    yMin + (i * (yMax - yMin)) / (yTicks - 1),
  );

  const sectionClass = embedded
    ? "overflow-hidden rounded-xl border border-teal-100 bg-white"
    : "overflow-hidden rounded-xl border border-teal-100 bg-white";

  return (
    <section className={sectionClass}>
      <div className="border-b border-teal-100 bg-teal-50/60 px-4 py-2">
        <h3 className="text-sm font-semibold text-teal-900">{title}</h3>
        <p className="text-xs text-teal-700">
          Patient: {result.patient.y.toFixed(2)} {result.yUnit} at {result.patient.x}{" "}
          {result.xUnit}
        </p>
        <p className="text-xs font-medium text-teal-800">
          {formatPercentileAndSds(result.patient.percentile, result.patient.sds)}
        </p>
      </div>
      <div className="overflow-x-auto p-3">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="mx-auto w-full max-w-3xl text-teal-900"
          role="img"
          aria-label={`${title} normogram`}
        >
          <rect
            x={margin.left}
            y={margin.top}
            width={width - margin.left - margin.right}
            height={height - margin.top - margin.bottom}
            fill="#f0fdfa"
            stroke="#ccfbf1"
          />

          {yTickValues.map((tick) => (
            <g key={`y-${tick}`}>
              <line
                x1={margin.left}
                x2={width - margin.right}
                y1={mapY(tick, yMin, yMax, height, margin)}
                y2={mapY(tick, yMin, yMax, height, margin)}
                stroke="#99f6e4"
                strokeWidth={1}
              />
              <text
                x={margin.left - 8}
                y={mapY(tick, yMin, yMax, height, margin) + 4}
                textAnchor="end"
                className="fill-teal-600"
                fontSize={tickFontSize}
              >
                {formatAxisTick(tick)}
              </text>
            </g>
          ))}

          {xTickValues.map((tick) => (
            <g key={`x-${tick}`}>
              <line
                x1={mapX(tick, xMin, xMax, width, margin)}
                x2={mapX(tick, xMin, xMax, width, margin)}
                y1={margin.top}
                y2={height - margin.bottom}
                stroke="#99f6e4"
                strokeWidth={1}
              />
              <text
                x={mapX(tick, xMin, xMax, width, margin)}
                y={height - margin.bottom + 18}
                textAnchor="middle"
                className="fill-teal-600"
                fontSize={tickFontSize}
              >
                {formatAxisTick(tick)}
              </text>
            </g>
          ))}

          {displayCurves.map((curve) => {
            const style = CURVE_STYLES[curve.percentile] ?? { stroke: "#14b8a6" };
            return (
              <g key={curve.percentile}>
                <polyline
                  fill="none"
                  stroke={style.stroke}
                  strokeWidth={curve.percentile === 50 ? 2.5 : 1.5}
                  strokeDasharray={style.dash}
                  points={polylinePoints(
                    curve.points,
                    xMin,
                    xMax,
                    yMin,
                    yMax,
                    width,
                    height,
                    margin,
                  )}
                />
                {curve.points.length > 0 ? (
                  <text
                    x={
                      mapX(
                        curve.points[curve.points.length - 1].x,
                        xMin,
                        xMax,
                        width,
                        margin,
                      ) + 4
                    }
                    y={
                      mapY(
                        curve.points[curve.points.length - 1].y,
                        yMin,
                        yMax,
                        height,
                        margin,
                      ) - 4
                    }
                    className="fill-teal-700 font-medium"
                    fontSize={curveLabelFontSize}
                  >
                    P{curve.percentile}
                  </text>
                ) : null}
              </g>
            );
          })}

          {extraCurves.map((curve) => (
            <g key={curve.label}>
              <polyline
                fill="none"
                stroke={curve.stroke ?? "#dc2626"}
                strokeWidth={2}
                strokeDasharray={curve.dash ?? "4 4"}
                points={polylinePoints(
                  curve.points,
                  xMin,
                  xMax,
                  yMin,
                  yMax,
                  width,
                  height,
                  margin,
                )}
              />
              {curve.points.length > 0 ? (
                <text
                  x={
                    mapX(
                      curve.points[curve.points.length - 1].x,
                      xMin,
                      xMax,
                      width,
                      margin,
                    ) + 4
                  }
                  y={
                    mapY(
                      curve.points[curve.points.length - 1].y,
                      yMin,
                      yMax,
                      height,
                      margin,
                    ) - 4
                  }
                  className="fill-red-700 font-medium"
                  fontSize={curveLabelFontSize}
                >
                  {curve.label}
                </text>
              ) : null}
            </g>
          ))}

          <circle
            cx={mapX(result.patient.x, xMin, xMax, width, margin)}
            cy={mapY(result.patient.y, yMin, yMax, height, margin)}
            r={7}
            fill="#f97316"
            stroke="#fff"
            strokeWidth={2}
          />

          <text
            x={width / 2}
            y={height - 8}
            textAnchor="middle"
            className="fill-teal-800 font-medium"
            fontSize={axisFontSize}
          >
            {result.xLabel} ({result.xUnit})
          </text>
          <text
            x={16}
            y={height / 2}
            textAnchor="middle"
            transform={`rotate(-90 16 ${height / 2})`}
            className="fill-teal-800 font-medium"
            fontSize={axisFontSize}
          >
            {result.yLabel} ({result.yUnit})
          </text>
        </svg>
      </div>
      {citation ? (
        <p className="border-t border-teal-50 px-4 py-2 text-[11px] leading-relaxed text-teal-600">
          {citation}
        </p>
      ) : null}
    </section>
  );
}
