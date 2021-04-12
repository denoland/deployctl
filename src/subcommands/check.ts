// Copyright 2021 Deno Land Inc. All rights reserved. MIT license.

import { green, yellow } from "../../deps.ts";
import { error, printError } from "../error.ts";
import { analyzeDeps } from "../utils/info.ts";
import { tsconfig } from "../utils/tsconfig.ts";
import { loaderDataUrl } from "../utils/run.ts";
import { parseEntrypoint } from "../utils/entrypoint.ts";

const help = `deployctl check
Perform type checking of the given file or url as Deno Deploy script.

To check a script:
  deployctl check https://deno.land/x/deploy/examples/hello.js

To check a script and watch for changes:
  deployctl check --watch https://deno.land/x/deploy/examples/hello.js

USAGE:
    deployctl check [OPTIONS] <ENTRYPOINT>

OPTIONS:
    -h, --help          Prints help information
        --libs=<libs>   The deploy type libs that are loaded (default "ns,window,fetchevent")
    -r, --reload        Reload source code cache (recompile TypeScript)
        --watch         Watch for file changes and restart process automatically
`;

export interface Args {
  help: boolean;
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
    help: !!rawArgs.help,
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
    console.log(help);
    Deno.exit(0);
  }
  if (entrypoint === null) {
    console.error(help);
    error("No entrypoint specifier given.");
  }
  if (rawArgs._.length > 1) {
    console.error(help);
    error("Too many positional arguments given.");
  }

  const opts = {
    entrypoint: await parseEntrypoint(entrypoint),
    reload: args.reload,
    libs: args.libs,
  };

  if (args.watch) {
    await watch(opts);
  } else {
    await once(opts);
  }
}

interface CheckOpts {
  entrypoint: URL;
  reload: boolean;
  libs: {
    ns: boolean;
    window: boolean;
    fetchevent: boolean;
  };
}

async function once(opts: CheckOpts): Promise<void> {
  const { errors } = await analyzeDeps(opts.entrypoint);
  for (const error of errors) {
    printError(error);
  }
  if (errors.length !== 0) Deno.exit(1);
  const status = await check(opts);
  Deno.exit(status);
}

async function check({ entrypoint, reload, libs }: CheckOpts): Promise<number> {
  const tsconfigPath = await tsconfig();
  const dataUrl = await loaderDataUrl(entrypoint, libs);
  const args = ["--config", tsconfigPath];
  if (reload) {
    args.push("--reload");
  }
  // TODO(kt3k): Filter "Check data:..." lines
  const p = Deno.run({
    cmd: [Deno.execPath(), "cache", ...args, dataUrl],
  });
  const [status] = await Promise.all([p.status()]);
  if (status.code === 0) {
    console.log(green("OK"));
  }
  return status.code;
}

async function watch(opts: CheckOpts) {
  let { deps, errors } = await analyzeDeps(opts.entrypoint);
  for (const error of errors) {
    printError(error);
  }
  let debouncer = null;
  if (errors.length === 0) {
    await check(opts);
  }

  while (true) {
    const watcher = Deno.watchFs(deps);
    for await (const event of watcher) {
      if (typeof debouncer == "number") clearTimeout(debouncer);
      debouncer = setTimeout(async () => {
        console.warn(yellow(`${event.paths[0]} changed. Restarting...`));
        const { deps: newDeps, errors: newErrors } = await analyzeDeps(
          opts.entrypoint,
        );
        for (const error of newErrors) {
          printError(error);
        }
        const depsChanged = new Set([...deps, ...newDeps]).size;
        if (depsChanged) {
          deps = newDeps;
          watcher.return?.();
        }
        if (errors.length === 0) {
          await check(opts);
        }
      }, 100);
    }
  }
}
