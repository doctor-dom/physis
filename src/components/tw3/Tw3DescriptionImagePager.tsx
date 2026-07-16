import { useCallback, useEffect, useState } from "react";
import type { Tw3MaturityRating } from "@core/calculators/tw3/types";
import type { Tw3AtlasAsset } from "../../data/tw3/atlasManifest";
import { getDescriptionImageIndexForRating } from "../../data/tw3/atlasStageRadioLayout";

interface Tw3DescriptionImagePagerProps {
  images: Tw3AtlasAsset[];
  altPrefix: string;
  label?: string;
  maxHeightClass?: string;
  initialRating?: Tw3MaturityRating;
  showHeader?: boolean;
}

function ChevronIcon({ direction }: { direction: "left" | "right" }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className="h-4 w-4"
      aria-hidden="true"
    >
      {direction === "left" ? (
        <path
          fillRule="evenodd"
          d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z"
          clipRule="evenodd"
        />
      ) : (
        <path
          fillRule="evenodd"
          d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
          clipRule="evenodd"
        />
      )}
    </svg>
  );
}

interface ZoomedImageProps {
  image: Tw3AtlasAsset;
  altPrefix: string;
  onClose: () => void;
}

function ZoomedImage({ image, altPrefix, onClose }: ZoomedImageProps) {
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

  const alt = `${altPrefix} — ${image.label}`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8"
      role="dialog"
      aria-modal="true"
      aria-label={alt}
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/85"
        onClick={onClose}
        aria-label="Close zoomed image"
      />
      <div className="relative z-10 flex max-h-full max-w-full flex-col items-center gap-3">
        <img
          src={image.src}
          alt={alt}
          className="max-h-[min(90vh,1200px)] max-w-[min(95vw,1400px)] object-contain rounded-lg shadow-2xl"
        />
        <p className="max-w-prose text-center text-sm text-white/90">{image.label}</p>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg bg-white/15 px-4 py-2 text-sm font-medium text-white hover:bg-white/25"
        >
          Close
        </button>
      </div>
    </div>
  );
}

export default function Tw3DescriptionImagePager({
  images,
  altPrefix,
  label = "Stage descriptions",
  maxHeightClass = "max-h-56 sm:max-h-72",
  initialRating,
  showHeader = true,
}: Tw3DescriptionImagePagerProps) {
  const [index, setIndex] = useState(() =>
    initialRating ? getDescriptionImageIndexForRating(initialRating) : 0,
  );
  const [zoomOpen, setZoomOpen] = useState(false);

  const imageCount = images.length;
  const currentImage = images[index];
  const canGoPrev = index > 0;
  const canGoNext = index < imageCount - 1;

  useEffect(() => {
    setIndex(
      initialRating ? getDescriptionImageIndexForRating(initialRating) : 0,
    );
  }, [images, initialRating]);

  const goPrev = useCallback(() => {
    setIndex((i) => Math.max(0, i - 1));
  }, []);

  const goNext = useCallback(() => {
    setIndex((i) => Math.min(imageCount - 1, i + 1));
  }, [imageCount]);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowLeft" && canGoPrev) {
      e.preventDefault();
      goPrev();
    } else if (e.key === "ArrowRight" && canGoNext) {
      e.preventDefault();
      goNext();
    }
  }

  if (!currentImage) {
    return null;
  }

  const showNav = imageCount > 1;

  return (
    <div className="min-w-0">
      {showHeader && (
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
      )}

      <div
        className="rounded-lg border border-teal-100 bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2"
        tabIndex={showNav ? 0 : undefined}
        role={showNav ? "group" : undefined}
        aria-label={showNav ? `${label} image pager` : undefined}
        onKeyDown={showNav ? handleKeyDown : undefined}
      >
        <div className="relative flex items-center justify-center">
          {!showHeader && (
            <button
              type="button"
              onClick={() => setZoomOpen(true)}
              className="absolute right-1 top-1 z-10 rounded-md bg-white/95 px-2 py-0.5 text-[10px] font-medium text-teal-700 shadow-sm hover:text-teal-900 sm:right-2"
            >
              Zoom
            </button>
          )}
          {showNav && (
            <button
              type="button"
              onClick={goPrev}
              disabled={!canGoPrev}
              aria-label={`Previous ${label} image`}
              className="absolute left-1 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-teal-200 bg-white/95 text-teal-800 shadow-sm transition hover:bg-teal-50 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white/95 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 sm:left-2 sm:h-9 sm:w-9"
            >
              <ChevronIcon direction="left" />
            </button>
          )}

          <img
            src={currentImage.src}
            alt={`${altPrefix} — ${currentImage.label}`}
            className={`block w-full ${maxHeightClass} h-auto object-contain`}
          />

          {showNav && (
            <button
              type="button"
              onClick={goNext}
              disabled={!canGoNext}
              aria-label={`Next ${label} image`}
              className="absolute right-1 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-teal-200 bg-white/95 text-teal-800 shadow-sm transition hover:bg-teal-50 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white/95 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 sm:right-2 sm:h-9 sm:w-9"
            >
              <ChevronIcon direction="right" />
            </button>
          )}
        </div>

        {showNav && (
          <div
            className="flex items-center justify-between gap-2 border-t border-teal-100 px-3 py-2 text-[10px] text-teal-600"
            aria-live="polite"
          >
            <span className="font-medium text-teal-700 truncate">{currentImage.label}</span>
            <span className="shrink-0 tabular-nums">
              {index + 1} of {imageCount}
            </span>
          </div>
        )}
      </div>

      {zoomOpen && (
        <ZoomedImage
          image={currentImage}
          altPrefix={altPrefix}
          onClose={() => setZoomOpen(false)}
        />
      )}
    </div>
  );
}
