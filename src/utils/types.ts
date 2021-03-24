import { cache } from "../../deps.ts";

export async function types(): Promise<
  { ns: string; window: string; fetchevent: string }
> {
  const ns = await cache(
    new URL("../../types/deploy.ns.d.ts", import.meta.url),
  );
  const window = await cache(
    new URL("../../types/deploy.window.d.ts", import.meta.url),
  );
  const fetchevent = await cache(
    new URL("../../types/deploy.fetchevent.d.ts", import.meta.url),
  );
  return {
    ns: ns.path,
    window: window.path,
    fetchevent: fetchevent.path,
  };
}

/** Download the deploy.d.ts file from the source. */
export async function downloadTypes(): Promise<string> {
  const { ns, window, fetchevent } = await types();
  const [nsText, windowText, fetcheventText] = await Promise.all([
    Deno.readTextFile(ns),
    Deno.readTextFile(window),
    Deno.readTextFile(fetchevent),
  ]);
  return nsText + "\n" + windowText + "\n" + fetcheventText;
}
