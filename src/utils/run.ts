// Copyright 2021 Deno Land Inc. All rights reserved. MIT license.

import { toFileUrl } from "../../deps.ts";
import { tsconfig } from "./tsconfig.ts";
import { types } from "./types.ts";

interface Libs {
  ns: boolean;
  window: boolean;
  fetchevent: boolean;
}

/**
 * This function generates a snippet of code that can be used to run a Deploy
 * script in regular Deno, with the correct typings. The run script requires
 * `--allow-net` for dynamically importing DEPLOY_D_TS_URL, and `--allow-read` /
 * `--allow-net` for dynamically importing the entrypoint script.
 */
// We need to load the runtime code using the regular Deno typings first (the
// `lib.deno.d.ts` types). After this is done, we need to switch the types to
// use the custom typings. This is done by dynamically importing a _inline_
// module (base64 data url). This module loads the new type definitions, and
// statically imports the new user supplied entrypoint.
async function runnerCode(
  specifier: URL,
  addr: string,
  libs: Libs,
): Promise<string> {
  const runtimeBundleUrl = new URL(
    "../runtime.bundle.js",
    import.meta.url,
  );
  return `import{shim}from "${runtimeBundleUrl.toString()}";shim("${addr}");await import("${await loaderDataUrl(
    specifier,
    libs,
  )}");`;
}
/**
 * Returns a loader script of the given Deno Deploy script as a Data URL.
 */
export async function loaderDataUrl(
  specifier: URL,
  { ns, window, fetchevent }: Libs,
): Promise<string> {
  let loader = "";
  const typePaths = await types();
  if (ns) loader += `import type {} from "${toFileUrl(typePaths.ns)}";`;
  if (window) loader += `import type {} from "${toFileUrl(typePaths.window)}";`;
  if (fetchevent) {
    loader += `import type {} from "${toFileUrl(typePaths.fetchevent)}";`;
  }
  loader += `import "${specifier}";`;
  return `data:application/typescript;base64,${btoa(loader)}`;
}

export interface RunOpts {
  /** The entrypoint of the script. */
  entrypoint: URL;
  /** The address the script should listen on. */
  listenAddress: string;

  /** If code should be run with --no-check or not. */
  noCheck: boolean;
  /** If the inspector should be enabled. */
  inspect: boolean;
  /** If modules should be reloaded. */
  reload: boolean;
  /** Envirnoment variables for the script. */
  env: { [key: string]: string };

  libs: {
    ns: boolean;
    window: boolean;
    fetchevent: boolean;
  };
}

/**
 * Run the given entrypoint at the given address. Returns the spawned process.
 */
export async function run(opts: RunOpts): Promise<Deno.Process> {
  const tsconfigPath = await tsconfig();

  // NOTE: unstable is required because we make use of the `Deno.startHttp` API.
  const args = ["--config", tsconfigPath, "--unstable"];
  if (opts.noCheck) args.push("--no-check");
  if (opts.inspect) args.push("--inspect");
  if (opts.reload) args.push("--reload");

  const runner = await runnerCode(
    opts.entrypoint,
    opts.listenAddress,
    opts.libs,
  );

  const proc = Deno.run({
    cmd: [Deno.execPath(), "eval", ...args, runner],
    env: opts.env,
  });

  return proc;
}
