import type { Tw3LandmarkId, Tw3MaturityRating } from "@core/calculators/tw3/types";
import {
  getAtlasStageRadioPositions,
  type AtlasStageRadioPosition,
} from "../../data/tw3/atlasStageRadioLayout";

interface Tw3AtlasStageRadioOverlayProps {
  landmarkId: Tw3LandmarkId;
  panelIndex: number;
  selectedRating?: Tw3MaturityRating;
  availableRatings: Tw3MaturityRating[];
  onSelectRating: (rating: Tw3MaturityRating) => void;
}

const radioShadowClass =
  "shadow-[0_2px_6px_rgba(0,0,0,0.35)] ring-2 ring-white/90";

export default function Tw3AtlasStageRadioOverlay({
  landmarkId,
  panelIndex,
  selectedRating,
  availableRatings,
  onSelectRating,
}: Tw3AtlasStageRadioOverlayProps) {
  const anchors = getAtlasStageRadioPositions(landmarkId).filter(
    (pos) => pos.panelIndex === panelIndex,
  );

  return (
    <>
      {anchors.map((anchor) => (
        <StageRadioAnchor
          key={anchor.rating}
          anchor={anchor}
          landmarkId={landmarkId}
          selectedRating={selectedRating}
          isAvailable={availableRatings.includes(anchor.rating)}
          onSelectRating={onSelectRating}
        />
      ))}
    </>
  );
}

function StageRadioAnchor({
  anchor,
  landmarkId,
  selectedRating,
  isAvailable,
  onSelectRating,
}: {
  anchor: AtlasStageRadioPosition;
  landmarkId: Tw3LandmarkId;
  selectedRating?: Tw3MaturityRating;
  isAvailable: boolean;
  onSelectRating: (rating: Tw3MaturityRating) => void;
}) {
  const isSelected = selectedRating === anchor.rating;

  const anchorStyle = {
    left: `${anchor.xRatio * 100}%`,
    top: `${anchor.yRatio * 100}%`,
    transform:
      anchor.anchorOrigin === "center"
        ? "translate(-50%, -50%)"
        : "translate(-50%, 0)",
  };

  if (!isAvailable) {
    return null;
  }

  return (
    <label
      className="absolute cursor-pointer transition hover:scale-110"
      style={anchorStyle}
      title={`Stage ${anchor.rating}`}
    >
      <input
        type="radio"
        name={`rating-${landmarkId}`}
        value={anchor.rating}
        checked={isSelected}
        onChange={() => onSelectRating(anchor.rating)}
        className="absolute h-px w-px overflow-hidden whitespace-nowrap border-0 p-0 [clip:rect(0,0,0,0)]"
        aria-label={`Stage ${anchor.rating}`}
      />
      <StageRadioVisual rating={anchor.rating} selected={isSelected} />
    </label>
  );
}

function StageRadioVisual({
  rating,
  selected = false,
  disabled = false,
}: {
  rating: Tw3MaturityRating;
  selected?: boolean;
  disabled?: boolean;
}) {
  return (
    <span
      className={`flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold leading-none ${
        disabled
          ? "bg-gray-100/60 text-gray-400 opacity-40"
          : selected
            ? `${radioShadowClass} bg-teal-50 text-gray-500 ring-teal-600`
            : `${radioShadowClass} bg-white/95 text-gray-400 hover:ring-teal-300`
      }`}
      aria-hidden="true"
    >
      {rating}
    </span>
  );
}

export function Tw3AtlasRatingAChip({
  landmarkId,
  selectedRating,
  availableRatings,
  onSelectRating,
}: {
  landmarkId: Tw3LandmarkId;
  selectedRating?: Tw3MaturityRating;
  availableRatings: Tw3MaturityRating[];
  onSelectRating: (rating: Tw3MaturityRating) => void;
}) {
  if (!availableRatings.includes("A")) return null;
  const isSelected = selectedRating === "A";

  return (
    <label
      className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-semibold cursor-pointer transition ${
        isSelected
          ? "border-teal-600 bg-teal-50 text-teal-900 ring-2 ring-teal-300 shadow-md"
          : "border-teal-200 bg-white text-teal-900 hover:bg-teal-50 shadow-sm"
      }`}
    >
      <input
        type="radio"
        name={`rating-${landmarkId}`}
        value="A"
        checked={isSelected}
        onChange={() => onSelectRating("A")}
        className="absolute h-px w-px overflow-hidden whitespace-nowrap border-0 p-0 [clip:rect(0,0,0,0)]"
        aria-label="Stage A"
      />
      <StageRadioVisual rating="A" selected={isSelected} />
      <span>Stage A (no drawing)</span>
    </label>
  );
}

export function Tw3AtlasRatingLegend() {
  return (
    <p className="text-[10px] text-teal-600 mt-1">
      Select a stage using the labelled circles below each letter on the drawings.
    </p>
  );
}
