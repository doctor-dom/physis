import { useCallback, useEffect, useMemo, useRef, useState, type PointerEvent } from "react";
import { createPortal } from "react-dom";
import type { Tw3LandmarkId, Tw3MaturityRating } from "@core/calculators/tw3/types";
import { getStageImagesForLandmark } from "../../data/tw3/atlasStageManifest";
import { Tw3AtlasRatingAChip } from "./Tw3AtlasStageRadioOverlay";

const DRAW_ORDER: Tw3MaturityRating[] = ["B", "C", "D", "E", "F", "G", "H", "I"];

/** Tailwind `sm` breakpoint — horizontal slider / side-by-side layout at and above this width. */
const SM_MEDIA_QUERY = "(min-width: 640px)";

function ratingIndex(ratings: Tw3MaturityRating[], rating?: Tw3MaturityRating): number {
  if (!rating) return 0;
  const idx = ratings.indexOf(rating);
  return idx >= 0 ? idx : 0;
}

function clampIndex(index: number, max: number): number {
  if (max <= 0) return 0;
  return Math.min(Math.max(0, index), max);
}

function useIsSmUp(): boolean {
  const [isSmUp, setIsSmUp] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia(SM_MEDIA_QUERY).matches : true,
  );

  useEffect(() => {
    const mq = window.matchMedia(SM_MEDIA_QUERY);
    const update = () => setIsSmUp(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return isSmUp;
}

type SliderOrientation = "horizontal" | "vertical";

interface Tw3DiscreteStageSliderProps {
  stages: { rating: Tw3MaturityRating }[];
  index: number;
  onIndexChange: (index: number) => void;
  scoringTitle: string;
  orientation?: SliderOrientation;
}

function Tw3DiscreteStageSlider({
  stages,
  index,
  onIndexChange,
  scoringTitle,
  orientation = "horizontal",
}: Tw3DiscreteStageSliderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);
  const [dragging, setDragging] = useState(false);
  const sliderMax = Math.max(0, stages.length - 1);
  const safeIndex = clampIndex(index, sliderMax);
  const current = stages[safeIndex];
  const snapPercent = sliderMax === 0 ? 0 : (safeIndex / sliderMax) * 100;
  const [visualPercent, setVisualPercent] = useState(snapPercent);
  const vertical = orientation === "vertical";

  useEffect(() => {
    if (!draggingRef.current) {
      setVisualPercent(snapPercent);
    }
  }, [snapPercent]);

  const indexFromClient = useCallback(
    (clientX: number, clientY: number) => {
      const track = containerRef.current;
      if (!track || stages.length <= 1) return 0;
      const rect = track.getBoundingClientRect();
      if (vertical) {
        if (rect.height <= 0) return 0;
        const y = Math.min(Math.max(clientY - rect.top, 0), rect.height);
        return clampIndex(Math.round((y / rect.height) * sliderMax), sliderMax);
      }
      if (rect.width <= 0) return 0;
      const x = Math.min(Math.max(clientX - rect.left, 0), rect.width);
      return clampIndex(Math.round((x / rect.width) * sliderMax), sliderMax);
    },
    [sliderMax, stages.length, vertical],
  );

  const percentFromClient = useCallback(
    (clientX: number, clientY: number) => {
      const track = containerRef.current;
      if (!track || stages.length <= 1) return 0;
      const rect = track.getBoundingClientRect();
      if (vertical) {
        if (rect.height <= 0) return snapPercent;
        const y = Math.min(Math.max(clientY - rect.top, 0), rect.height);
        return (y / rect.height) * 100;
      }
      if (rect.width <= 0) return snapPercent;
      const x = Math.min(Math.max(clientX - rect.left, 0), rect.width);
      return (x / rect.width) * 100;
    },
    [snapPercent, stages.length, vertical],
  );

  const commitIndex = useCallback(
    (next: number) => {
      onIndexChange(clampIndex(next, sliderMax));
    },
    [onIndexChange, sliderMax],
  );

  const updateFromPointer = useCallback(
    (clientX: number, clientY: number, snapIndex?: number) => {
      setVisualPercent(percentFromClient(clientX, clientY));
      commitIndex(snapIndex ?? indexFromClient(clientX, clientY));
    },
    [commitIndex, indexFromClient, percentFromClient],
  );

  const beginDrag = useCallback(
    (event: PointerEvent<HTMLElement>, nextIndex?: number) => {
      event.preventDefault();
      if (nextIndex !== undefined) {
        const markPercent = sliderMax === 0 ? 0 : (nextIndex / sliderMax) * 100;
        setVisualPercent(markPercent);
        commitIndex(nextIndex);
      } else {
        updateFromPointer(event.clientX, event.clientY);
      }
      draggingRef.current = true;
      setDragging(true);
      containerRef.current?.setPointerCapture(event.pointerId);
    },
    [commitIndex, sliderMax, updateFromPointer],
  );

  const handlePointerMove = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      if (!draggingRef.current) return;
      updateFromPointer(event.clientX, event.clientY);
    },
    [updateFromPointer],
  );

  const snapVisualPercent = sliderMax === 0 ? 0 : (safeIndex / sliderMax) * 100;

  const endDrag = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      draggingRef.current = false;
      setDragging(false);
      setVisualPercent(snapVisualPercent);
      if (containerRef.current?.hasPointerCapture(event.pointerId)) {
        containerRef.current.releasePointerCapture(event.pointerId);
      }
    },
    [snapVisualPercent],
  );

  const handleTrackPointerDown = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      const target = event.target as HTMLElement;
      if (target.closest("[data-stage-mark]") || target.closest("[data-slider-thumb]")) {
        return;
      }
      beginDrag(event);
    },
    [beginDrag],
  );

  const header = (
    <div
      className={`mb-2 flex items-center text-[10px] text-teal-600 ${
        vertical ? "flex-col gap-1" : "justify-between"
      }`}
    >
      <span>Stage</span>
      <span className="font-semibold tabular-nums text-teal-800">
        {current?.rating ?? "—"}
        {stages.length > 1 && (
          <span className="ml-1 font-normal text-teal-500">
            ({safeIndex + 1}/{stages.length})
          </span>
        )}
      </span>
    </div>
  );

  if (vertical) {
    return (
      <div className="flex select-none flex-col items-center px-0.5">
        {header}
        <div
          ref={containerRef}
          role="slider"
          aria-orientation="vertical"
          aria-label={`Scan ${scoringTitle} maturity stages`}
          aria-valuemin={0}
          aria-valuemax={sliderMax}
          aria-valuenow={safeIndex}
          aria-valuetext={current ? `Stage ${current.rating}` : undefined}
          tabIndex={0}
          onKeyDown={(event) => {
            event.stopPropagation();
            if (event.key === "ArrowUp") {
              event.preventDefault();
              commitIndex(safeIndex - 1);
            } else if (event.key === "ArrowDown") {
              event.preventDefault();
              commitIndex(safeIndex + 1);
            } else if (event.key === "Home") {
              event.preventDefault();
              commitIndex(0);
            } else if (event.key === "End") {
              event.preventDefault();
              commitIndex(sliderMax);
            }
          }}
          onPointerDown={handleTrackPointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onLostPointerCapture={() => {
            draggingRef.current = false;
            setDragging(false);
            setVisualPercent(snapVisualPercent);
          }}
          className={`relative h-52 w-12 touch-none outline-none focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2 rounded-full ${
            dragging ? "cursor-grabbing" : "cursor-pointer"
          }`}
        >
          <div className="pointer-events-none absolute inset-y-0 left-1/2 w-4 -translate-x-1/2 rounded-full bg-teal-100">
            <div
              className={`absolute inset-x-0 top-0 rounded-full bg-teal-300/40 ${
                dragging ? "" : "transition-[height] duration-200 ease-out"
              }`}
              style={{ height: `${visualPercent}%` }}
            />
          </div>

          {stages.map((stage, stageIndex) => {
            const markPercent = sliderMax === 0 ? 0 : (stageIndex / sliderMax) * 100;
            return (
              <button
                key={stage.rating}
                type="button"
                data-stage-mark
                onPointerDown={(event) => {
                  event.stopPropagation();
                  beginDrag(event, stageIndex);
                }}
                className="absolute left-1/2 z-10 -translate-x-1/2 -translate-y-1/2 p-0"
                style={{ top: `${markPercent}%` }}
                aria-label={`Jump to stage ${stage.rating}`}
                aria-current={stageIndex === safeIndex ? "true" : undefined}
              >
                <span className="flex h-7 w-10 items-center justify-center rounded-full bg-teal-100 text-[11px] font-bold leading-none text-black">
                  {stage.rating}
                </span>
              </button>
            );
          })}

          <div
            data-slider-thumb
            onPointerDown={(event) => {
              event.stopPropagation();
              beginDrag(event);
            }}
            className={`absolute left-1/2 z-30 flex h-7 w-10 -translate-x-1/2 -translate-y-1/2 cursor-grab items-center justify-center rounded-full bg-white text-[11px] font-bold leading-none text-black shadow-[0_1px_5px_rgba(15,118,110,0.3)] touch-none ${
              dragging ? "cursor-grabbing scale-[1.04]" : ""
            } ${dragging ? "" : "transition-[top,transform] duration-200 ease-out"}`}
            style={{ top: `${visualPercent}%` }}
            aria-hidden
          >
            {current?.rating}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-0.5 select-none">
      {header}
      <div
        ref={containerRef}
        role="slider"
        aria-orientation="horizontal"
        aria-label={`Scan ${scoringTitle} maturity stages`}
        aria-valuemin={0}
        aria-valuemax={sliderMax}
        aria-valuenow={safeIndex}
        aria-valuetext={current ? `Stage ${current.rating}` : undefined}
        tabIndex={0}
        onKeyDown={(event) => {
          event.stopPropagation();
          if (event.key === "ArrowLeft") {
            event.preventDefault();
            commitIndex(safeIndex - 1);
          } else if (event.key === "ArrowRight") {
            event.preventDefault();
            commitIndex(safeIndex + 1);
          } else if (event.key === "Home") {
            event.preventDefault();
            commitIndex(0);
          } else if (event.key === "End") {
            event.preventDefault();
            commitIndex(sliderMax);
          }
        }}
        onPointerDown={handleTrackPointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onLostPointerCapture={() => {
          draggingRef.current = false;
          setDragging(false);
          setVisualPercent(snapVisualPercent);
        }}
        className={`relative h-10 touch-none outline-none focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2 rounded-full ${
          dragging ? "cursor-grabbing" : "cursor-pointer"
        }`}
      >
        <div className="pointer-events-none absolute inset-x-0 top-1/2 h-4 -translate-y-1/2 rounded-full bg-teal-100">
          <div
            className={`absolute inset-y-0 left-0 rounded-full bg-teal-300/40 ${
              dragging ? "" : "transition-[width] duration-200 ease-out"
            }`}
            style={{ width: `${visualPercent}%` }}
          />
        </div>

        {stages.map((stage, stageIndex) => {
          const markPercent = sliderMax === 0 ? 0 : (stageIndex / sliderMax) * 100;
          return (
            <button
              key={stage.rating}
              type="button"
              data-stage-mark
              onPointerDown={(event) => {
                event.stopPropagation();
                beginDrag(event, stageIndex);
              }}
              className="absolute top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 p-0"
              style={{ left: `${markPercent}%` }}
              aria-label={`Jump to stage ${stage.rating}`}
              aria-current={stageIndex === safeIndex ? "true" : undefined}
            >
              <span className="flex h-7 w-10 items-center justify-center rounded-full bg-teal-100 text-[11px] font-bold leading-none text-black">
                {stage.rating}
              </span>
            </button>
          );
        })}

        <div
          data-slider-thumb
          onPointerDown={(event) => {
            event.stopPropagation();
            beginDrag(event);
          }}
          className={`absolute top-1/2 z-30 flex h-7 w-10 -translate-x-1/2 -translate-y-1/2 cursor-grab items-center justify-center rounded-full bg-white text-[11px] font-bold leading-none text-black shadow-[0_1px_5px_rgba(15,118,110,0.3)] touch-none ${
            dragging ? "cursor-grabbing scale-[1.04]" : ""
          } ${dragging ? "" : "transition-[left,transform] duration-200 ease-out"}`}
          style={{ left: `${visualPercent}%` }}
          aria-hidden
        >
          {current?.rating}
        </div>
      </div>
    </div>
  );
}

interface Tw3StageSliderPickerProps {
  landmarkId: Tw3LandmarkId;
  scoringTitle: string;
  availableRatings: Tw3MaturityRating[];
  selectedRating?: Tw3MaturityRating;
  onSelectRating: (rating: Tw3MaturityRating) => void;
  initialRating?: Tw3MaturityRating;
  /** Under-hand host for the vertical slider on mobile (<sm). */
  mobileSliderHost?: HTMLElement | null;
}

export default function Tw3StageSliderPicker({
  landmarkId,
  scoringTitle,
  availableRatings,
  selectedRating,
  onSelectRating,
  initialRating,
  mobileSliderHost = null,
}: Tw3StageSliderPickerProps) {
  const isSmUp = useIsSmUp();
  const sliderOrientation: SliderOrientation = isSmUp ? "horizontal" : "vertical";

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

  const sliderMax = Math.max(0, drawableStages.length - 1);
  const [sliderIndex, setSliderIndex] = useState(() => clampIndex(startIndex, sliderMax));
  const [zoomOpen, setZoomOpen] = useState(false);

  const setStageIndex = useCallback(
    (next: number) => {
      setSliderIndex(clampIndex(next, sliderMax));
    },
    [sliderMax],
  );

  useEffect(() => {
    setSliderIndex(clampIndex(startIndex, sliderMax));
  }, [landmarkId, startIndex, sliderMax]);

  const safeSliderIndex = clampIndex(sliderIndex, sliderMax);
  const current = drawableStages[safeSliderIndex];

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
      if (e.key === "ArrowLeft" && safeSliderIndex > 0) {
        e.preventDefault();
        setStageIndex(safeSliderIndex - 1);
      } else if (e.key === "ArrowRight" && safeSliderIndex < sliderMax) {
        e.preventDefault();
        setStageIndex(safeSliderIndex + 1);
      } else if (e.key === "ArrowUp" && !isSmUp && safeSliderIndex > 0) {
        e.preventDefault();
        setStageIndex(safeSliderIndex - 1);
      } else if (e.key === "ArrowDown" && !isSmUp && safeSliderIndex < sliderMax) {
        e.preventDefault();
        setStageIndex(safeSliderIndex + 1);
      } else if (e.key === "Enter" && current) {
        e.preventDefault();
        onSelectRating(current.rating);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [
    current,
    isSmUp,
    onSelectRating,
    safeSliderIndex,
    setStageIndex,
    sliderMax,
    zoomOpen,
  ]);

  if (drawableStages.length === 0) {
    if (availableRatings.length === 0) {
      return null;
    }
    return (
      <p className="text-sm text-teal-700">
        No stage images found for this landmark. Add PNGs under{" "}
        <code className="text-xs">data/atlas/stages-v2/</code> and run{" "}
        <code className="text-xs">npm run import:data</code>.
      </p>
    );
  }

  const isCurrentSelected = current && selectedRating === current.rating;

  const stageSlider = (
    <Tw3DiscreteStageSlider
      stages={drawableStages}
      index={safeSliderIndex}
      onIndexChange={setStageIndex}
      scoringTitle={scoringTitle}
      orientation={sliderOrientation}
    />
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

  const enterButton = (
    <button
      type="button"
      onClick={handleSelectCurrent}
      disabled={!current}
      className="w-full rounded-lg border border-teal-600 bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:border-teal-200 disabled:bg-teal-200 disabled:text-teal-500 sm:w-auto"
    >
      Enter{current ? ` — stage ${current.rating}` : ""}
    </button>
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

      {/* Mobile: portal vertical slider into left column under the hand XR map. */}
      {!isSmUp &&
        mobileSliderHost &&
        createPortal(
          <div className="rounded-lg border border-teal-100 bg-white px-1 py-2">
            {stageSlider}
          </div>,
          mobileSliderHost,
        )}

      <div
        className={`overflow-hidden rounded-lg border bg-white ${
          isCurrentSelected ? "border-teal-500 ring-2 ring-teal-200" : "border-teal-100"
        }`}
      >
        {current && (
          <div className="flex flex-col">
            {/* Mobile: image above description. sm+: image | description side-by-side. */}
            <div className="flex flex-col sm:grid sm:grid-cols-[minmax(7rem,32%)_minmax(0,1fr)]">
              <label
                className="group relative flex h-44 shrink-0 cursor-pointer items-center justify-center border-b border-teal-100 bg-white p-3 sm:h-56 sm:border-b-0 sm:border-r"
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
                  key={`${landmarkId}-${current.rating}`}
                  src={current.referenceSrc}
                  alt={`${scoringTitle} — stage ${current.rating}`}
                  className="max-h-full max-w-full object-contain"
                  draggable={false}
                />
                <span className="pointer-events-none absolute inset-0 bg-teal-900/0 transition group-hover:bg-teal-900/[0.03]" />
              </label>

              {stageDescription}
            </div>

            {isSmUp && (
              <div className="shrink-0 border-t border-teal-100 px-3 py-2.5">{stageSlider}</div>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        {enterButton}
        <p className="text-[10px] text-teal-600 sm:text-right">
          Slide to scan stages, then press Enter
          {current ? ` to select stage ${current.rating}` : ""} and continue. You can
          also tap the drawing.
        </p>
      </div>

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
