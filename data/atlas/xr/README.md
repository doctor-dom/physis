# TW3 high-resolution X-ray reference images

This folder holds **per-rating X-ray (XR) images** for each RUS landmark. A future app update will let users click a reference drawing and view the matching XR for a selected maturity grade (A–I), instead of (or alongside) the line-drawing atlas.

**Current atlas drawings** remain in `data/atlas/` (root). **XR assets** live only under `data/atlas/xr/`.

---

## Folder layout

```
data/atlas/xr/
  README.md                 ← this file
  radius/
    A.jpg
    B.jpg
    …
    I.jpg
  ulna/
    A.jpg … H.jpg           ← no I rating for ulna (see table below)
  metacarpal_1/
  metacarpal_3/
  metacarpal_5/
  proximal_phalanx_1/
  proximal_phalanx_3/
  proximal_phalanx_5/
  middle_phalanx_3/
  middle_phalanx_5/
  distal_phalanx_1/
  distal_phalanx_3/
  distal_phalanx_5/
```

After `npm run import:data` (or `npm run dev`), files are copied to `public/atlas/xr/` with the same paths and served at `/atlas/xr/…`.

---

## Naming rules

| Rule | Value |
|------|--------|
| **Landmark folder** | Exact `landmark_id` from the app (lowercase, underscores) |
| **File name** | Maturity rating letter: `A`, `B`, `C`, `D`, `E`, `F`, `G`, `H`, or `I` |
| **Extension** | `.jpg` (preferred for XR), `.jpeg`, `.png`, or `.webp` |
| **Case** | Rating letter **uppercase** in the filename |

**Examples**

| Path | Meaning |
|------|---------|
| `xr/radius/E.jpg` | Radius, maturity rating E |
| `xr/metacarpal_3/F.png` | 3rd metacarpal, rating F |
| `xr/proximal_phalanx_1/B.jpg` | 1st proximal phalanx, rating B |

**Do not** use spaces, `stage-` prefixes, or landmark nicknames in folder names (e.g. avoid `3rd MC` or `radius2`).

---

## Landmark folder names (must match exactly)

| Folder name | TW3 label |
|-------------|-----------|
| `radius` | Radius |
| `ulna` | Ulna |
| `metacarpal_1` | 1st metacarpal |
| `metacarpal_3` | 3rd metacarpal |
| `metacarpal_5` | 5th metacarpal |
| `proximal_phalanx_1` | 1st proximal phalanx |
| `proximal_phalanx_3` | 3rd proximal phalanx |
| `proximal_phalanx_5` | 5th proximal phalanx |
| `middle_phalanx_3` | 3rd middle phalanx |
| `middle_phalanx_5` | 5th middle phalanx |
| `distal_phalanx_1` | 1st distal phalanx |
| `distal_phalanx_3` | 3rd distal phalanx |
| `distal_phalanx_5` | 5th distal phalanx |

---

## Required ratings per landmark

Only create files for ratings that exist in the TW3 SMS tables. Missing ratings are disabled in the scorer UI.

| Landmark | Ratings (files to provide) |
|----------|----------------------------|
| `radius` | A, B, C, D, E, F, G, H, I |
| `ulna` | A, B, C, D, E, F, G, H — **no I** |
| `metacarpal_1` | A–I |
| `metacarpal_3` | A–I |
| `metacarpal_5` | A–I |
| `proximal_phalanx_1` | A–I |
| `proximal_phalanx_3` | A–I |
| `proximal_phalanx_5` | A–I |
| `middle_phalanx_3` | A–I |
| `middle_phalanx_5` | A–I |
| `distal_phalanx_1` | A–I |
| `distal_phalanx_3` | A–I |
| `distal_phalanx_5` | A–I |

**Maximum:** 116 XR files (13 landmarks × 9 ratings, minus ulna I).

---

## Image guidelines

- **Content:** Representative pediatric hand/wrist XR cropped or framed so the scored bone is clearly visible, matching TW3 RUS staging for that rating.
- **Resolution:** Prefer high resolution (e.g. 1200–2400 px on the long edge); the app zoom/lightbox will display them full-screen.
- **Format:** JPEG at high quality is fine for radiographs; PNG if you need lossless.
- **Orientation:** Consistent orientation per landmark helps comparison (e.g. same wrist rotation for all radius images).
- **Privacy:** Use de-identified images with appropriate institutional approval (e.g. CHP database exports). Do not commit PHI.

---

## Optional: sex-specific XR (future)

If male and female XR differ materially, use an extra directory level **before** the rating file:

```
data/atlas/xr/male/radius/B.jpg
data/atlas/xr/female/radius/B.jpg
```

The app does not use this layout yet. When implemented, paths will be documented here. Until then, use the flat `xr/{landmark}/{rating}.jpg` layout.

---

## Workflow once images are ready

1. Place files in `data/atlas/xr/{landmark_id}/{RATING}.jpg` (or `.png` / `.webp`).
2. Run:
   ```bash
   npm run import:data
   ```
   Or restart `npm run dev` (import runs automatically).
3. Confirm files appear under `public/atlas/xr/…`.
4. Future UI will resolve URLs via `src/data/tw3/xrAtlasPaths.ts`.

---

## Checklist (copy and track)

```
[xr/radius]     A B C D E F G H I
[xr/ulna]       A B C D E F G H
[xr/metacarpal_1]     A B C D E F G H I
[xr/metacarpal_3]     A B C D E F G H I
[xr/metacarpal_5]     A B C D E F G H I
[xr/proximal_phalanx_1] A B C D E F G H I
[xr/proximal_phalanx_3] A B C D E F G H I
[xr/proximal_phalanx_5] A B C D E F G H I
[xr/middle_phalanx_3]   A B C D E F G H I
[xr/middle_phalanx_5]   A B C D E F G H I
[xr/distal_phalanx_1]   A B C D E F G H I
[xr/distal_phalanx_3]   A B C D E F G H I
[xr/distal_phalanx_5]   A B C D E F G H I
```

---

## Related code (for future implementation)

| File | Role |
|------|------|
| `src/data/tw3/xrAtlasPaths.ts` | URL builder for XR assets |
| `src/data/tw3/atlasManifest.ts` | Line-drawing atlas (current) |
| `scripts/import-clinical-data.mjs` | Copies `data/atlas/**` → `public/atlas/` |

Planned UX: user selects maturity rating → reference panel can switch from line drawing composite to the matching `xr/{landmark}/{rating}.jpg` in the zoom viewer.
