# PHYSIS

**Pediatric Height Yields: a Score-based Interpretation System**

Pediatric endocrine clinical decision support — bone age scoring, adult height prediction, growth charting, and additional calculators for inpatient and outpatient practice. PHYSIS is a **standalone application built from scratch** for pediatric endocrinology workflows. It draws on published methods and clinical references; it takes inspiration from the Bone Age calculation tool developed by [eatyourpeas](https://github.com/eatyourpeas) and the ClinicalTool [endocrinologist](https://github.com/eatyourpeas/endocrinologist)

**P.H.Y.S.I.S. Production:** [https://calc.dom.doctor](https://calc.dom.doctor)

## Primary workflow: growth & height prediction

The main workflow (`/growth`) guides TW3-RUS bone age scoring through adult height prediction and CDC growth chart visualization.


| Step                 | Feature                                                                                                                                                        |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **TW3 bone age**     | Hand-navigator scoring for all 13 RUS landmarks with stage drawings, descriptions, and SMS → bone age lookup (sex-specific Tables A1/A3, A5/A6)                |
| **Parental stature** | Father/mother heights (cm, in, or ft+in) or direct MPH entry; distinguishes **MPH** (Tanner, TW3) from **MPS** (parental average, adjusted RWT & Khamis-Roche) |
| **APH methods**      | **TW3** (optional MPH adjustment, menarchal status for girls 11–14 y), **adjusted RWT** (supine length correction), **Khamis-Roche** (no bone age required)    |
| **CDC growth chart** | Plots stature and weight vs chronological age and bone-age–shifted age; overlays MPH/MPS and selected predicted adult height                                   |
| **Show work / QC**   | Audit trail of inputs, coefficient lookup, landmark scoring, and discrepancy flags (`ShowWorkSection`)                                                         |
| **Clinical copy**    | Configurable charting summary with method references and TW3 atlas citations                                                                                   |




## Other calculators



### Electrolytes (`/calculators/electrolytes`)


| Tool                                                                                      | Route              |
| ----------------------------------------------------------------------------------------- | ------------------ |
| Sodium balance & replacement (FWD, hyperglycemia correction, hypo/hypernatremia guidance) | `/sodium-balance`  |
| Tubular resorption of phosphate (TRP)                                                     | `/trp`             |
| Calcium clearance ratio (CCR)                                                             | `/ccr`             |
| Calcium correction for albumin                                                            | `/calcium-albumin` |




### Diabetes & fluids (`/calculators`)


| Tool                                       | Route                  |
| ------------------------------------------ | ---------------------- |
| A1c ↔ average glucose ↔ fructosamine ↔ GMI | `/a1c-converter`       |
| Insulin MDI → sliding scale (ISS)          | `/insulin-mdi-iss`     |
| Diluted insulin sliding scale              | `/insulin-diluted-iss` |
| Maintenance IVF (Holliday–Segar)           | `/maintenance-ivf`     |
| Glucose infusion rate — IV and enteral     | `/gir`                 |




### General pediatrics (`/calculators`)


| Tool                                                                  | Route            |
| --------------------------------------------------------------------- | ---------------- |
| BSA (Haycock pediatric, weight-only) & steroid potency wean/converter | `/bsa-steroid`   |
| Pediatric hypertensive BP percentiles (AAP 2017)                      | `/pediatric-bp`  |
| CAH screening (17-OHP, prematurity algorithms)                        | `/cah-screening` |




## Changelog

Completed work tracked in `predeployPHYSIS.txt` ([x] items).

### Growth, bone age & height prediction

- [x] TW3 APH calculator from Tanner et al. (optional MPH adjustment; menarchal status for girls 11–14 y)
- [x] MPH calculation within the app; clear separation of MPH vs true MPS (parental average)
- [x] CDC growth charts plotting height/weight vs CA and BA-shifted age with predicted adult height trajectories
- [x] Replaced standalone original RWT with **Khamis-Roche** as a third APH method (adjusted RWT retained)
- [x] Show-work / QC audit step (`src/core/showWork/buildShowWorkReport.ts`, `src/components/ShowWorkSection.tsx`)
- [x] Copy-to-chart clinical summaries with configurable content and algorithm/atlas references
- [x] Standing vs supine height and other clinical notes moved to hover **info tooltips** for a cleaner UI
- [x] Age input fixes — no auto-padding of decimals/zeros until blur; improved years+months entry



### Electrolytes & calcium

- [x] Free water deficit (hypernatremia)
- [x] Sodium correction for hyponatremia
- [x] Sodium correction with hyperglycemia
- [x] Sodium replacement rate guidance (serum Na rise ≤ 0.5–1 mEq/L per hour; < 10–12 mEq/L in first 24 h)
- [x] Calcium correction with albumin



### Diabetes & nutrition

- [x] Average glucose ↔ fructosamine ↔ A1c (and GMI) converter
- [x] MDI to ISS (insulin sliding scale) conversion
- [x] Maintenance IVF (mIVF) — Holliday–Segar calculations
- [x] GIR calculator — IV and enteral, with combined total



### General pediatrics

- [x] Pediatric age-based hypertension guideline calculator (BP percentiles)
- [x] CAH screening tool (17-OHP with prematurity algorithms)
- [x] BSA calculator — Haycock pediatric and kg-only (JW) options
- [x] Steroid wean calculator / potency converter



### Platform & data

- [x] CDC plotting logic fixes
- [x] Top-banner attribution updated — PHYSIS is an independent app, not a fork of eatyourpeas/endocrinologist
- [x] Deployed to `calc.dom.doctor` via Cloudflare Workers



### Planned (from `predeployPHYSIS.txt`)

- [ ] CHP X-ray atlas images per landmark/stage (`data/atlas/xr/`)
- [ ] Workflow UI polish to match mock-ups; PHYSIS logo
- [ ] TW3 scoring speed improvements (cropped stage images and text)
- [ ] SPL newborn/child and clitoral nomogram calculators (references in `/reference`)
- [ ] IGF-1 Z-score calculator (under consideration)



## Development

```bash
npm install
npm run dev
```



## Web hosting (`calc.dom.doctor`)

Production build output is the `dist/` folder. The app is deployed to **Cloudflare Workers** at `https://calc.dom.doctor`.

### One-time setup

1. **Cloudflare Workers project**
  - [Cloudflare dashboard](https://dash.cloudflare.com) → **Workers & Pages** → deploy via Git or CLI (below).
  - Build command: `npm run build`
  - Build output directory: `dist`
  - Node version: 22 (set in **Settings → Environment variables** → `NODE_VERSION` = `22` if the build fails).
2. **Custom domain (Workers, not Pages)**
  - This project deploys with `npx wrangler deploy` (a **Worker** named `physis`), not Cloudflare Pages.
  - Workers **Custom Domains** do not show a `*.pages.dev` CNAME to copy. Cloudflare creates the DNS record for you **inside the** `dom.doctor` **zone**.
  - `wrangler.jsonc` includes `calc.dom.doctor` as a custom domain route.
  - **Important:** `dom.doctor` nameservers must point to Cloudflare (not GoDaddy) or `calc.dom.doctor` will never resolve publicly.
3. **Move DNS to Cloudflare (required for calc.dom.doctor)**
  - Cloudflare dashboard → **dom.doctor** → **Overview** → copy the 2 Cloudflare nameservers.
  - GoDaddy → **dom.doctor** → **DNS** → **Change nameservers** → **Enter my own nameservers** → paste Cloudflare NS.
  - Wait 15–60 minutes, then redeploy.
4. **GoDaddy DNS** — only if you keep nameservers on GoDaddy and switch to **Pages** hosting instead of Workers. Otherwise skip this step.
5. **KV namespace (scheduled deploy sync)**
  - Create the namespace and paste its id into `wrangler.jsonc` (`DEPLOY_STATE`):
   Replace `REPLACE_WITH_KV_NAMESPACE_ID` in `wrangler.jsonc` with the returned id.
6. **Worker secret: GitHub token**
  - Create a GitHub fine-grained or classic PAT with permission to read the repo and dispatch Actions workflows.
  - Set it on the Worker:
7. **GitHub Actions secrets** (repo → Settings → Secrets and variables → Actions)
  - `CLOUDFLARE_API_TOKEN` — Cloudflare API token with Workers edit permission
  - `CLOUDFLARE_ACCOUNT_ID` — your Cloudflare account id



### Scheduled GitHub sync (midnight UTC)

The Worker entry point is `worker/index.ts`:

- `fetch` — serves the built SPA from the `ASSETS` binding (unchanged user-facing behavior)
- `scheduled` — runs daily at **00:00 UTC** (`triggers.crons` in `wrangler.jsonc`)

Each cron run:

1. Fetches the latest commit on `master` from `doctor-dom/physis`
2. Compares the SHA to the value stored in KV (`DEPLOY_STATE`)
3. On the **first run**, stores the SHA only (no deploy)
4. On **later runs**, if the SHA changed, dispatches the [Deploy PHYSIS](.github/workflows/deploy.yml) GitHub Action, then updates KV

Push-to-`master` still deploys immediately via GitHub Actions; the cron is a nightly check for missed updates.

### Deploy updates

**Git (auto):** push to `master` — GitHub Actions runs `.github/workflows/deploy.yml` (build + `wrangler deploy`).

**CLI (manual):**

```bash
npx wrangler login          # once
npm run deploy
```



### Verify

- `https://calc.dom.doctor` loads the home page
- `https://calc.dom.doctor/growth` loads without 404 (SPA routing via `wrangler.jsonc` `not_found_handling`)



## Android build

```bash
npm run build
npx cap add android   # first time only
npm run cap:sync
npm run cap:open
```



## Importing updated data

After editing source data, run:

```bash
npm run import:data
```

This regenerates TW3 atlas stage manifests, clinical data modules, and copies atlas images (including `data/atlas/xr/`) to `public/atlas/`.

Khamis-Roche coefficients are generated from `data/excel/KR method.pdf` (1994 erratum tables):

```bash
npm run import:kr
```



### TW3 X-ray reference images (planned)

High-resolution XR per maturity rating will live in `data/atlas/xr/`. See **[data/atlas/xr/README.md](data/atlas/xr/README.md)** for folder names, file naming (`{landmark}/{A|B|…|I}.jpg`), checklist, and workflow.

## Clinical notes

- **TRP** < 0.85 → excess phosphorus wasting / hyperparathyroidism
- **CCR** < 0.01 → familial hypocalciuric hypercalcemia (FHH)
- **FWD** uses TBW fraction × weight × (NaSerum/NaTarget − 1)
- **Hyponatremia correction** — target serum sodium rise ≤ 0.5–1 mEq/L per hour and < 10–12 mEq/L over the first 24 hours

For clinical decision support only — verify independently.