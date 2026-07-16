import { useEffect, useRef, useState } from "react";
import type { Tw3AtlasAsset } from "../../data/tw3/atlasManifest";
import type { Tw3LandmarkId, Tw3MaturityRating } from "@core/calculators/tw3/types";
import { getScrollRatioForRating } from "../../data/tw3/atlasStageRadioLayout";
import Tw3AtlasStageRadioOverlay, {
  Tw3AtlasRatingAChip,
  Tw3AtlasRatingLegend,
} from "./Tw3AtlasStageRadioOverlay";

interface Tw3StitchedImageStripProps {
  images: Tw3AtlasAsset[];
  altPrefix: string;
  scrollRef: React.RefObject<HTMLDivElement | null>;
  onScroll: () => void;
  onImagesReady: () => void;
  maxHeightClass?: string;
  stageRadios?: {
    landmarkId: Tw3LandmarkId;
    selectedRating?: Tw3MaturityRating;
    availableRatings: Tw3MaturityRating[];
    onSelectRating: (rating: Tw3MaturityRating) => void;
  };
}

function Tw3StitchedImageStrip({
  images,
  altPrefix,
  scrollRef,
  onScroll,
  onImagesReady,
  maxHeightClass = "max-h-56 sm:max-h-72",
  stageRadios,
}: Tw3StitchedImageStripProps) {
  const loadedCount = useRef(0);

  function handleImageLoad() {
    loadedCount.current += 1;
    if (loadedCount.current >= images.length) {
      onImagesReady();
    }
  }

  useEffect(() => {
    loadedCount.current = 0;
  }, [images]);

  return (
    <div
      ref={scrollRef}
      onScroll={onScroll}
      className="overflow-x-auto overflow-y-hidden scroll-smooth [scrollbar-width:thin] rounded-lg border border-teal-100 bg-white"
    >
      <div className="flex items-stretch">
        {images.map((image, panelIndex) => (
          <div
            key={image.src}
            data-atlas-panel
            className={`relative shrink-0 ${panelIndex > 0 ? "border-l border-teal-100" : ""}`}
          >
            <img
              src={image.src}
              alt={`${altPrefix} — ${image.label}`}
              onLoad={handleImageLoad}
              className={`block w-auto ${maxHeightClass} h-auto object-contain`}
            />
            {stageRadios && (
              <Tw3AtlasStageRadioOverlay
                landmarkId={stageRadios.landmarkId}
                panelIndex={panelIndex}
                selectedRating={stageRadios.selectedRating}
                availableRatings={stageRadios.availableRatings}
                onSelectRating={stageRadios.onSelectRating}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

interface ZoomedStripProps {
  images: Tw3AtlasAsset[];
  altPrefix: string;
  onClose: () => void;
}

function ZoomedStrip({ images, altPrefix, onClose }: ZoomedStripProps) {
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8"
      role="dialog"
      aria-modal="true"
      aria-label={altPrefix}
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/85"
        onClick={onClose}
        aria-label="Close zoomed image"
      />
      <div className="relative z-10 max-h-[90vh] max-w-[95vw] overflow-x-auto rounded-lg bg-black/20 p-2">
        <div className="flex items-stretch">
          {images.map((image, index) => (
            <img
              key={image.src}
              src={image.src}
              alt={`${altPrefix} — ${image.label}`}
              className={`max-h-[85vh] w-auto object-contain ${index > 0 ? "border-l border-white/20" : ""}`}
            />
          ))}
        </div>
        <div className="mt-3 flex justify-center">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-white/15 px-4 py-2 text-sm font-medium text-white hover:bg-white/25"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function getStripScrollRatio(el: HTMLDivElement | null): number {
  if (!el) return 0;
  const max = el.scrollWidth - el.clientWidth;
  if (max <= 0) return 0;
  return el.scrollLeft / max;
}

function setStripScrollRatio(el: HTMLDivElement | null, ratio: number) {
  if (!el) return;
  const max = el.scrollWidth - el.clientWidth;
  el.scrollLeft = ratio * max;
}

interface Tw3StitchedStripWithZoomProps {
  images: Tw3AtlasAsset[];
  altPrefix: string;
  label: string;
  sliderId: string;
  maxHeightClass?: string;
  stageRadios?: Tw3StitchedImageStripProps["stageRadios"];
  initialScrollRating?: Tw3MaturityRating;
}

export function Tw3StitchedStripWithZoom({
  images,
  altPrefix,
  label,
  sliderId,
  maxHeightClass,
  stageRadios,
  initialScrollRating,
}: Tw3StitchedStripWithZoomProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [zoomOpen, setZoomOpen] = useState(false);
  const [scrollRatio, setScrollRatio] = useState(0);
  const [canScroll, setCanScroll] = useState(false);

  function scrollToInitialRating() {
    const el = scrollRef.current;
    if (!el) return;
    const ratio =
      initialScrollRating && stageRadios
        ? getScrollRatioForRating(el, stageRadios.landmarkId, initialScrollRating)
        : 0;
    applyScrollRatio(ratio);
  }

  function updateCanScroll() {
    const el = scrollRef.current;
    if (!el) return;
    setCanScroll(el.scrollWidth - el.clientWidth > 4);
    scrollToInitialRating();
  }

  function handleScroll() {
    setScrollRatio(getStripScrollRatio(scrollRef.current));
  }

  function applyScrollRatio(ratio: number) {
    const clamped = Math.min(1, Math.max(0, ratio));
    setStripScrollRatio(scrollRef.current, clamped);
    setScrollRatio(clamped);
  }

  useEffect(() => {
    scrollToInitialRating();
    updateCanScroll();
  }, [images, initialScrollRating, stageRadios?.landmarkId]);

  return (
    <div className="min-w-0">
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-teal-600">
          {label}
        </p>
        <button
          type="button"
          onClick={() => setZoomOpen(true)}
          className="text-[10px] font-medium text-teal-700 hover:text-teal-900 underline-offset-2 hover:underline shrink-0"
        >
          Zoom
        </button>
      </div>
      {stageRadios && (
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <Tw3AtlasRatingAChip
            landmarkId={stageRadios.landmarkId}
            selectedRating={stageRadios.selectedRating}
            availableRatings={stageRadios.availableRatings}
            onSelectRating={stageRadios.onSelectRating}
          />
        </div>
      )}
      <Tw3StitchedImageStrip
        images={images}
        altPrefix={altPrefix}
        scrollRef={scrollRef}
        onScroll={handleScroll}
        onImagesReady={updateCanScroll}
        maxHeightClass={maxHeightClass}
        stageRadios={stageRadios}
      />
      {stageRadios && <Tw3AtlasRatingLegend />}
      {canScroll && (
        <div className="mt-2 px-0.5">
          <label
            htmlFor={sliderId}
            className="flex items-center justify-between text-[10px] text-teal-600 mb-1"
          >
            <span>Scroll</span>
            <span className="tabular-nums">{Math.round(scrollRatio * 100)}%</span>
          </label>
          <input
            id={sliderId}
            type="range"
            min={0}
            max={1000}
            value={Math.round(scrollRatio * 1000)}
            onChange={(e) => applyScrollRatio(Number(e.target.value) / 1000)}
            className="w-full h-1.5 accent-teal-600 cursor-pointer"
            aria-label={`Scroll ${label}`}
          />
        </div>
      )}
      {zoomOpen && (
        <ZoomedStrip
          images={images}
          altPrefix={altPrefix}
          onClose={() => setZoomOpen(false)}
        />
      )}
    </div>
  );
}
