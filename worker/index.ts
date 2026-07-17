import { syncDeployFromGitHub } from "./githubSync";

export default {
  async fetch(request, env): Promise<Response> {
    return env.ASSETS.fetch(request);
  },

  async scheduled(_event, env, ctx): Promise<void> {
    ctx.waitUntil(
      syncDeployFromGitHub(env).catch((error: unknown) => {
        console.error(
          "GitHub sync failed:",
          error instanceof Error ? error.message : error,
        );
      }),
    );
  },
} satisfies ExportedHandler<Env>;
