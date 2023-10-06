// Copyright 2021 Deno Land Inc. All rights reserved. MIT license.

import type { Args } from "../args.ts";
import { wait } from "../utils/spinner.ts";
import { error } from "../error.ts";
import { API, APIError } from "../utils/api.ts";
import type { Project } from "../utils/api_types.ts";

const help = `deployctl logs
View logs for the given project. It supports both live logs where the logs are streamed to the console as they are
generated, and query persisted logs where the logs generated in the past are fetched.

To show the live logs of a project's latest deployment:
  deployctl logs --project=helloworld
  deployctl logs helloworld

To show the live logs of a particular deployment:
  deployctl logs --project=helloworld --deployment=1234567890ab

To show the live error & info level logs of the production deployment generated in particular regions:
  deployctl logs --project=helloworld --prod --levels=error,info --regions=region1,region2

To show the logs generated within the past two hours, up until 30 minutes ago, and containing the word "foo":
  [Linux]
  deployctl logs --project=helloworld --since=$(date -Iseconds --date='2 hours ago') --until=$(date -Iseconds --date='30 minutes ago') --grep=foo
  [macOS]
  deployctl logs --project=helloworld --since=$(date -Iseconds -v-2H) --until=$(date -Iseconds -v-30M) --grep=foo

USAGE:
    deployctl logs [OPTIONS] [<PROJECT>]

OPTIONS:
        --deployment=<DEPLOYMENT_ID>  The id of the deployment you want to get the logs (defaults to latest deployment)
        --prod                        Select the production deployment
    -p, --project=NAME                The project you want to get the logs
        --token=TOKEN                 The API token to use (defaults to DENO_DEPLOY_TOKEN env var)
        --since=<DATETIME>            The start time of the logs you want to get. RFC3339 format (e.g. 2023-07-17T06:10:38+09:00) is supported.
                                      NOTE: Logs generated over 24 hours ago are not available
        --until=<DATETIME>            The end time of the logs you want to get. RFC3339 format (e.g. 2023-07-17T06:10:38+09:00) is supported.
        --grep=<WORD>                 Filter logs by a word
                                      Multiple words can be specified for AND search. For example, "--grep=foo --grep=bar" will match logs containing both "foo" and "bar"
        --levels=<LEVELS>             Filter logs by log levels (defaults to all log levels)
                                      Mutliple levels can be specified, e.g. --levels=info,error
        --regions=<REGIONS>           Filter logs by regions (defaults to all regions)
                                      Multiple regions can be specified, e.g. --regions=region1,region2
        --limit=<LIMIT>               Limit the number of logs to return (defualts to 100)
                                      This flag is effective only when --since and/or --until is specified
`;

export interface LogSubcommandArgs {
  help: boolean;
  prod: boolean;
  token: string | null;
  deployment: string | null;
  project: string | null;
  since: Date | null;
  until: Date | null;
  grep: string[];
  levels: string[] | null;
  regions: string[] | null;
  limit: number;
}

type LogOptsBase = {
  prod: boolean;
  deploymentId: string | null;
  projectId: string;
  grep: string[];
  levels: string[] | null;
  regions: string[] | null;
};
type LiveLogOpts = LogOptsBase;
type QueryLogOpts = LogOptsBase & {
  since: Date | null;
  until: Date | null;
  limit: number;
};

export default async function (args: Args): Promise<void> {
  const logSubcommandArgs = parseArgsForLogSubcommand(args);

  if (logSubcommandArgs.help) {
    console.log(help);
    Deno.exit(0);
  }
  const token = logSubcommandArgs.token ?? Deno.env.get("DENO_DEPLOY_TOKEN") ??
    null;
  if (token === null) {
    console.error(help);
    error("Missing access token. Set via --token or DENO_DEPLOY_TOKEN.");
  }
  if (logSubcommandArgs.project === null) {
    console.error(help);
    error("Missing project ID.");
  }
  if (args._.length > 1) {
    console.error(help);
    error("Too many positional arguments given.");
  }

  if (logSubcommandArgs.prod && logSubcommandArgs.deployment) {
    error(
      "You can't select a deployment and choose production flag at the same time",
    );
  }

  if (
    logSubcommandArgs.since !== null && logSubcommandArgs.until !== null &&
    logSubcommandArgs.since >= logSubcommandArgs.until
  ) {
    error("--since must be earlier than --until");
  }

  const api = API.fromToken(token);
  const { regionCodes } = await api.getMetadata();
  if (logSubcommandArgs.regions !== null) {
    const invalidRegions = getInvalidRegions(
      logSubcommandArgs.regions,
      regionCodes,
    );
    if (invalidRegions.length > 0) {
      invalidRegionError(invalidRegions, regionCodes);
    }
  }

  const liveLogMode = logSubcommandArgs.since === null &&
    logSubcommandArgs.until === null;
  if (liveLogMode) {
    await liveLogs(api, {
      prod: logSubcommandArgs.prod,
      deploymentId: logSubcommandArgs.deployment,
      projectId: logSubcommandArgs.project,
      grep: logSubcommandArgs.grep,
      levels: logSubcommandArgs.levels,
      regions: logSubcommandArgs.regions,
    });
  } else {
    await queryLogs(api, {
      prod: logSubcommandArgs.prod,
      deploymentId: logSubcommandArgs.deployment,
      projectId: logSubcommandArgs.project,
      grep: logSubcommandArgs.grep,
      levels: logSubcommandArgs.levels,
      regions: logSubcommandArgs.regions,
      since: logSubcommandArgs.since,
      until: logSubcommandArgs.until,
      limit: logSubcommandArgs.limit,
    });
  }
}

function getInvalidRegions(
  specifiedRegions: string[],
  availableRegions: string[],
): string[] {
  const invalidRegions = [];
  for (const r of specifiedRegions) {
    if (!availableRegions.includes(r)) {
      invalidRegions.push(r);
    }
  }
  return invalidRegions;
}

function invalidRegionError(
  invalidRegions: string[],
  availableRegions: string[],
): never {
  const invalid = `--regions contains invalid region(s): ${
    invalidRegions.join(", ")
  }`;
  const availableRegionsList = availableRegions.map((r) => `- ${r}`).join("\n");
  const available = `HINT: Available regions are:\n${availableRegionsList}`;

  error(`${invalid}\n${available}`);
}

export function parseArgsForLogSubcommand(args: Args): LogSubcommandArgs {
  const DEFAULT_LIMIT = 100;
  const limit = parseInt(args.limit);

  let since: Date | null = null;
  if (args.since !== undefined) {
    since = new Date(args.since);
    if (Number.isNaN(since.valueOf())) {
      console.error(help);
      error("Invalid format found in --since");
    }
  }

  let until: Date | null = null;
  if (args.until !== undefined) {
    until = new Date(args.until);
    if (Number.isNaN(until.valueOf())) {
      console.error(help);
      error("Invalid format found in --until");
    }
  }

  let logLevels: string[] | null = null;
  if (args.levels !== undefined) {
    logLevels = args.levels.split(",");
  }

  let regions: string[] | null = null;
  if (args.regions !== undefined) {
    regions = args.regions.split(",");
  }

  let project: string | null = null;
  if (args.project !== undefined) {
    project = args.project;
  } else if (typeof args._[0] === "string") {
    project = args._[0];
  }

  return {
    help: !!args.help,
    prod: !!args.prod,
    token: args.token ? String(args.token) : null,
    deployment: args.deployment ? String(args.deployment) : null,
    project,
    since,
    until,
    grep: args.grep,
    levels: logLevels,
    regions,
    limit: Number.isNaN(limit) ? DEFAULT_LIMIT : limit,
  };
}

async function fetchProjectInfo(
  api: API,
  projectId: string,
  onFailure: (msg: string) => never,
): Promise<Project> {
  const project = await api.getProject(projectId);
  if (project === null) {
    onFailure("Project not found.");
  }

  const projectDeployments = await api.getDeployments(projectId);
  if (projectDeployments === null) {
    onFailure("Project not found.");
  }

  return project;
}

async function liveLogs(api: API, opts: LiveLogOpts): Promise<void> {
  const projectSpinner = wait("Fetching project information...").start();
  const project = await fetchProjectInfo(api, opts.projectId, (msg) => {
    projectSpinner.fail(msg);
    Deno.exit(1);
  });
  if (opts.prod) {
    if (!project.hasProductionDeployment) {
      projectSpinner.fail("This project doesn't have a production deployment");
      Deno.exit(1);
    }
    opts.deploymentId = project.productionDeployment?.id ?? null;
  }
  projectSpinner.succeed(`Project: ${project.name}`);
  const logs = opts.deploymentId
    ? api.getLogs(opts.projectId, opts.deploymentId)
    : api.getLogs(opts.projectId, "latest");
  if (logs === null) {
    projectSpinner.fail("Project not found.");
    Deno.exit(1);
  }
  try {
    for await (const log of logs) {
      if (log.type === "ready" || log.type === "ping") {
        continue;
      }

      if (opts.grep.some((word) => !log.message.includes(word))) {
        continue;
      }

      if (opts.levels !== null && !opts.levels.includes(log.level)) {
        continue;
      }

      if (opts.regions !== null && !opts.regions.includes(log.region)) {
        continue;
      }

      printLog(log.level, log.time, log.region, log.message);
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

async function queryLogs(api: API, opts: QueryLogOpts): Promise<void> {
  const projectSpinner = wait("Fetching project information...").start();
  const project = await fetchProjectInfo(api, opts.projectId, (msg) => {
    projectSpinner.fail(msg);
    Deno.exit(1);
  });
  if (opts.prod) {
    if (!project.hasProductionDeployment) {
      projectSpinner.fail("This project doesn't have a production deployment");
      Deno.exit(1);
    }
    opts.deploymentId = project.productionDeployment?.id ?? null;
  }
  projectSpinner.succeed(`Project: ${project.name}`);

  const logSpinner = wait("Fetching logs...").start();
  try {
    const { logs } = await api.queryLogs(
      opts.projectId,
      opts.deploymentId ?? "latest",
      {
        regions: opts.regions ?? undefined,
        levels: opts.levels ?? undefined,
        since: opts.since?.toISOString(),
        until: opts.until?.toISOString(),
        q: opts.grep.length > 0 ? opts.grep : undefined,
        limit: opts.limit,
      },
    );

    if (logs.length === 0) {
      logSpinner.fail("No logs found matching the provided condition");
      return;
    }

    logSpinner.succeed(`Found ${logs.length} logs`);
    for (const log of logs) {
      printLog(log.level, log.timestamp, log.region, log.message);
    }
  } catch (err: unknown) {
    logSpinner.fail("Failed to fetch logs");
    if (err instanceof APIError) {
      error(err.toString());
    } else {
      throw err;
    }
  }
}

function printLog(
  logLevel: string,
  timestamp: string,
  region: string,
  message: string,
) {
  const color = getLogColor(logLevel);
  console.log(
    `%c${timestamp}   %c${region}%c ${message.trim()}`,
    "color: aquamarine",
    "background-color: grey",
    `color: ${color}`,
  );
}

function getLogColor(logLevel: string) {
  switch (logLevel) {
    case "debug": {
      return "grey";
    }
    case "error": {
      return "red";
    }
    case "info": {
      return "blue";
    }
    default: {
      return "initial";
    }
  }
}
