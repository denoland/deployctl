// Copyright 2021 Deno Land Inc. All rights reserved. MIT license.

import { wait } from "../../deps.ts";
import { error } from "../error.ts";
import { API } from "../utils/api.ts";

const help = `deployctl env
Sync environment variable with Deno Deploy.

USAGE:
    deployctl env [OPTIONS] <ENV_FILE>

OPTIONS:
    -h, --help                Prints help information
    -p, --project=NAME        The project to deploy to
        --token=TOKEN         The API token to use (defaults to DENO_DEPLOY_TOKEN env var)
`;

export interface Args {
  help: boolean;
  token: string | null;
  project: string | null;
}

// deno-lint-ignore no-explicit-any
export default async function (rawArgs: Record<string, any>): Promise<void> {
  const args: Args = {
    help: !!rawArgs.help,
    token: rawArgs.token ? String(rawArgs.token) : null,
    project: rawArgs.project ? String(rawArgs.project) : null,
  };
  const envFile: string | null = typeof rawArgs._[0] === "string"
    ? rawArgs._[0]
    : null;
  if (args.help) {
    console.log(help);
    Deno.exit(0);
  }
  const token = args.token ?? Deno.env.get("DENO_DEPLOY_TOKEN") ?? null;
  if (token === null) {
    console.error(help);
    error("Missing access token. Set via --token or DENO_DEPLOY_TOKEN.");
  }
  if (envFile === null) {
    console.error(help);
    error("No enivronment file specifier given.");
  }
  if (rawArgs._.length > 1) {
    console.error(help);
    error("Too many positional arguments given.");
  }
  if (args.project === null) {
    console.error(help);
    error("Missing project name.");
  }

  const projectSpinner = wait("Fetching project information...").start();
  const api = API.fromToken(token);
  const project = await api.getProject(args.project);
  if (project === null) {
    projectSpinner.fail("Project not found.");
    Deno.exit(1);
  }
  projectSpinner.succeed(`Project: ${project!.name}`);

  const fileSpinner = wait("Reading env file...").start();
  const envObj: Record<string, string> = {};
  try {
    const varsText = await Deno.readTextFile(envFile);
    if (!varsText) {
      fileSpinner.info("File is empty.");
      Deno.exit(1);
    }
    varsText.replace(
      /(\w+)=(.+)/g,
      function (_$0: string, $1: string, $2: string) {
        envObj[$1] = $2;
      },
    );
    if (Object.keys(envObj).length === 0) {
      fileSpinner.info("File did not contain any variables.");
      Deno.exit(1);
    }
  } catch {
    fileSpinner.fail(`Could not load file: ${envFile}`);
    Deno.exit(1);
  }
  fileSpinner.succeed(`File Loaded: ${envFile}`);

  const sendSpinner = wait("Sending env variables...").start();
  try {
    await api.sendEnv(project!.id, envObj);
  } catch {
    sendSpinner.fail("Failed to send variables.");
    Deno.exit(1);
  }
  sendSpinner.succeed("Env variables sent.");
}
