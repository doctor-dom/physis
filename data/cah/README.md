# CAH screening nomogram chart images

Place PNG exports of the nomogram charts alongside the CSV threshold data:

| File | Nomogram |
|------|----------|
| `CAH-2003.png` | Olgemöller 2003 — birth weight + sample age |
| `CAH-2018.png` | Pode-Shakked 2019 — Table 1 (BW / GA / combined stratification) |

Files may live in **`data/excel/`** (same folder as the CSVs) or in this directory (`data/cah/`).

After adding or replacing images, run:

```bash
npm run import:data
```

This copies charts to `public/cah/` for use in the CAH Screening calculator.
