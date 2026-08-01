import { useCallback, useEffect, useState } from "react";
import type { NormogramExtraCurve } from "@core/calculators/gonad-auxology/normogramUtils";
import NormogramChart, {
  type NormogramChartProps,
} from "./NormogramChart";

interface ZoomableNormogramChartProps extends NormogramChartProps {
  extraCurves?: NormogramExtraCurve[];
  enlargeLabel?: string;
}

export default function ZoomableNormogramChart({
  extraCurves,
  enlargeLabel,
  title,
  ...chartProps
}: ZoomableNormogramChartProps) {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);
  const label = enlargeLabel ?? `${title} — enlarged nomogram`;

  useEffect(() => {
    if (!open) return;

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, close]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group block w-full cursor-zoom-in text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 rounded-xl"
        aria-label={`${title} — click to enlarge`}
      >
        <NormogramChart
          {...chartProps}
          title={title}
          extraCurves={extraCurves}
          embedded
        />
        <span className="pointer-events-none relative -mt-10 mr-3 mb-2 block text-right text-[10px] font-medium uppercase tracking-wide text-teal-700 opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100">
          Click to enlarge
        </span>
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 sm:p-8"
          role="dialog"
          aria-modal="true"
          aria-label={label}
        >
          <button
            type="button"
            className="absolute inset-0 cursor-zoom-out"
            onClick={close}
            aria-label="Close enlarged nomogram"
          />
          <div className="relative z-10 flex max-h-full w-full max-w-6xl flex-col gap-3 overflow-auto">
            <NormogramChart
              {...chartProps}
              title={title}
              extraCurves={extraCurves}
              scale={{
                width: 960,
                height: 540,
                tickFontSize: 13,
                axisFontSize: 14,
                curveLabelFontSize: 12,
                margin: { top: 36, right: 32, bottom: 56, left: 72 },
              }}
              embedded
            />
            <div className="flex justify-center">
              <button
                type="button"
                onClick={close}
                className="rounded-lg bg-white/15 px-4 py-2 text-sm font-medium text-white hover:bg-white/25"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
