# PHYSIS hosting & deployment

Production build output is the `dist/` folder. The app is deployed to **Cloudflare Workers** at [https://calc.dom.doctor](https://calc.dom.doctor).

## One-time setup

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

   ```bash
   npx wrangler kv namespace create DEPLOY_STATE
   ```

   Replace the `DEPLOY_STATE` namespace `id` in `wrangler.jsonc` with the returned id.

6. **Worker secret: GitHub token**
   - Create a GitHub fine-grained or classic PAT with permission to read the repo and dispatch Actions workflows.
   - Set it on the Worker:

   ```bash
   npx wrangler secret put GITHUB_TOKEN
   ```

7. **GitHub Actions secrets** (repo → Settings → Secrets and variables → Actions)
   - `CLOUDFLARE_API_TOKEN` — Cloudflare API token with Workers edit permission
   - `CLOUDFLARE_ACCOUNT_ID` — your Cloudflare account id

## Scheduled GitHub sync (midnight UTC)

The Worker entry point is `worker/index.ts`:

- `fetch` — serves the built SPA from the `ASSETS` binding (unchanged user-facing behavior)
- `scheduled` — runs daily at **00:00 UTC** (`triggers.crons` in `wrangler.jsonc`)

Each cron run:

1. Fetches the latest commit on `master` from `doctor-dom/physis`
2. Compares the SHA to the value stored in KV (`DEPLOY_STATE`)
3. On the **first run**, stores the SHA only (no deploy)
4. On **later runs**, if the SHA changed, dispatches the [Deploy PHYSIS](.github/workflows/deploy.yml) GitHub Action, then updates KV

Push-to-`master` still deploys immediately via GitHub Actions; the cron is a nightly check for missed updates.

## Deploy updates

**Git (auto):** push to `master` — GitHub Actions runs `.github/workflows/deploy.yml` (build + `wrangler deploy`).

**CLI (manual):**

```bash
npx wrangler login          # once
npm run deploy
```

## Verify

- `https://calc.dom.doctor` loads the home page
- `https://calc.dom.doctor/growth` loads without 404 (SPA routing via `wrangler.jsonc` `not_found_handling`)
