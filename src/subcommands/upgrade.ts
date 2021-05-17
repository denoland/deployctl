// Copyright 2021 Deno Land Inc. All rights reserved. MIT license.

import { error } from "../error.ts";
import { semverGreaterThanOrEquals, semverValid } from "../../deps.ts";
import { VERSION } from "../version.ts";

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

export interface Args {
  help: boolean;
}

// deno-lint-ignore no-explicit-any
export default async function (rawArgs: Record<string, any>): Promise<void> {
  const args: Args = {
    help: !!rawArgs.help,
  };
  const version = typeof rawArgs._[0] === "string" ? rawArgs._[0] : null;
  if (args.help) {
    console.log(help);
    Deno.exit();
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

  if (!version && semverGreaterThanOrEquals(VERSION, latest)) {
    console.log("You're using the latest version.");
    Deno.exit();
  } else {
    const process = Deno.run({
      cmd: [
        Deno.execPath(),
        "install",
        "--allow-read",
        "--allow-write",
        "--allow-env",
        "--allow-net",
        "--allow-run",
        "--no-check",
        "--unstable",
        "-f",
        `https://deno.land/x/deploy@${version ? version : latest}/deployctl.ts`,
      ],
    });
    await process.status();
  }
}

export async function getVersions(): Promise<
  { latest: string; versions: string[] }
> {
  const response = await fetch(
    "https://cdn.deno.land/deploy/meta/versions.json",
  );
  if (!response.ok) {
    throw new Error(
      "couldn't fetch the latest version - try again after sometime",
    );
  }

  return await response.json();
}
