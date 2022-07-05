// Copyright 2021 Deno Land Inc. All rights reserved. MIT license.

import { wait } from "../../deps.ts";
import { error } from "../error.ts";
import { API, APIError } from "../utils/api.ts";

const help = `deployctl logs
Shows the logs of the given project.

To show the latest logs of a project:
  deployctl logs --project=helloworld

To show the logs of a particular deployment:
  deployctl logs --project=helloworld --deployment=1234567890ab

To show the logs of the production deployment:
  deployctl logs --project=helloworld --prod

USAGE:
    deployctl logs [OPTIONS] [<PROJECT>]

OPTIONS:
        --deployment=<DEPLOY_ID>  The id of the deployment you want to get the logs (defaults to latest deployment)
        --prod                    Select the production deployment
        -p, --project=NAME        The project you want to get the logs
        --token=TOKEN             The API token to use (defaults to DENO_DEPLOY_TOKEN env var)
`;

export interface Args {
  help: boolean;
  prod: boolean;
  token: string | null;
  deployment: string | null;
  project: string | null;
}

// deno-lint-ignore no-explicit-any
export default async function (rawArgs: Record<string, any>): Promise<void> {
  const args: Args = {
    help: !!rawArgs.help,
    prod: !!rawArgs.prod,
    token: rawArgs.token ? String(rawArgs.token) : null,
    deployment: rawArgs.deployment ? String(rawArgs.deployment) : null,
    project: rawArgs.project ? String(rawArgs.project) : null,
  };

  if (args.help) {
    console.log(help);
    Deno.exit(0);
  }
  const token = args.token ?? Deno.env.get("DENO_DEPLOY_TOKEN") ?? null;
  if (token === null) {
    console.error(help);
    error("Missing access token. Set via --token or DENO_DEPLOY_TOKEN.");
  }
  if (args.project === null) {
    console.error(help);
    error("Missing project ID.");
  }
  if (rawArgs._.length > 1) {
    console.error(help);
    error("Too many positional arguments given.");
  }

  const opts = {
    project: args.project,
    prod: args.prod,
    token,
    deployment: args.deployment,
  };

  await logs(opts);
}

interface DeployOpts {
  project: string;
  deployment: string | null;
  prod: boolean;
  token: string;
}

async function logs(opts: DeployOpts): Promise<void> {
  if (opts.prod && opts.deployment) {
    error(
      `You can't select a deployment and choose production flag at the same time`,
    );
  }
  const projectSpinner = wait("Fetching project information...").start();
  const api = API.fromToken(opts.token);
  const project = await api.getProject(opts.project);
  const projectDeployments = await api.getDeployments(opts.project);
  if (project === null) {
    projectSpinner.fail("Project not found.");
    Deno.exit(1);
  }
  if (opts.prod) {
    if (!project.hasProductionDeployment) {
      projectSpinner.fail(`This project doesn't have a production deployment`);
      Deno.exit(1);
    }
    opts.deployment = project.productionDeployment?.id || null;
  }
  if (projectDeployments === null) {
    projectSpinner.fail("Project not found.");
    Deno.exit(1);
  }
  projectSpinner.succeed(`Project: ${project?.name}`);
  const logs = opts.deployment
    ? api.getLogs(opts.project, opts.deployment)
    : api.getLogs(opts.project, "latest");
  if (logs === null) {
    projectSpinner.fail("Project not found.");
    Deno.exit(1);
  }
  try {
    for await (const log of logs) {
      if (typeof log == "string") {
        console.log(log);
        continue;
      }
      let color;
      switch (log.level) {
        case "debug": {
          color = "grey";
          break;
        }
        case "error": {
          color = "red";
          break;
        }
        case "info": {
          color = "blue";
          break;
        }
      }
      if (log.message.startsWith("isolate start time")) {
        console.log(
          `%c${log.time}   %c${log.region}%c ${log.message.trim()}`,
          "color: aquamarine",
          "background-color: grey",
          `color: ${color}`,
        );
      } else {
        console.log(
          `%c${log.time}   %c${log.message.trim()}`,
          "color: aquamarine",
          `color: ${color}`,
        );
      }
    }
  } catch (err: unknown) {
    if (
      err instanceof APIError
    ) {
      error(err.toString());
    }
  } finally {
    console.log("%cconnection closed", "color: red");
  }
}
