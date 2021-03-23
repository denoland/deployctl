// Copyright 2021 Deno Land Inc. All rights reserved. MIT license.

import { tsconfig } from "./tsconfig.ts";
import {
  DEPLOY_FETCHEVENT_D_TS_URL,
  DEPLOY_NS_D_TS_URL,
  DEPLOY_WINDOW_D_TS_URL,
} from "./types.ts";

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
function loaderCode(specifier: URL, addr: string, libs: {
  ns: boolean;
  window: boolean;
  fetchevent: boolean;
}) {
  let loader = "";
  if (libs.ns) loader += `import type {} from "${DEPLOY_NS_D_TS_URL}";`;
  if (libs.window) loader += `import type {} from "${DEPLOY_WINDOW_D_TS_URL}";`;
  if (libs.fetchevent) {
    loader += `import type {} from "${DEPLOY_FETCHEVENT_D_TS_URL}";`;
  }
  loader += `import "${specifier}";`;

  const runtimeBundleUrl = new URL(
    "../runtime.bundle.js",
    import.meta.url,
  );
  const loaderB64 = btoa(loader);
  const runtime =
    `import{serve}from "${runtimeBundleUrl.toString()}";serve("${addr}");await import("data:application/typescript;base64,${loaderB64}");`;
  return runtime;
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

  const args = ["--config", tsconfigPath];
  if (opts.noCheck) args.push("--no-check");
  if (opts.inspect) args.push("--inspect");
  if (opts.reload) args.push("--reload");

  const loader = loaderCode(opts.entrypoint, opts.listenAddress, opts.libs);

  const proc = Deno.run({
    cmd: [Deno.execPath(), "eval", ...args, loader],
  });

  return proc;
}
