/**
 * Displayed app version and last-update date in the header (above feedback icons).
 * Bump these when creating a release tag (`npm run release:tag`).
 */
export const APP_VERSION = "0.6.2";

/** ISO date (YYYY-MM-DD) of the last tagged/released update. */
export const APP_LAST_UPDATED = "2026-08-04";

export function formatAppVersionLabel(version = APP_VERSION): string {
  return `v${version.replace(/^v/, "")}`;
}

export function formatAppLastUpdatedLabel(isoDate = APP_LAST_UPDATED): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  if (!year || !month || !day) return isoDate;
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}
