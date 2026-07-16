/**
 * TW3 high-resolution X-ray image paths (future feature).
 *
 * Assets live in data/atlas/xr/{landmark_id}/{RATING}.jpg
 * See data/atlas/xr/README.md for full naming and placement instructions.
 */

import type { Tw3LandmarkId, Tw3MaturityRating } from "../../core/calculators/tw3/types";
import { ATLAS_CACHE_BUST } from "./atlasVersion";

export const TW3_XR_IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"] as const;

/** Relative path under /atlas/ (no leading slash). */
export function tw3XrRelativePath(
  landmarkId: Tw3LandmarkId,
  rating: Tw3MaturityRating,
  extension: string = ".jpg",
): string {
  const ext = extension.startsWith(".") ? extension : `.${extension}`;
  return `xr/${landmarkId}/${rating}${ext}`;
}

/** Public URL for an XR image, with cache-bust query param. */
export function tw3XrPublicUrl(
  landmarkId: Tw3LandmarkId,
  rating: Tw3MaturityRating,
  extension: string = ".jpg",
): string {
  const relative = tw3XrRelativePath(landmarkId, rating, extension);
  return `/atlas/${encodeURI(relative)}?v=${ATLAS_CACHE_BUST}`;
}

/**
 * Candidate URLs to probe when extension is unknown (first existing file wins at runtime).
 * Future UI can use this list when loading XR by rating.
 */
export function tw3XrPublicUrlCandidates(
  landmarkId: Tw3LandmarkId,
  rating: Tw3MaturityRating,
): string[] {
  return TW3_XR_IMAGE_EXTENSIONS.map((ext) =>
    tw3XrPublicUrl(landmarkId, rating, ext),
  );
}
