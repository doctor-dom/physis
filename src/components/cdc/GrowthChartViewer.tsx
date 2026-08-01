import { useCallback, useEffect, useRef, useState } from "react";
import { getCdcGrowthChart } from "../../data/cdc/chartManifest";
import type { GrowthChartPlotData } from "@core/cdc/growthChartTypes";
import GrowthChartLegendPanel from "./GrowthChartLegendPanel";
import GrowthChartSvg, {
  CHART_IMAGE_HEIGHT,
  CHART_IMAGE_WIDTH,
} from "./GrowthChartSvg";

const MIN_SCALE = 0.05;
const MAX_SCALE = 4;

interface ViewTransform {
  scale: number;
  x: number;
  y: number;
}

interface GrowthChartViewerProps {
  sex: "male" | "female";
  data: GrowthChartPlotData;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export default function GrowthChartViewer({ sex, data }: GrowthChartViewerProps) {
  const chart = getCdcGrowthChart(sex);
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const dragRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    origX: number;
    origY: number;
  } | null>(null);

  const [transform, setTransform] = useState<ViewTransform>({
    scale: 0.1,
    x: 0,
    y: 0,
  });
  const [exporting, setExporting] = useState(false);

  const fitToView = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const { width, height } = container.getBoundingClientRect();
    if (width <= 0 || height <= 0) return;

    const scale = clamp(
      Math.min(width / CHART_IMAGE_WIDTH, height / CHART_IMAGE_HEIGHT),
      MIN_SCALE,
      MAX_SCALE,
    );
    const x = (width - CHART_IMAGE_WIDTH * scale) / 2;
    const y = (height - CHART_IMAGE_HEIGHT * scale) / 2;
    setTransform({ scale, x, y });
  }, []);

  useEffect(() => {
    fitToView();
  }, [fitToView]);

  const zoomAtPoint = useCallback(
    (clientX: number, clientY: number, factor: number) => {
      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const pointerX = clientX - rect.left;
      const pointerY = clientY - rect.top;

      setTransform((current) => {
        const chartX = (pointerX - current.x) / current.scale;
        const chartY = (pointerY - current.y) / current.scale;
        const nextScale = clamp(current.scale * factor, MIN_SCALE, MAX_SCALE);
        return {
          scale: nextScale,
          x: pointerX - chartX * nextScale,
          y: pointerY - chartY * nextScale,
        };
      });
    },
    [],
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    function onWheel(e: WheelEvent) {
      e.preventDefault();
      const factor = e.deltaY < 0 ? 1.12 : 1 / 1.12;
      zoomAtPoint(e.clientX, e.clientY, factor);
    }

    container.addEventListener("wheel", onWheel, { passive: false });
    return () => container.removeEventListener("wheel", onWheel);
  }, [zoomAtPoint]);

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (e.button !== 0) return;
    dragRef.current = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      origX: transform.x,
      origY: transform.y,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== e.pointerId) return;

    setTransform((current) => ({
      ...current,
      x: drag.origX + (e.clientX - drag.startX),
      y: drag.origY + (e.clientY - drag.startY),
    }));
  }

  function endDrag(e: React.PointerEvent<HTMLDivElement>) {
    if (dragRef.current?.pointerId === e.pointerId) {
      dragRef.current = null;
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  }

  function zoomBy(factor: number) {
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    zoomAtPoint(rect.left + rect.width / 2, rect.top + rect.height / 2, factor);
  }

  async function exportFlattenedPng() {
    const svg = svgRef.current;
    if (!svg || exporting) return;

    setExporting(true);
    try {
      const clone = svg.cloneNode(true) as SVGSVGElement;
      clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
      clone.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink");

      const svgString = new XMLSerializer().serializeToString(clone);
      const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(blob);

      await new Promise<void>((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = CHART_IMAGE_WIDTH;
          canvas.height = CHART_IMAGE_HEIGHT;
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            reject(new Error("Canvas unavailable"));
            return;
          }
          ctx.drawImage(img, 0, 0);
          canvas.toBlob((pngBlob) => {
            if (!pngBlob) {
              reject(new Error("PNG export failed"));
              return;
            }
            const downloadUrl = URL.createObjectURL(pngBlob);
            const link = document.createElement("a");
            link.href = downloadUrl;
            link.download = `cdc-growth-chart-${sex}.png`;
            link.click();
            URL.revokeObjectURL(downloadUrl);
            resolve();
          }, "image/png");
        };
        img.onerror = () => reject(new Error("SVG rasterization failed"));
        img.src = url;
      });

      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="cdc-chart-viewer flex h-dvh flex-col bg-slate-100">
      <div className="cdc-chart-viewer-toolbar flex shrink-0 flex-wrap items-center gap-2 border-b border-teal-200 bg-white px-3 py-2">
        <p className="min-w-0 flex-1 text-sm font-semibold text-teal-900">
          {chart.label}
        </p>
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => zoomBy(1.25)}
            className="rounded-md border border-teal-200 bg-teal-50 px-2.5 py-1.5 text-xs font-medium text-teal-800 hover:bg-teal-100"
          >
            Zoom in
          </button>
          <button
            type="button"
            onClick={() => zoomBy(1 / 1.25)}
            className="rounded-md border border-teal-200 bg-teal-50 px-2.5 py-1.5 text-xs font-medium text-teal-800 hover:bg-teal-100"
          >
            Zoom out
          </button>
          <button
            type="button"
            onClick={fitToView}
            className="rounded-md border border-teal-200 bg-teal-50 px-2.5 py-1.5 text-xs font-medium text-teal-800 hover:bg-teal-100"
          >
            Fit
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="rounded-md border border-teal-200 bg-teal-50 px-2.5 py-1.5 text-xs font-medium text-teal-800 hover:bg-teal-100"
          >
            Print
          </button>
          <button
            type="button"
            onClick={() => void exportFlattenedPng()}
            disabled={exporting}
            className="rounded-md border border-teal-200 bg-teal-50 px-2.5 py-1.5 text-xs font-medium text-teal-800 hover:bg-teal-100 disabled:opacity-60"
          >
            {exporting ? "Saving…" : "Save PNG"}
          </button>
        </div>
      </div>

      <div className="cdc-chart-viewer-legend-screen shrink-0 border-b border-teal-100 bg-white px-3 py-2 print:hidden">
        <GrowthChartLegendPanel data={data} chart={chart} compact />
        <p className="mt-1 text-[10px] text-teal-600 cdc-chart-viewer-hint">
          Scroll to zoom · drag to pan
        </p>
      </div>

      <div
        ref={containerRef}
        className="cdc-chart-viewer-canvas relative min-h-0 flex-1 cursor-grab overflow-hidden active:cursor-grabbing print:min-h-0 print:flex-none"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        <div
          className="absolute left-0 top-0 origin-top-left"
          style={{
            width: CHART_IMAGE_WIDTH,
            height: CHART_IMAGE_HEIGHT,
            transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
          }}
        >
          <GrowthChartSvg
            chart={chart}
            data={data}
            svgRef={svgRef}
            nativeSize
            embedMarginLegend
            className="block shadow-md cdc-chart-viewer-svg"
          />
        </div>
      </div>
    </div>
  );
}
