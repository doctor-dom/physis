import type { NormogramCurve, NormogramResult } from "@core/calculators/gonad-auxology/normogramUtils";
import { formatPercentileAndSds } from "@core/calculators/gonad-auxology/normogramUtils";

const CHART_WIDTH = 640;
const CHART_HEIGHT = 360;
const MARGIN = { top: 28, right: 24, bottom: 48, left: 56 };

const CURVE_STYLES: Partial<Record<number, { stroke: string; dash?: string }>> = {
  5: { stroke: "#0d9488", dash: "6 4" },
  10: { stroke: "#0d9488", dash: "6 4" },
  50: { stroke: "#0f766e" },
  90: { stroke: "#0d9488", dash: "6 4" },
  95: { stroke: "#0d9488", dash: "6 4" },
};

function mapX(x: number, xMin: number, xMax: number) {
  const inner = CHART_WIDTH - MARGIN.left - MARGIN.right;
  return MARGIN.left + ((x - xMin) / (xMax - xMin)) * inner;
}

function mapY(y: number, yMin: number, yMax: number) {
  const inner = CHART_HEIGHT - MARGIN.top - MARGIN.bottom;
  return MARGIN.top + inner - ((y - yMin) / (yMax - yMin)) * inner;
}

function polylinePoints(
  curve: NormogramCurve,
  xMin: number,
  xMax: number,
  yMin: number,
  yMax: number,
): string {
  return curve.points
    .map((p) => `${mapX(p.x, xMin, xMax)},${mapY(p.y, yMin, yMax)}`)
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
}

export default function NormogramChart({
  result,
  title,
  xDomain,
  yDomain,
  citation,
}: NormogramChartProps) {
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

  return (
    <section className="overflow-hidden rounded-xl border border-teal-100 bg-white">
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
          viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
          className="mx-auto w-full max-w-3xl text-teal-900"
          role="img"
          aria-label={`${title} normogram`}
        >
          <rect
            x={MARGIN.left}
            y={MARGIN.top}
            width={CHART_WIDTH - MARGIN.left - MARGIN.right}
            height={CHART_HEIGHT - MARGIN.top - MARGIN.bottom}
            fill="#f0fdfa"
            stroke="#ccfbf1"
          />

          {yTickValues.map((tick) => (
            <g key={`y-${tick}`}>
              <line
                x1={MARGIN.left}
                x2={CHART_WIDTH - MARGIN.right}
                y1={mapY(tick, yMin, yMax)}
                y2={mapY(tick, yMin, yMax)}
                stroke="#99f6e4"
                strokeWidth={1}
              />
              <text
                x={MARGIN.left - 8}
                y={mapY(tick, yMin, yMax) + 4}
                textAnchor="end"
                className="fill-teal-600 text-[10px]"
              >
                {formatAxisTick(tick)}
              </text>
            </g>
          ))}

          {xTickValues.map((tick) => (
            <g key={`x-${tick}`}>
              <line
                x1={mapX(tick, xMin, xMax)}
                x2={mapX(tick, xMin, xMax)}
                y1={MARGIN.top}
                y2={CHART_HEIGHT - MARGIN.bottom}
                stroke="#99f6e4"
                strokeWidth={1}
              />
              <text
                x={mapX(tick, xMin, xMax)}
                y={CHART_HEIGHT - MARGIN.bottom + 18}
                textAnchor="middle"
                className="fill-teal-600 text-[10px]"
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
                  points={polylinePoints(curve, xMin, xMax, yMin, yMax)}
                />
                {curve.points.length > 0 ? (
                  <text
                    x={mapX(curve.points[curve.points.length - 1].x, xMin, xMax) + 4}
                    y={mapY(curve.points[curve.points.length - 1].y, yMin, yMax) - 4}
                    className="fill-teal-700 text-[10px] font-medium"
                  >
                    P{curve.percentile}
                  </text>
                ) : null}
              </g>
            );
          })}

          <circle
            cx={mapX(result.patient.x, xMin, xMax)}
            cy={mapY(result.patient.y, yMin, yMax)}
            r={7}
            fill="#f97316"
            stroke="#fff"
            strokeWidth={2}
          />

          <text
            x={CHART_WIDTH / 2}
            y={CHART_HEIGHT - 8}
            textAnchor="middle"
            className="fill-teal-800 text-[11px] font-medium"
          >
            {result.xLabel} ({result.xUnit})
          </text>
          <text
            x={16}
            y={CHART_HEIGHT / 2}
            textAnchor="middle"
            transform={`rotate(-90 16 ${CHART_HEIGHT / 2})`}
            className="fill-teal-800 text-[11px] font-medium"
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
