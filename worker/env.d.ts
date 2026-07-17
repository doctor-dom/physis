/// <reference types="@cloudflare/workers-types" />

interface Env {
  ASSETS: Fetcher;
  DEPLOY_STATE: KVNamespace;
  GITHUB_TOKEN: string;
}
