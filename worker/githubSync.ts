const KV_LAST_SHA_KEY = "last_commit_sha";
const GITHUB_REPO = "doctor-dom/physis";
const GITHUB_BRANCH = "master";
const DEPLOY_WORKFLOW = "deploy.yml";

async function fetchLatestCommitSha(token: string): Promise<string> {
  const url = `https://api.github.com/repos/${GITHUB_REPO}/commits?sha=${GITHUB_BRANCH}&per_page=1`;
  const response = await fetch(url, {
    headers: {
      "User-Agent": "physis-worker",
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`GitHub commits API ${response.status}: ${await response.text()}`);
  }

  const commits = (await response.json()) as { sha: string }[];
  const sha = commits[0]?.sha;
  if (!sha) {
    throw new Error("No commits returned from GitHub");
  }
  return sha;
}

async function dispatchDeployWorkflow(token: string): Promise<void> {
  const url = `https://api.github.com/repos/${GITHUB_REPO}/actions/workflows/${DEPLOY_WORKFLOW}/dispatches`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "User-Agent": "physis-worker",
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ ref: GITHUB_BRANCH }),
  });

  if (response.status !== 204) {
    throw new Error(`GitHub workflow dispatch ${response.status}: ${await response.text()}`);
  }
}

/** Compare latest GitHub commit to KV; dispatch deploy workflow when SHA changes. */
export async function syncDeployFromGitHub(env: Env): Promise<void> {
  if (!env.GITHUB_TOKEN) {
    console.error("GITHUB_TOKEN secret is not configured");
    return;
  }

  const latestSha = await fetchLatestCommitSha(env.GITHUB_TOKEN);
  const storedSha = await env.DEPLOY_STATE.get(KV_LAST_SHA_KEY);

  if (storedSha === latestSha) {
    console.log(`GitHub sync: no change (${latestSha.slice(0, 7)})`);
    return;
  }

  if (storedSha === null) {
    await env.DEPLOY_STATE.put(KV_LAST_SHA_KEY, latestSha);
    console.log(
      `GitHub sync: initialized last SHA (${latestSha.slice(0, 7)}); skipping deploy on first run`,
    );
    return;
  }

  console.log(
    `GitHub sync: new commit ${latestSha.slice(0, 7)} (was ${storedSha.slice(0, 7)}); dispatching deploy`,
  );
  await dispatchDeployWorkflow(env.GITHUB_TOKEN);
  await env.DEPLOY_STATE.put(KV_LAST_SHA_KEY, latestSha);
}
