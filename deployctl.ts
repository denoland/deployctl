// Copyright 2021 Deno Land Inc. All rights reserved. MIT license.

import { parseArgs, semverGreaterThanOrEquals } from "./deps.ts";
import { error } from "./src/error.ts";
import runSubcommand from "./src/subcommands/run.ts";
import typesSubcommand from "./src/subcommands/types.ts";

const VERSION = "0.0.1";

// The minium Deno version required. Currently 1.8 because we are making use of
// the --unstable `deno info` output which changed in 1.8.
const MINIMUM_DENO_VERSION = "1.8.0";

const help = `deployctl ${VERSION}
Run Deno Deploy scripts locally.

To run a script locally:
  deployctl run https://dash.deno.com/examples/hello.js

To run a script locally and watch changes:
  deployctl run --watch https://dash.deno.com/examples/hello.js

SUBCOMMANDS:
    run       Run a script given a filename or url
    types     Print the Deno Deploy TypeScript declarations
`;

if (!semverGreaterThanOrEquals(Deno.version.deno, MINIMUM_DENO_VERSION)) {
  error(
    `The Deno version you are using is too old. Please update to Deno ${MINIMUM_DENO_VERSION} or later. To do this run \`deno upgrade\`.`,
  );
}

const args = parseArgs(Deno.args, {
  alias: {
    "help": "h",
    "reload": "r",
  },
  boolean: [
    "help",
    "check",
    "inspect",
    "reload",
    "watch",
  ],
  default: {
    check: true,
  },
});

const subcommand = args._.shift();
switch (subcommand) {
  case "run":
    await runSubcommand(args);
    break;
  case "types":
    await typesSubcommand(args);
    break;
  default:
    console.log(help);
    Deno.exit(1);
}
