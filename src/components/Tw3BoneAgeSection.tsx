import { useEffect, useMemo, useRef, useState } from "react";
import CopyClinicalSummaryButton from "./CopyClinicalSummaryButton";
import { ResultCard } from "./FormFields";
import AgeInput from "./AgeInput";
import { buildTw3BoneAgeClinicalSummary } from "@core/formatTw3BoneAgeClinicalSummary";
import ZoomableImage from "./ZoomableImage";
import Tw3HandNavigator from "./tw3/Tw3HandNavigator";
import Tw3ProgressBar from "./tw3/Tw3ProgressBar";
import Tw3StageCarousel from "./tw3/Tw3StageCarousel";
import { useTw3AtlasPreload } from "../hooks/useTw3AtlasPreload";
import { calculateTw3BoneAge, getAvailableRatings } from "@core/calculators/tw3/calculateTw3BoneAge";
import {
  TW3_RUS_LANDMARKS,
  type Tw3LandmarkId,
  type Tw3MaturityRating,
} from "@core/calculators/tw3/types";
import {
  TW3_REFERENCE_CHARTS,
  getTw3ReferenceChartsForSex,
} from "../data/tw3/atlasManifest";
import { TW3_HAND_REGIONS } from "../data/tw3/handLandmarkRegions";
import { getTw3SmsScores } from "../data/tw3/smsScores";
import { getTw3SmsToBoneAgeChart } from "../data/tw3/smsToBoneAge";
import type { Sex } from "@core/types";

interface Tw3BoneAgeSectionProps {
  sex: Sex | null;
  onSexChange: (sex: Sex) => void;
  chronAgeYears: string;
  onChronAgeChange: (v: string) => void;
  ratings: Partial<Record<Tw3LandmarkId, Tw3MaturityRating>>;
  onRatingsChange: (
    ratings: Partial<Record<Tw3LandmarkId, Tw3MaturityRating>>,
  ) => void;
  onContinueToPrediction: (boneAgeYears: number) => void;
}

function scoringTitleForLandmark(id: Tw3LandmarkId): string {
  return TW3_HAND_REGIONS.find((r) => r.id === id)?.scoringTitle ?? id;
}

export default function Tw3BoneAgeSection({
  sex,
  onSexChange,
  chronAgeYears,
  onChronAgeChange,
  ratings,
  onRatingsChange,
  onContinueToPrediction,
}: Tw3BoneAgeSectionProps) {
  const [activeLandmark, setActiveLandmark] = useState<Tw3LandmarkId>("radius");
  const [lastSelectedRating, setLastSelectedRating] = useState<
    Tw3MaturityRating | undefined
  >();
  const resultsRef = useRef<HTMLDivElement>(null);
  const hasScrolledToResults = useRef(false);

  const smsScores = sex ? getTw3SmsScores(sex) : null;
  const smsChart = sex ? getTw3SmsToBoneAgeChart(sex) : null;
  const referenceCharts = sex ? getTw3ReferenceChartsForSex(sex) : null;

  const scoredSet = useMemo(() => {
    return new Set(
      TW3_RUS_LANDMARKS.filter((l) => ratings[l.id] !== undefined).map(
        (l) => l.id,
      ),
    );
  }, [ratings]);

  useTw3AtlasPreload(activeLandmark, scoredSet);

  const completedCount = scoredSet.size;
  const allScored = completedCount === TW3_RUS_LANDMARKS.length;

  useEffect(() => {
    if (allScored && !hasScrolledToResults.current) {
      hasScrolledToResults.current = true;
      const timer = window.setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 350);
      return () => window.clearTimeout(timer);
    }
    if (!allScored) {
      hasScrolledToResults.current = false;
    }
  }, [allScored]);

  const result = useMemo(() => {
    if (!sex || !smsScores || !smsChart) return null;
    try {
      return calculateTw3BoneAge({
        sex,
        landmarkRatings: ratings,
        smsScores,
        smsToBoneAgeChart: smsChart,
      });
    } catch (e) {
      return { error: (e as Error).message };
    }
  }, [sex, ratings, smsScores, smsChart]);

  const clinicalSummary = useMemo(() => {
    if (!allScored || !result || "error" in result) return null;
    const chronAge = parseFloat(chronAgeYears);
    if (Number.isNaN(chronAge)) return null;
    return buildTw3BoneAgeClinicalSummary({
      chronAgeYears: chronAge,
      boneAgeYears: result.value.boneAgeYears,
      skeletalMaturityScore: result.value.skeletalMaturityScore,
    });
  }, [allScored, result, chronAgeYears]);

  const available =
    smsScores && sex
      ? getAvailableRatings(smsScores, activeLandmark)
      : [];

  function setRating(landmarkId: Tw3LandmarkId, rating: Tw3MaturityRating) {
    if (!sex) return;
    setLastSelectedRating(rating);
    onRatingsChange({ ...ratings, [landmarkId]: rating });
    const next = TW3_RUS_LANDMARKS.find(
      (l) => l.id !== landmarkId && ratings[l.id] === undefined,
    );
    if (next && landmarkId === activeLandmark) {
      setTimeout(() => setActiveLandmark(next.id), 200);
    }
  }

  function handleSexChange(next: Sex) {
    onSexChange(next);
  }

  const handNavigatorPanel = (
    <aside className="flex flex-col gap-2 rounded-2xl border border-teal-100 bg-white p-2 shadow-sm lg:sticky lg:top-4">
      <Tw3HandNavigator
        compact
        activeLandmarkId={activeLandmark}
        scoredLandmarkIds={scoredSet}
        onSelectLandmark={setActiveLandmark}
      />
      <Tw3ProgressBar
        compact
        completed={completedCount}
        total={TW3_RUS_LANDMARKS.length}
      />
      <div className="flex flex-wrap justify-center gap-x-2 gap-y-1 text-[9px] text-teal-700 px-1">
        <span className="flex items-center gap-0.5">
          <span className="h-2 w-2 rounded-sm bg-gray-300 border border-gray-400" /> Not scored
        </span>
        <span className="flex items-center gap-0.5">
          <span className="h-2 w-2 rounded-sm bg-yellow-400" /> Active
        </span>
        <span className="flex items-center gap-0.5">
          <span className="h-2 w-2 rounded-sm bg-green-500" /> Done
        </span>
      </div>
    </aside>
  );

  return (
    <div className="space-y-6 -mx-2 sm:mx-0">
      <div
        className={`rounded-xl border px-4 py-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between ${
          sex
            ? "border-teal-200 bg-teal-50/50"
            : "border-amber-300 bg-amber-50/70"
        }`}
      >
        <div>
          {sex ? (
            <>
              <p className="text-sm font-semibold text-teal-900">
                Patient sex: {sex === "male" ? "Male" : "Female"}
              </p>
              <p className="text-xs text-teal-700 mt-0.5">
                Scoring uses{" "}
                {sex === "male" ? "Table A5 (RUS points)" : "Table A6 (RUS points)"}{" "}
                and SMS → bone age from{" "}
                {sex === "male" ? "Table A1" : "Table A3"}.
              </p>
            </>
          ) : (
            <>
              <p className="text-sm font-semibold text-amber-900">
                Select patient sex to begin scoring
              </p>
              <p className="text-xs text-amber-800 mt-0.5">
                RUS point values and SMS-to-bone-age conversion differ between boys
                and girls. Changing sex later keeps your stage selections.
              </p>
            </>
          )}
        </div>
        <label className="shrink-0">
          <span className="sr-only">Patient sex</span>
          <select
            value={sex ?? ""}
            onChange={(e) => {
              const next = e.target.value;
              if (next === "male" || next === "female") {
                handleSexChange(next);
              }
            }}
            className={`rounded-md border bg-white px-2 py-1.5 text-xs focus:outline-none focus:ring-1 ${
              sex
                ? "border-teal-200 text-teal-900 focus:border-teal-500 focus:ring-teal-200"
                : "border-amber-300 text-amber-900 font-medium focus:border-amber-500 focus:ring-amber-200"
            }`}
          >
            <option value="" disabled>
              Select sex…
            </option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </label>
      </div>

      {sex && (
        <AgeInput
          label="Chronological age"
          hint="Required for clinical documentation copy. Carries forward to height prediction."
          valueYears={chronAgeYears}
          onChangeYears={onChronAgeChange}
          modes={["decimal", "years-months", "months"]}
          defaultMode="years-months"
        />
      )}

      <div className="-mx-2 grid grid-cols-[minmax(108px,22%)_minmax(0,1fr)] gap-2 sm:mx-0 sm:gap-3 lg:grid-cols-[minmax(132px,16%)_minmax(0,1fr)] lg:gap-4 lg:items-start">
        {handNavigatorPanel}

        <div className="min-w-0">
          <Tw3StageCarousel
            landmarkId={activeLandmark}
            scoringTitle={scoringTitleForLandmark(activeLandmark)}
            selectedRating={ratings[activeLandmark]}
            availableRatings={available}
            onSelectRating={(rating) => setRating(activeLandmark, rating)}
            initialScrollRating={lastSelectedRating}
            score={
              result && !("error" in result)
                ? result.value.landmarkScores[activeLandmark]
                : ratings[activeLandmark] && smsScores
                  ? smsScores[activeLandmark]?.[ratings[activeLandmark]!]
                  : undefined
            }
          />
        </div>
      </div>

      {referenceCharts && (
        <details className="rounded-xl border border-teal-100 bg-white p-4">
          <summary className="cursor-pointer text-sm font-medium text-teal-800">
            TW3 reference tables ({sex === "male" ? "boys" : "girls"})
          </summary>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            <figure className="space-y-1.5">
              <figcaption className="text-xs font-medium text-teal-800">
                {referenceCharts.rusPointTableLabel}
              </figcaption>
              <ZoomableImage
                src={referenceCharts.rusPointTable}
                alt={referenceCharts.rusPointTableLabel}
              />
            </figure>
            <figure className="space-y-1.5">
              <figcaption className="text-xs font-medium text-teal-800">
                {referenceCharts.smsToBoneAgeLabel}
              </figcaption>
              <ZoomableImage
                src={referenceCharts.smsToBoneAgeChart}
                alt={referenceCharts.smsToBoneAgeLabel}
              />
            </figure>
          </div>
          <details className="mt-3 rounded-lg border border-teal-100 bg-teal-50/30 p-3">
            <summary className="cursor-pointer text-xs font-medium text-teal-700">
              Stage drawing rubric (sex-neutral)
            </summary>
            <div className="mt-2">
              <ZoomableImage
                src={TW3_REFERENCE_CHARTS.rubric}
                alt="Bone maturity stage scoring rubric"
              />
            </div>
          </details>
        </details>
      )}

      {!sex && (
        <p className="text-xs text-amber-800 rounded-lg border border-amber-200 bg-amber-50/80 px-3 py-2">
          Choose male or female above, then assign a maturity stage to each landmark on
          the hand graphic.
        </p>
      )}

      {sex && !allScored && (
        <p className="text-xs text-teal-700">
          Score all {TW3_RUS_LANDMARKS.length} landmarks on the hand graphic. SMS
          and bone age will appear automatically when the last stage is selected.
        </p>
      )}

      <div ref={resultsRef}>
        {allScored && result && "error" in result ? (
          <ResultCard title="TW3 result" error={result.error} />
        ) : allScored && result && !("error" in result) ? (
          <div className="space-y-4">
            <ResultCard
              title="TW3 bone age"
              value={`${result.value.boneAgeYears.toFixed(2)} years`}
              interpretation={`SMS: ${result.value.skeletalMaturityScore} (${result.value.completedLandmarks}/13 landmarks). ${result.interpretation ?? ""}`}
              warning={result.warning}
            />
            <CopyClinicalSummaryButton summary={clinicalSummary} />
            {!clinicalSummary && (
              <p className="text-xs text-teal-700">
                Enter chronological age above to enable copy for clinical documentation.
              </p>
            )}
            <button
              type="button"
              onClick={() => onContinueToPrediction(result.value.boneAgeYears)}
              className="inline-flex w-full items-center justify-center rounded-xl bg-teal-700 px-4 py-3 text-sm font-semibold text-white shadow-md hover:bg-teal-800 sm:w-auto"
            >
              Continue to adult height prediction →
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
