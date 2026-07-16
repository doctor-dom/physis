import type { Tw3LandmarkId } from "@core/calculators/tw3/types";
import { TW3_MATURITY_RATINGS, type Tw3MaturityRating } from "@core/calculators/tw3/types";
import { getAvailableRatings } from "@core/calculators/tw3/calculateTw3BoneAge";
import type { Tw3SmsScoreTable } from "../data/tw3/smsScores";
import { getAtlasForLandmark, getAtlasStagePanels } from "../data/tw3/atlasManifest";
import ZoomableImage from "./ZoomableImage";

interface Tw3LandmarkPanelProps {
  landmarkId: Tw3LandmarkId;
  label: string;
  smsScores: Tw3SmsScoreTable;
  selectedRating?: Tw3MaturityRating;
  onSelectRating: (rating: Tw3MaturityRating) => void;
  score?: number;
}

export default function Tw3LandmarkPanel({
  landmarkId,
  label,
  smsScores,
  selectedRating,
  onSelectRating,
  score,
}: Tw3LandmarkPanelProps) {
  const atlas = getAtlasForLandmark(landmarkId);
  const available = getAvailableRatings(smsScores, landmarkId);

  return (
    <div className="rounded-xl border border-teal-100 bg-white p-4 shadow-sm space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-semibold text-teal-900">{label}</h3>
        {selectedRating && score !== undefined && (
          <span className="text-sm text-teal-700">
            Rating {selectedRating} → {score} pts
          </span>
        )}
      </div>

      {atlas && (
        <div className="space-y-3">
          <p className="text-xs font-medium uppercase tracking-wide text-teal-600">
            Reference atlas
          </p>
          <div className="grid gap-4 lg:grid-cols-2">
            {getAtlasStagePanels(atlas).map((panel) => (
              <article
                key={panel.reference.src}
                className="overflow-hidden rounded-lg border border-teal-100 bg-teal-50/20"
              >
                <header className="border-b border-teal-100 bg-teal-50/50 px-3 py-2">
                  <h4 className="text-sm font-medium text-teal-800">{panel.reference.label}</h4>
                </header>
                <div className="space-y-3 p-3 md:grid md:grid-cols-2 md:gap-3 md:space-y-0">
                  <figure className="space-y-1">
                    <figcaption className="text-xs font-medium uppercase tracking-wide text-teal-600">
                      Reference drawing
                    </figcaption>
                    <ZoomableImage
                      src={panel.reference.src}
                      alt={`${label} — ${panel.reference.label} — reference drawing`}
                      className="bg-teal-50/30"
                    />
                  </figure>
                  <figure className="space-y-1">
                    <figcaption className="text-xs font-medium uppercase tracking-wide text-teal-600">
                      Stage descriptions
                    </figcaption>
                    <ZoomableImage
                      src={panel.description.src}
                      alt={`${label} — ${panel.description.label} — stage descriptions`}
                      className="bg-white"
                    />
                  </figure>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}

      <div>
        <p className="mb-2 text-sm font-medium text-teal-900">Maturity rating</p>
        <div className="flex flex-wrap gap-2">
          {TW3_MATURITY_RATINGS.map((rating) => {
            const isAvailable = available.includes(rating);
            const isSelected = selectedRating === rating;
            return (
              <button
                key={rating}
                type="button"
                disabled={!isAvailable}
                onClick={() => onSelectRating(rating)}
                className={`min-w-[2.5rem] rounded-lg px-3 py-2 text-sm font-semibold transition ${
                  isSelected
                    ? "bg-teal-700 text-white shadow-md"
                    : isAvailable
                      ? "border border-teal-200 bg-white text-teal-900 hover:bg-teal-50"
                      : "border border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed"
                }`}
              >
                {rating}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
