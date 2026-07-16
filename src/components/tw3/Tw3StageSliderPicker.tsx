import { useCallback, useEffect, useMemo, useState } from "react";
import type { Tw3LandmarkId, Tw3MaturityRating } from "@core/calculators/tw3/types";
import { getStageImagesForLandmark } from "../../data/tw3/atlasStageManifest";
import { Tw3AtlasRatingAChip } from "./Tw3AtlasStageRadioOverlay";

const DRAW_ORDER: Tw3MaturityRating[] = ["B", "C", "D", "E", "F", "G", "H", "I"];

function ratingIndex(ratings: Tw3MaturityRating[], rating?: Tw3MaturityRating): number {
  if (!rating) return 0;
  const idx = ratings.indexOf(rating);
  return idx >= 0 ? idx : 0;
}

interface Tw3StageSliderPickerProps {
  landmarkId: Tw3LandmarkId;
  scoringTitle: string;
  availableRatings: Tw3MaturityRating[];
  selectedRating?: Tw3MaturityRating;
  onSelectRating: (rating: Tw3MaturityRating) => void;
  initialRating?: Tw3MaturityRating;
}

export default function Tw3StageSliderPicker({
  landmarkId,
  scoringTitle,
  availableRatings,
  selectedRating,
  onSelectRating,
  initialRating,
}: Tw3StageSliderPickerProps) {
  const stageImages = getStageImagesForLandmark(landmarkId);
  const drawableStages = useMemo(
    () =>
      DRAW_ORDER.filter((rating) => availableRatings.includes(rating))
        .map((rating) => stageImages.find((s) => s.rating === rating) ?? null)
        .filter((entry): entry is NonNullable<typeof entry> => entry !== null),
    [availableRatings, stageImages],
  );

  const startIndex = useMemo(() => {
    const hint = selectedRating && selectedRating !== "A" ? selectedRating : initialRating;
    return ratingIndex(
      drawableStages.map((s) => s.rating),
      hint && hint !== "A" ? hint : undefined,
    );
  }, [drawableStages, initialRating, selectedRating]);

  const [sliderIndex, setSliderIndex] = useState(startIndex);
  const [zoomOpen, setZoomOpen] = useState(false);

  useEffect(() => {
    setSliderIndex(startIndex);
  }, [landmarkId, startIndex]);

  const current = drawableStages[sliderIndex];
  const sliderMax = Math.max(0, drawableStages.length - 1);

  const handleSelectCurrent = useCallback(() => {
    if (current) onSelectRating(current.rating);
  }, [current, onSelectRating]);

  useEffect(() => {
    if (!zoomOpen) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setZoomOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [zoomOpen]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (zoomOpen) return;
      if (e.key === "ArrowLeft" && sliderIndex > 0) {
        e.preventDefault();
        setSliderIndex((i) => i - 1);
      } else if (e.key === "ArrowRight" && sliderIndex < sliderMax) {
        e.preventDefault();
        setSliderIndex((i) => i + 1);
      } else if (e.key === "Enter" && current) {
        e.preventDefault();
        onSelectRating(current.rating);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [current, onSelectRating, sliderIndex, sliderMax, zoomOpen]);

  if (drawableStages.length === 0) {
    if (availableRatings.length === 0) {
      return null;
    }
    return (
      <p className="text-sm text-teal-700">
        No stage images found for this landmark. Add PNGs under{" "}
        <code className="text-xs">data/atlas/individual-stages/</code> and run{" "}
        <code className="text-xs">npm run import:data</code>.
      </p>
    );
  }

  const isCurrentSelected = current && selectedRating === current.rating;

  const stageSlider = (
    <div className="px-0.5">
      <div className="mb-1 flex items-center justify-between text-[10px] text-teal-600">
        <span>Stage</span>
        <span className="font-semibold tabular-nums text-teal-800">
          {current?.rating ?? "—"}
          {drawableStages.length > 1 && (
            <span className="ml-1 font-normal text-teal-500">
              ({sliderIndex + 1}/{drawableStages.length})
            </span>
          )}
        </span>
      </div>
      <input
        type="range"
        min={0}
        max={sliderMax}
        step={1}
        value={sliderIndex}
        onChange={(e) => setSliderIndex(Number(e.target.value))}
        className="w-full h-2 accent-teal-600 cursor-pointer"
        aria-label={`Scan ${scoringTitle} maturity stages`}
        aria-valuetext={current ? `Stage ${current.rating}` : undefined}
      />
      <div className="mt-1 flex justify-between text-[9px] text-teal-500 tabular-nums">
        <span>{drawableStages[0]?.rating}</span>
        <span>{drawableStages[drawableStages.length - 1]?.rating}</span>
      </div>
    </div>
  );

  const stageDescription = current && (
    <div className="min-w-0 p-3 sm:p-4">
      <p className="text-sm font-semibold text-teal-900">Stage {current.rating}</p>
      {current.descriptionLines.length > 0 ? (
        <ul className="mt-2 space-y-1.5 text-xs leading-relaxed text-teal-800">
          {current.descriptionLines.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-xs text-teal-600">No description available for this stage.</p>
      )}
    </div>
  );

  return (
    <div className="min-w-0 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-teal-600">
          Stage drawings
        </p>
        <button
          type="button"
          onClick={() => setZoomOpen(true)}
          className="text-[10px] font-medium text-teal-700 hover:text-teal-900 underline-offset-2 hover:underline shrink-0"
        >
          Zoom
        </button>
      </div>

      {availableRatings.includes("A") && (
        <Tw3AtlasRatingAChip
          landmarkId={landmarkId}
          selectedRating={selectedRating}
          availableRatings={availableRatings}
          onSelectRating={onSelectRating}
        />
      )}

      <div
        className={`overflow-hidden rounded-lg border bg-white ${
          isCurrentSelected ? "border-teal-500 ring-2 ring-teal-200" : "border-teal-100"
        }`}
      >
        {current && (
          <div className="flex flex-col gap-0 sm:grid sm:grid-cols-[minmax(7rem,32%)_minmax(0,1fr)]">
            <label
              className="group relative flex cursor-pointer items-center justify-center border-b border-teal-100 bg-white p-3 sm:border-b-0 sm:border-r"
              title={`Select stage ${current.rating}`}
            >
              <input
                type="radio"
                name={`rating-${landmarkId}`}
                value={current.rating}
                checked={!!isCurrentSelected}
                onChange={handleSelectCurrent}
                className="absolute h-px w-px overflow-hidden whitespace-nowrap border-0 p-0 [clip:rect(0,0,0,0)]"
                aria-label={`Select stage ${current.rating}`}
              />
              <img
                src={current.referenceSrc}
                alt={`${scoringTitle} — stage ${current.rating}`}
                className="max-h-48 w-full object-contain sm:max-h-64"
                draggable={false}
              />
              <span className="pointer-events-none absolute inset-0 bg-teal-900/0 transition group-hover:bg-teal-900/[0.03]" />
            </label>

            <div className="border-b border-teal-100 px-3 py-2 sm:hidden">{stageSlider}</div>

            {stageDescription}
          </div>
        )}
      </div>

      <p className="text-[10px] text-teal-600">
        Slide to scan stages, then tap the drawing to select{" "}
        {current ? `stage ${current.rating}` : ""} and continue.
      </p>

      <div className="hidden sm:block">{stageSlider}</div>

      {zoomOpen && current && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8"
          role="dialog"
          aria-modal="true"
          aria-label={`${scoringTitle} stage ${current.rating}`}
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/85"
            onClick={() => setZoomOpen(false)}
            aria-label="Close zoomed image"
          />
          <div className="relative z-10 max-h-[90vh] max-w-[95vw] overflow-auto rounded-lg bg-black/20 p-2">
            <img
              src={current.referenceSrc}
              alt={`${scoringTitle} — stage ${current.rating}`}
              className="max-h-[85vh] w-auto object-contain"
            />
            <div className="mt-3 flex justify-center">
              <button
                type="button"
                onClick={() => setZoomOpen(false)}
                className="rounded-lg bg-white/15 px-4 py-2 text-sm font-medium text-white hover:bg-white/25"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
