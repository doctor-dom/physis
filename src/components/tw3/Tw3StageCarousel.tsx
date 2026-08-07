import Tw3StageSliderPicker from "./Tw3StageSliderPicker";
import type { Tw3LandmarkId, Tw3MaturityRating } from "@core/calculators/tw3/types";

interface Tw3StageCarouselProps {
  landmarkId: Tw3LandmarkId;
  scoringTitle: string;
  selectedRating?: Tw3MaturityRating;
  availableRatings: Tw3MaturityRating[];
  onSelectRating: (rating: Tw3MaturityRating) => void;
  score?: number;
  initialScrollRating?: Tw3MaturityRating;
  /** DOM node under the hand XR map; mobile vertical slider portals here. */
  mobileSliderHost?: HTMLElement | null;
}

export default function Tw3StageCarousel({
  landmarkId,
  scoringTitle,
  selectedRating,
  availableRatings,
  onSelectRating,
  score,
  initialScrollRating,
  mobileSliderHost = null,
}: Tw3StageCarouselProps) {
  return (
    <div className="rounded-2xl border border-teal-200 bg-white shadow-sm overflow-hidden">
      <header className="border-b border-teal-100 bg-teal-50/60 px-3 py-2 sm:px-4">
        <h3 className="text-xs sm:text-sm font-semibold text-teal-900">
          Current scoring: {scoringTitle}
        </h3>
        {selectedRating && score !== undefined && (
          <p className="text-xs text-teal-700 mt-0.5">
            Selected stage {selectedRating} → {score} pts
          </p>
        )}
      </header>

      <div className="px-3 py-4 sm:px-4">
        <Tw3StageSliderPicker
          landmarkId={landmarkId}
          scoringTitle={scoringTitle}
          selectedRating={selectedRating}
          availableRatings={availableRatings}
          onSelectRating={onSelectRating}
          initialRating={initialScrollRating}
          mobileSliderHost={mobileSliderHost}
        />
      </div>
    </div>
  );
}
