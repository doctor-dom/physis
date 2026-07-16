# PHYSIS

Pediatric bone age and height prediction (TW3 RUS → SMS → adjusted RWT). Additional endocrine calculators in **etc.** Forked and developed with substantial work from Dr. Simon Chapman's [eatyourpeas/endocrinologist](https://github.com/eatyourpeas/endocrinologist).

## Calculators

| Tool | Status |
|------|--------|
| Bone age & predicted height (TW3 + adjusted RWT) | Ready |
| Tubular resorption of phosphate (TRP) | Ready |
| Calcium clearance ratio (CCR) | Ready |
| Free water deficit (hypernatremia) | Ready |

## Development

```bash
npm install
npm run dev
```

## Web hosting (`calc.dom.doctor`)

Production build output is the `dist/` folder. The app is deployed to **Cloudflare Pages** at `https://calc.dom.doctor`.

### One-time setup

1. **Cloudflare Pages project**
   - [Cloudflare dashboard](https://dash.cloudflare.com) → **Workers & Pages** → **Create** → **Pages** → **Connect to Git** (recommended) or upload via CLI (below).
   - Build command: `npm run build`
   - Build output directory: `dist`
   - Node version: 22 (set in **Settings → Environment variables** → `NODE_VERSION` = `22` if the build fails).

2. **Custom domain**
   - In the Pages project → **Custom domains** → add `calc.dom.doctor`.
   - Cloudflare shows a CNAME target (e.g. `physis-calc.pages.dev`).

3. **GoDaddy DNS** (`dom.doctor` uses GoDaddy nameservers)
   - GoDaddy → **My Products** → `dom.doctor` → **DNS** → **Add record**
   - Type: **CNAME**
   - Name: `calc`
   - Value: the `*.pages.dev` hostname Cloudflare gave you
   - TTL: 600 seconds (or default)

4. Wait for DNS propagation (usually 5–30 minutes). Cloudflare will provision HTTPS automatically.

### Deploy updates

**Git (auto):** push to the connected branch — Cloudflare rebuilds on each push.

**CLI (manual):**

```bash
npx wrangler login          # once
npm run deploy:pages
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

## Importing updated Excel data

After editing CSVs in `data/excel/`, run:

```bash
npm run import:data
```

This regenerates `src/data/rwt/coefficients.ts` and copies all atlas images (including `data/atlas/xr/`) to `public/atlas/`.

Khamis-Roche coefficients are generated from `data/excel/KR method.pdf` (1994 erratum tables):

```bash
npm run import:kr
```

### TW3 X-ray reference images (future)

High-resolution XR per maturity rating will live in `data/atlas/xr/`. See **[data/atlas/xr/README.md](data/atlas/xr/README.md)** for folder names, file naming (`{landmark}/{A|B|…|I}.jpg`), checklist, and workflow.

## Clinical notes

- **TRP** &lt; 0.85 → excess phosphorus wasting / hyperparathyroidism
- **CCR** &lt; 0.01 → familial hypocalciuric hypercalcemia (FHH)
- **FWD** uses TBW fraction × weight × (NaSerum/NaTarget − 1)

For clinical decision support only — verify independently.
