export const DEPLOY_NS_D_TS_URL =
  "https://dotcom-7sw6g9ofe-denoland.vercel.app/deploy.ns.d.ts";
export const DEPLOY_WINDOW_D_TS_URL =
  "https://dotcom-7sw6g9ofe-denoland.vercel.app/deploy.window.d.ts";
export const DEPLOY_FETCHEVENT_D_TS_URL =
  "https://dotcom-7sw6g9ofe-denoland.vercel.app/deploy.fetchevent.d.ts";

/** Download the deploy.d.ts file from the source. */
export async function downloadTypes(): Promise<string> {
  const nsReq = await fetch(DEPLOY_NS_D_TS_URL);
  const windowReq = await fetch(DEPLOY_WINDOW_D_TS_URL);
  const fetcheventReq = await fetch(DEPLOY_FETCHEVENT_D_TS_URL);
  const nsText = await nsReq.text();
  const windowText = await windowReq.text();
  const fetcheventText = await fetcheventReq.text();
  return nsText + "\n" + windowText + "\n" + fetcheventText;
}
