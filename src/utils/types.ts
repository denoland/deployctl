export const DEPLOY_D_TS_URL =
  "https://dotcom-bugtqqcs0-denoland.vercel.app/static/deploy.d.ts";

/** Download the deploy.d.ts file from the source. */
export async function downloadTypes(): Promise<string> {
  const req = await fetch(DEPLOY_D_TS_URL);
  return req.text();
}
