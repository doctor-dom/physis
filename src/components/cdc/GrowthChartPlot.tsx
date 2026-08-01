import { useEffect, useState } from "react";
import { openGrowthChartViewer } from "@core/cdc/growthChartViewStorage";
import type { GrowthChartPlotData } from "@core/cdc/growthChartTypes";
import { getCdcGrowthChart } from "../../data/cdc/chartManifest";
import GrowthChartSvg, {
  CHART_IMAGE_HEIGHT,
  CHART_IMAGE_WIDTH,
  type ChartTooltipState,
} from "./GrowthChartSvg";

export type { GrowthChartPlotData } from "@core/cdc/growthChartTypes";

interface GrowthChartPlotProps {
  sex: "male" | "female";
  data: GrowthChartPlotData;
  onShowWork?: () => void;
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

  const mpsUsedInCalculation =
    data.parentalStatureUsedInCalculation === "MPS";

  function openViewer() {
    if (!imageLoaded || imageError) return;
    openGrowthChartViewer({ sex, data });
  }

  function onChartKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openViewer();
    }
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

        <div
          role="button"
          tabIndex={imageLoaded && !imageError ? 0 : -1}
          aria-label="Open growth chart in a new window for zoom, pan, and print"
          onClick={openViewer}
          onKeyDown={onChartKeyDown}
          className={`group relative block w-full ${
            imageLoaded && !imageError
              ? "cursor-zoom-in focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2"
              : ""
          } ${imageLoaded ? "" : "hidden"}`}
        >
          <GrowthChartSvg
            chart={chart}
            data={data}
            interactive
            onMarkerHover={setTooltip}
            className="w-full h-auto block"
          />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-teal-950/50 to-transparent px-3 py-2 opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100">
            <p className="text-center text-xs font-medium text-white">
              Click to open full chart · zoom, pan, print
            </p>
          </div>
        </div>

        <figcaption className="border-t border-teal-100 px-4 py-3 text-sm text-teal-800">
          {chart.label}
          <span className="mt-1 block text-xs text-teal-600">
            Hover a marker for values, or click the chart to open a zoomable view.
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
