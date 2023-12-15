#!/usr/bin/env -S deno run --allow-read --allow-write --allow-env --allow-net --allow-run

// Copyright 2021 Deno Land Inc. All rights reserved. MIT license.

import { semverGreaterThanOrEquals } from "./deps.ts";
import { Args, parseArgs } from "./src/args.ts";
import { error } from "./src/error.ts";
import deploySubcommand from "./src/subcommands/deploy.ts";
import upgradeSubcommand from "./src/subcommands/upgrade.ts";
import logsSubcommand from "./src/subcommands/logs.ts";
import topSubcommand from "./src/subcommands/top.ts";
import { MINIMUM_DENO_VERSION, VERSION } from "./src/version.ts";
import { fetchReleases, getConfigPaths } from "./src/utils/info.ts";
import configFile from "./src/config_file.ts";
import inferConfig from "./src/config_inference.ts";
import { wait } from "./src/utils/spinner.ts";

const help = `deployctl ${VERSION}
Command line tool for Deno Deploy.

SUBCOMMANDS:
    deploy    Deploy a script with static files to Deno Deploy
    upgrade   Upgrade deployctl to the given version (defaults to latest)
    logs      View logs for the given project

For more detailed help on each subcommand, use:

    deployctl <SUBCOMMAND> -h
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
    await setDefaultsFromConfigFile(args);
    await inferConfig(args);
    await deploySubcommand(args);
    break;
  case "upgrade":
    await setDefaultsFromConfigFile(args);
    await upgradeSubcommand(args);
    break;
  case "logs":
    await setDefaultsFromConfigFile(args);
    await logsSubcommand(args);
    break;
  case "top":
    await setDefaultsFromConfigFile(args);
    await inferConfig(args);
    await topSubcommand(args);
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

async function setDefaultsFromConfigFile(args: Args) {
  const loadFileConfig = !args.version && !args.help;
  if (loadFileConfig) {
    const config = await configFile.read(
      args.config ?? configFile.cwdOrAncestors(),
    );
    if (config === null && args.config !== undefined && !args["save-config"]) {
      error(
        `Could not find or read the config file '${args.config}'. Use --save-config to create it.`,
      );
    }
    if (config !== null) {
      wait("").start().info(`Using config file '${config.path()}'`);
      config.useAsDefaultFor(args);
      // Set the effective config path for the rest of the execution
      args.config = config.path();
    }
  }
}
