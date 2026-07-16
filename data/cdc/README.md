# CDC growth chart images

Place CDC **Set 1** (5th/95th percentile) combined **stature-for-age and weight-for-age** charts for ages 2–20 here as PNG files:

| File | Chart |
|------|--------|
| `stature-weight-2-20-boys.png` | Boys stature + weight |
| `stature-weight-2-20-girls.png` | Girls stature + weight |

Use the English **color press-ready** PDFs from [CDC clinical growth charts](https://www.cdc.gov/growthcharts/cdc-charts.htm), exported at full resolution (recommended width ≥ 1200 px).

After adding or replacing files, run:

```bash
npm run import:data
```

This copies images to `public/cdc/` and updates overlay cache-busting.

**Stature plotting:** Uses calibrated pixel anchors in `chartManifest.ts`. To recalibrate from hand-marked points, see `data/cdc/landmarks/README.md` and open `/cdc-landmark-tool.html` while the dev server is running.
