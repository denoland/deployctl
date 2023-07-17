#!/usr/bin/env -S deno run --allow-read --allow-write --allow-env --allow-net --allow-run

// Copyright 2021 Deno Land Inc. All rights reserved. MIT license.

import { semverGreaterThanOrEquals } from "./deps.ts";
import { parseArgs } from "./src/args.ts";
import { error } from "./src/error.ts";
import deploySubcommand from "./src/subcommands/deploy.ts";
import upgradeSubcommand from "./src/subcommands/upgrade.ts";
import logsSubcommand from "./src/subcommands/logs.ts";
import { MINIMUM_DENO_VERSION, VERSION } from "./src/version.ts";
import { fetchReleases, getConfigPaths } from "./src/utils/info.ts";

const help = `deployctl ${VERSION}
Command line tool for Deno Deploy.

To deploy a local script:
  deployctl deploy --project=helloworld ./main.ts

To deploy a remote script:
  deployctl deploy --project=helloworld https://deno.land/x/deploy/examples/hello.js

SUBCOMMANDS:
    deploy    Deploy a script with static files to Deno Deploy
    upgrade   Upgrade deployctl to the given version (defaults to latest)
    logs      Stream logs for the given project
`;

if (!semverGreaterThanOrEquals(Deno.version.deno, MINIMUM_DENO_VERSION)) {
  error(
    `The Deno version you are using is too old. Please update to Deno ${MINIMUM_DENO_VERSION} or later. To do this run \`deno upgrade\`.`,
  );
}

const args = parseArgs(Deno.args);

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
  case "deploy":
    await deploySubcommand(args);
    break;
  case "upgrade":
    await upgradeSubcommand(args);
    break;
  case "logs":
    await logsSubcommand(args);
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
