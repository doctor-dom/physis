import { useState } from "react";
import { loadGrowthChartViewPayload } from "@core/cdc/growthChartViewStorage";
import GrowthChartViewer from "../components/cdc/GrowthChartViewer";

export default function GrowthChartViewPage() {
  const [payload] = useState(() => loadGrowthChartViewPayload());

  if (!payload) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-slate-100 p-6">
        <div className="max-w-md rounded-xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-950">
          <p className="font-semibold">No chart data available</p>
          <p className="mt-2">
            Open a growth chart from the PHYSIS workflow and click the chart image
            to launch this viewer.
          </p>
        </div>
      </div>
    );
  }

  return <GrowthChartViewer sex={payload.sex} data={payload.data} />;
}
