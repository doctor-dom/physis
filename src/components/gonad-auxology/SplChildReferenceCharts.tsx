import { useEffect, useState } from "react";
import ZoomableImage from "../ZoomableImage";
import { GONAD_AUXOLOGY_CHART_URLS } from "../../data/gonad-auxology/chartAssets";

interface ReferenceChartTabProps {
  summary: string;
  caption: string;
  src: string;
  alt: string;
  missingHint: string;
}

function ReferenceChartTab({ summary, caption, src, alt, missingHint }: ReferenceChartTabProps) {
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
        {available === null && <p className="text-xs text-teal-600">Loading chart…</p>}
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

export default function SplChildReferenceCharts() {
  return (
    <section className="space-y-2 rounded-xl border border-teal-100 bg-teal-50/30 p-4">
      <h3 className="text-sm font-semibold text-teal-900">Source reference charts</h3>
      <p className="text-xs text-teal-700">
        Expand a tab to view the published nomogram or table used to build each US reference. Click
        the image to zoom.
      </p>
      <div className="space-y-2">
        <ReferenceChartTab
          summary="USA Schonfeld & Beebe (Fig. 5)"
          caption="10th decile, median, and 90th decile curves from birth to maturity."
          src={GONAD_AUXOLOGY_CHART_URLS.usaSchonfeld}
          alt="Schonfeld and Beebe 1942 penile length growth curves"
          missingHint="Add SPL-USA-SCHONFELD.png to data/excel/ and run npm run import:data."
        />
        <ReferenceChartTab
          summary="USA Feldman / Aaronson mean ± SD table"
          caption="Mean stretched penile length by age with standard deviation and −2.5 SD cutoffs."
          src={GONAD_AUXOLOGY_CHART_URLS.usaFeldman}
          alt="Feldman and Aaronson stretched penile length reference table"
          missingHint="Add SPL-child-USA-feldman.jpg to data/references/ and run npm run import:data."
        />
      </div>
    </section>
  );
}
