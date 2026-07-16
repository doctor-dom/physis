import { useEffect } from "react";
import {
  TW3_RUS_LANDMARKS,
  type Tw3LandmarkId,
} from "@core/calculators/tw3/types";
import { getAllStageImageUrlsForLandmark } from "../data/tw3/atlasStageManifest";

const preloaded = new Set<string>();

function preloadUrls(urls: string[]) {
  for (const url of urls) {
    if (preloaded.has(url)) continue;
    preloaded.add(url);
    const img = new Image();
    img.src = url;
  }
}

function nextLandmarkToPreload(
  activeLandmarkId: Tw3LandmarkId,
  scoredLandmarkIds: Set<Tw3LandmarkId>,
): Tw3LandmarkId | undefined {
  const activeIndex = TW3_RUS_LANDMARKS.findIndex((l) => l.id === activeLandmarkId);
  for (let i = activeIndex + 1; i < TW3_RUS_LANDMARKS.length; i++) {
    if (!scoredLandmarkIds.has(TW3_RUS_LANDMARKS[i].id)) {
      return TW3_RUS_LANDMARKS[i].id;
    }
  }
  for (const landmark of TW3_RUS_LANDMARKS) {
    if (landmark.id !== activeLandmarkId && !scoredLandmarkIds.has(landmark.id)) {
      return landmark.id;
    }
  }
  return undefined;
}

/** Preload cropped stage images for the active and upcoming landmarks. */
export function useTw3AtlasPreload(
  activeLandmarkId: Tw3LandmarkId,
  scoredLandmarkIds: Set<Tw3LandmarkId>,
) {
  useEffect(() => {
    preloadUrls(getAllStageImageUrlsForLandmark(activeLandmarkId));
    const upcoming = nextLandmarkToPreload(activeLandmarkId, scoredLandmarkIds);
    if (upcoming) {
      preloadUrls(getAllStageImageUrlsForLandmark(upcoming));
    }
  }, [activeLandmarkId, scoredLandmarkIds]);
}

export function preloadTw3LandmarkStages(landmarkId: Tw3LandmarkId) {
  preloadUrls(getAllStageImageUrlsForLandmark(landmarkId));
}
