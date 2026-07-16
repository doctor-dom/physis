import type { Tw3LandmarkId } from "@core/calculators/tw3/types";
import { TW3_REFERENCE_CHARTS } from "../../data/tw3/atlasManifest";
import {
  TW3_HAND_CONTENT_BBOX,
  TW3_HAND_REGIONS,
  TW3_HAND_VIEWBOX,
  getHandRegionFill,
  getHandRegionFillOpacity,
  getHandRegionStroke,
  getHandRegionStrokeWidth,
  type HandRegionStatus,
} from "../../data/tw3/handLandmarkRegions";

interface Tw3HandNavigatorProps {
  activeLandmarkId: Tw3LandmarkId;
  scoredLandmarkIds: Set<Tw3LandmarkId>;
  onSelectLandmark: (id: Tw3LandmarkId) => void;
  compact?: boolean;
  /** Show all hit regions while tuning alignment (dev only). */
  debugOverlay?: boolean;
}

function regionStatus(
  id: Tw3LandmarkId,
  active: Tw3LandmarkId,
  scored: Set<Tw3LandmarkId>,
): HandRegionStatus {
  if (id === active) return "active";
  if (scored.has(id)) return "complete";
  return "pending";
}

const croppedViewBox = `${TW3_HAND_CONTENT_BBOX.x} ${TW3_HAND_CONTENT_BBOX.y} ${TW3_HAND_CONTENT_BBOX.width} ${TW3_HAND_CONTENT_BBOX.height}`;

export default function Tw3HandNavigator({
  activeLandmarkId,
  scoredLandmarkIds,
  onSelectLandmark,
  compact = false,
  debugOverlay = false,
}: Tw3HandNavigatorProps) {
  return (
    <div className={compact ? "w-full" : "relative mx-auto w-full max-w-md"}>
      <svg
        viewBox={croppedViewBox}
        className="w-full h-auto block"
        role="img"
        aria-label="TW3 hand landmark navigator"
        preserveAspectRatio="xMidYMid meet"
      >
        <image
          href={TW3_REFERENCE_CHARTS.handGraphic}
          x={0}
          y={0}
          width={TW3_HAND_VIEWBOX.width}
          height={TW3_HAND_VIEWBOX.height}
          preserveAspectRatio="xMidYMid meet"
        />

        {TW3_HAND_REGIONS.map((region) => {
          const status = regionStatus(
            region.id,
            activeLandmarkId,
            scoredLandmarkIds,
          );
          const fillOpacity = debugOverlay
            ? 0.22
            : getHandRegionFillOpacity(status);
          const stroke = debugOverlay ? "#2563eb" : getHandRegionStroke(status);
          const strokeWidth = debugOverlay
            ? 3
            : getHandRegionStrokeWidth(status);

          return (
            <path
              key={region.id}
              d={region.d}
              fill={debugOverlay ? "#60a5fa" : getHandRegionFill(status)}
              fillOpacity={fillOpacity}
              stroke={stroke}
              strokeWidth={strokeWidth}
              strokeLinejoin="round"
              className="cursor-pointer transition-all duration-200"
              onClick={() => onSelectLandmark(region.id)}
              role="button"
              aria-label={`${region.scoringTitle} — ${status}`}
              aria-current={region.id === activeLandmarkId ? "true" : undefined}
            />
          );
        })}
      </svg>

      {!compact && (
        <div className="mt-2 flex flex-wrap justify-center gap-3 text-xs text-teal-800">
          <span className="flex items-center gap-1">
            <span className="h-3 w-3 rounded-sm bg-white/60 border border-slate-400" /> Not scored
          </span>
          <span className="flex items-center gap-1">
            <span className="h-3 w-3 rounded-sm bg-yellow-400" /> Active
          </span>
          <span className="flex items-center gap-1">
            <span className="h-3 w-3 rounded-sm bg-green-500" /> Complete
          </span>
        </div>
      )}
    </div>
  );
}
