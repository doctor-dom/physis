import { useEffect, useState } from "react";
import ZoomableImage from "../ZoomableImage";
import { CAH_CHART_URLS } from "../../data/cah/chartAssets";

interface CahChartTabProps {
  summary: string;
  caption: string;
  src: string;
  alt: string;
  missingHint: string;
}

function CahChartTab({ summary, caption, src, alt, missingHint }: CahChartTabProps) {
  const [available, setAvailable] = useState<boolean | null>(null);

  useEffect(() => {
    setAvailable(null);
    const img = new Image();
    img.onload = () => setAvailable(true);
    img.onerror = () => setAvailable(false);
    img.src = src;
  }, [src]);

  return (
    <details className="rounded-lg border border-teal-100 bg-white">
      <summary className="cursor-pointer select-none px-3 py-2 text-sm font-medium text-teal-800 hover:bg-teal-50/60">
        {summary}
      </summary>
      <div className="space-y-2 border-t border-teal-100 p-3">
        <p className="text-xs text-teal-600">{caption}</p>
        {available === null && (
          <p className="text-xs text-teal-600">Loading chart…</p>
        )}
        {available === false && (
          <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
            {missingHint}
          </p>
        )}
        {available === true && <ZoomableImage src={src} alt={alt} />}
      </div>
    </details>
  );
}

export interface CahNomogramChartTabsProps {
  /** Show Olgemöller 2003 nomogram chart tab. */
  show2003: boolean;
  /** Show Pode-Shakked 2018 nomogram chart tab. */
  show2018: boolean;
  /** Show Israeli Table 2 algorithm chart tab. */
  showIsrael: boolean;
  /** Optional note for which 2018 stratification row was used. */
  stratificationNote?: string;
}

export default function CahNomogramChartTabs({
  show2003,
  show2018,
  showIsrael,
  stratificationNote,
}: CahNomogramChartTabsProps) {
  if (!show2003 && !show2018 && !showIsrael) return null;

  return (
    <section className="space-y-2 rounded-xl border border-teal-100 bg-teal-50/30 p-4">
      <h3 className="text-sm font-semibold text-teal-900">Nomogram charts</h3>
      <p className="text-xs text-teal-700">
        Expand a tab to view the source chart. Click the image to zoom.
      </p>
      <div className="space-y-2">
        {show2003 && (
          <CahChartTab
            summary="CAH-2003 chart (Olgemöller)"
            caption="Birth weight and sample age multitier thresholds."
            src={CAH_CHART_URLS.cah2003}
            alt="CAH-2003 Olgemöller nomogram chart"
            missingHint="Add CAH-2003.png to data/excel/ (or data/cah/) and run npm run import:data."
          />
        )}
        {show2018 && (
          <CahChartTab
            summary="Table 1 percentile chart (Pode-Shakked 2019)"
            caption={
              stratificationNote
                ? `Percentile reference — ${stratificationNote}`
                : "Table 1 percentile values stratified by BW, GA, or both."
            }
            src={CAH_CHART_URLS.cah2018}
            alt="CAH-2018 Pode-Shakked nomogram chart"
            missingHint="Add CAH-2018.png to data/excel/ (or data/cah/) and run npm run import:data."
          />
        )}
        {showIsrael && (
          <CahChartTab
            summary="CAH-2018 Israeli algorithm chart (Table 2)"
            caption="Operational repeat-request cutoffs and repeat-sample interpretation by BW and GA."
            src={CAH_CHART_URLS.cah2018Israel}
            alt="CAH-2018 Israeli newborn screening algorithm chart"
            missingHint="Add CAH-2018-Israel.png to data/excel/ (or data/cah/) and run npm run import:data."
          />
        )}
      </div>
    </section>
  );
}
