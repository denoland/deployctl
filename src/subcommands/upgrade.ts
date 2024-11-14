// Copyright 2021 Deno Land Inc. All rights reserved. MIT license.

import { error } from "../error.ts";
import {
  canParse as semverValid,
  greaterOrEqual as semverGreaterThanOrEquals,
  parse as semverParse,
} from "@std/semver";
import { VERSION } from "../version.ts";
import type { Args as RawArgs } from "../args.ts";

const help = `deployctl upgrade
Upgrade deployctl to the given version (defaults to latest).

To upgrade to latest version:
deployctl upgrade

To upgrade to specific version:
deployctl upgrade 1.2.3

The version is downloaded from https://deno.land/x/deploy/deployctl.ts

USAGE:
    deployctl upgrade [OPTIONS] [<version>]

OPTIONS:
    -h, --help        Prints help information

ARGS:
    <version>         The version to upgrade to (defaults to latest)
`;

type UpgradeArgs = {
  help: boolean;
  /**
   * If present, this value will be provided to `deno install` command that the
   * upgrade subcommand internally invokes. This option is not documented in the
   * help message as its intended use is for testing.
   */
  root: string | null;
};

export default async function (rawArgs: RawArgs): Promise<void> {
  const version = typeof rawArgs._[0] === "string" ? rawArgs._[0] : null;
  const args: UpgradeArgs = {
    help: !!rawArgs.help,
    root: rawArgs.root ?? null,
  };

  if (args.help) {
    console.log(help);
    Deno.exit(0);
  }

  if (rawArgs._.length > 1) {
    console.error(help);
    error("Too many positional arguments given.");
  }

  if (version && !semverValid(version)) {
    error(`The provided version is invalid.`);
  }

  const { latest, versions } = await getVersions().catch((err: TypeError) => {
    error(err.message);
  });
  if (version && !versions.includes(version)) {
    error(
      "The provided version is not found.\n\nVisit https://github.com/denoland/deployctl/releases/ for available releases.",
    );
  }

  if (
    !version &&
    semverGreaterThanOrEquals(semverParse(VERSION), semverParse(latest))
  ) {
    console.log("You're using the latest version.");
    Deno.exit();
  } else {
    const process = new Deno.Command(Deno.execPath(), {
      args: [
        "install",
        "-A",
        "--global",
        args.root ? `--root=${args.root}` : undefined,
        "--reload",
        "--force",
        "--quiet",
        `jsr:@deno/deployctl@${version || latest}`,
      ].filter((x) => x !== undefined),
    }).spawn();
    await process.status;
  }
}

export async function getVersions(): Promise<
  { latest: string; versions: string[] }
> {
  const aborter = new AbortController();
  const timer = setTimeout(() => aborter.abort(), 2500);
  const response = await fetch(
    "https://cdn.deno.land/deploy/meta/versions.json",
    { signal: aborter.signal },
  );
  if (!response.ok) {
    throw new Error(
      "couldn't fetch the latest version - try again after sometime",
    );
  }
  const data = await response.json();
  clearTimeout(timer);
  return data;
}
