// Copyright 2021 Deno Land Inc. All rights reserved. MIT license.

import { exists, resolve, toFileUrl, yellow } from "../../deps.ts";
import { error } from "../error.ts";
import { analyzeDeps } from "../utils/info.ts";
import { run, RunOpts } from "../utils/run.ts";

const help = `deployctl run
Run a Deno Deploy script locally given a filename or url to the module.

To run a script locally:
  deployctl run https://dash.deno.com/examples/hello.js

To run a script locally and watch for changes:
  deployctl run --watch https://dash.deno.com/examples/hello.js

USAGE:
    deployctl run [OPTIONS] <ENTRYPOINT>

OPTIONS:
        --addr=<addr>   The address to listen on (default ":8080")
    -h, --help          Prints help information
        --inspect       Activate inspector on 127.0.0.1:9229
        --libs=<libs>   The deploy type libs that are loaded (default "ns,window,fetchevent")
        --no-check      Skip type checking modules
    -r, --reload        Reload source code cache (recompile TypeScript)
        --watch         Watch for file changes and restart process automatically
`;

export interface Args {
  addr: string;
  help: boolean;
  noCheck: boolean;
  inspect: boolean;
  reload: boolean;
  watch: boolean;
  libs: {
    ns: boolean;
    window: boolean;
    fetchevent: boolean;
  };
}

// deno-lint-ignore no-explicit-any
export default async function (rawArgs: Record<string, any>): Promise<void> {
  const libs = String(rawArgs.libs).split(",");
  const args: Args = {
    addr: String(rawArgs.addr),
    help: !!rawArgs.help,
    noCheck: !rawArgs.check,
    inspect: !!rawArgs.inspect,
    reload: !!rawArgs.reload,
    watch: !!rawArgs.watch,
    libs: {
      ns: libs.includes("ns"),
      window: libs.includes("window"),
      fetchevent: libs.includes("fetchevent"),
    },
  };
  const entrypoint: string | null = typeof rawArgs._[0] === "string"
    ? rawArgs._[0]
    : null;
  if (args.help) {
    console.error(help);
    Deno.exit(1);
  }
  if (entrypoint === null) {
    console.error(help);
    error("No entrypoint specifier given.");
  }
  if (rawArgs._.length > 1) {
    console.error(help);
    error("Too many positional arguments given.");
  }

  let entrypointSpecifier;
  try {
    entrypointSpecifier =
      (entrypoint.startsWith("https://") || entrypoint.startsWith("http://"))
        ? new URL(entrypoint)
        : toFileUrl(resolve(Deno.cwd(), entrypoint));
  } catch (err) {
    error(
      `Failed to parse entrypoint specifier '${entrypoint}': ${err.message}`,
    );
  }

  if (entrypointSpecifier.protocol == "file:") {
    try {
      await Deno.lstat(entrypointSpecifier);
    } catch (err) {
      error(
        `Failed to open entrypoint file at '${entrypointSpecifier}': ${err.message}`,
      );
    }
  }

  const opts = {
    entrypoint: entrypointSpecifier,
    listenAddress: args.addr,
    inspect: args.inspect,
    noCheck: args.noCheck,
    reload: args.reload,
    libs: args.libs,
  };
  if (args.watch) {
    await watch(opts);
  } else {
    await once(opts);
  }
}

async function once(opts: RunOpts) {
  const proc = await run(opts);
  const status = await proc.status();
  if (!status.success) error(`Process exited with code ${status.code}`);
}

async function watch(opts: RunOpts) {
  let deps = await analyzeDeps(opts.entrypoint);
  let proc = await run(opts);
  let debouncer = null;

  while (true) {
    const watcher = Deno.watchFs(deps);
    for await (const event of watcher) {
      if (typeof debouncer == "number") clearTimeout(debouncer);
      debouncer = setTimeout(async () => {
        console.warn(yellow(`${event.paths[0]} changed. Restarting...`));
        if (proc) {
          proc.close();
        }
        proc = await run(opts);
        try {
          const newDeps = await analyzeDeps(opts.entrypoint);
          const depsChanged = new Set([...deps, ...newDeps]).size;
          if (depsChanged) {
            deps = newDeps;
            watcher.return?.();
          }
        } catch {
          // ignore the error
        }
      }, 100);
    }
  }
}
