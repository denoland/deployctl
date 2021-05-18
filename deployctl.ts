// Copyright 2021 Deno Land Inc. All rights reserved. MIT license.

import { parseArgs, semverGreaterThanOrEquals } from "./deps.ts";
import { error } from "./src/error.ts";
import runSubcommand from "./src/subcommands/run.ts";
import typesSubcommand from "./src/subcommands/types.ts";
import checkSubcommand from "./src/subcommands/check.ts";
import upgradeSubcommand from "./src/subcommands/upgrade.ts";
import { MINIMUM_DENO_VERSION, VERSION } from "./src/version.ts";
import { fetchReleases, getConfigPaths } from "./src/utils/info.ts";

const help = `deployctl ${VERSION}
Run Deno Deploy scripts locally.

To run a script locally:
  deployctl run https://deno.land/x/deploy/examples/hello.js

To run a script locally and watch changes:
  deployctl run --watch https://deno.land/x/deploy/examples/hello.js

SUBCOMMANDS:
    run       Run a script given a filename or url
    check     Perform type checking of the script without actually running it
    types     Print the Deno Deploy TypeScript declarations
    upgrade   Upgrade deployctl to the given version (defaults to latest)
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
    "version": "V",
  },
  boolean: [
    "check",
    "help",
    "inspect",
    "reload",
    "version",
    "watch",
  ],
  string: [
    "addr",
    "libs",
    "env",
  ],
  default: {
    addr: ":8080",
    check: true,
    libs: "ns,window,fetchevent",
  },
});

if (Deno.isatty(Deno.stdin.rid)) {
  let latestVersion;
  // Get the path to the update information json file.
  const { updatePath } = getConfigPaths();
  // Try to read the json file.
  const updateInfoJson = await Deno.readTextFile(updatePath).catch((error) => {
    if (error.name == "NotFound") return null;
    console.error(error);
  });
  if (updateInfoJson) {
    const updateInfo = JSON.parse(updateInfoJson) as {
      lastFetched: number;
      latest: number;
    };
    const moreThanADay =
      Math.abs(Date.now() - updateInfo.lastFetched) > 24 * 60 * 60 * 1000;
    // Fetch the latest release if it has been more than a day since the last
    // time the information about new version is fetched.
    if (moreThanADay) {
      fetchReleases();
    } else {
      latestVersion = updateInfo.latest;
    }
  } else {
    fetchReleases();
  }

  // If latestVersion is set we need to inform the user about a new release.
  if (
    latestVersion &&
    !(semverGreaterThanOrEquals(VERSION, latestVersion.toString()))
  ) {
    console.log(
      [
        `A new release of deployctl is available: ${VERSION} -> ${latestVersion}`,
        "To upgrade, run `deployctl upgrade`",
        `https://github.com/denoland/deployctl/releases/tag/${latestVersion}\n`,
      ].join("\n"),
    );
  }
}

const subcommand = args._.shift();
switch (subcommand) {
  case "run":
    await runSubcommand(args);
    break;
  case "types":
    await typesSubcommand(args);
    break;
  case "check":
    await checkSubcommand(args);
    break;
  case "upgrade":
    await upgradeSubcommand(args);
    break;
  default:
    if (args.version) {
      console.log(`deployctl ${VERSION}`);
      Deno.exit(0);
    }
    if (args.help) {
      console.log(help);
      Deno.exit(0);
    }
    console.error(help);
    Deno.exit(1);
}
