# CDC chart landmarks (manual calibration)

Automated grid detection does not always match how the CDC PNG aligns visually. You can mark anchors yourself and regenerate plotter coordinates.

## Steps

1. Start the dev server: `npm run dev`
2. Open **http://localhost:5173/cdc-landmark-tool.html** (port may differ — check terminal).
3. Select **Boys** or **Girls** chart.
4. For each category in the sidebar, enter the clinical value and **click the matching grid intersection** on the PNG. Zoom in first.
5. **Download landmarks JSON** (or copy to clipboard).
6. Save as:
   - `data/cdc/landmarks/cdc-landmarks-boys.json`
   - `data/cdc/landmarks/cdc-landmarks-girls.json`
7. Run: `npm run apply:cdc-landmarks`
8. For **girls** (if not hand-marked): `npm run bootstrap:cdc-landmarks-girls` copies boys anchors with grid snap, then re-run apply.
9. Copy the generated `scripts/output/*-manifest.json` blocks into `src/data/cdc/chartManifest.ts`.
9. Bump `CDC_PLOT_CAL_VERSION` in `src/core/cdc/chartCoordinates.ts`.
10. Run `npm run test:cdc-calibration` and verify in the app.

## Minimum landmarks (recommended)

| Category | What to click | Suggested values |
|----------|----------------|------------------|
| `stature-left-age` | Vertical grid under age labels (left stature, top) | 2, 3, …, 11 |
| `stature-right-age` | Vertical grid under age labels (right stature, top) | 12, 13, …, 20 |
| `stature-left-cm` | Horizontal grid on left cm scale | 80, 90, …, 165 |
| `stature-right-cm` | Horizontal grid on right cm scale | 150, 160, …, 195 (boys) or 185 (girls) |
| `weight-age` | Vertical grid under age labels (weight panel top) | 2, 4, 6, …, 20 |
| `weight-left-kg` | Horizontal grid on left kg scale (10–45) | 10, 20, 30, 40, 45 |
| `weight-right-kg` | Horizontal grid on right kg scale (45–105) | 45, 60, 75, 90, 105 |

Optional: use **Verification — known clinical point** to mark where your test case (e.g. 12 y / 125 cm) should fall.

## JSON format

```json
{
  "version": 1,
  "filename": "stature-weight-2-20-boys.png",
  "imageWidth": 10200,
  "imageHeight": 13200,
  "landmarks": [
    { "category": "stature-left-age", "value": 10, "x": 4670, "y": 3375 },
    { "category": "stature-left-cm", "value": 125, "x": 3600, "y": 3780 }
  ]
}
```

Coordinates are **native PNG pixels**: origin top-left, x right, y down.
