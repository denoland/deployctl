// Copyright 2021 Deno Land Inc. All rights reserved. MIT license.

import type { Args } from "../args.ts";
import { wait } from "../../deps.ts";
import { error } from "../error.ts";
import { API, APIError } from "../utils/api.ts";
import type { Project } from "../utils/api_types.ts";

const help = `deployctl logs
View logs for the given project.

To show the live logs of a project's latest deployment:
  deployctl logs --project=helloworld

To show the live logs of a particular deployment:
  deployctl logs --project=helloworld --deployment=1234567890ab

To show the live, error & info level logs of the production deployment generated in particular regions:
  deployctl logs --project=helloworld --prod --levels=error,info --regions=region1,region2

To show the logs generated within the past 3 hours and containing the word "foo":
  deployctl logs --project=helloworld --timerange=3h,now --grep=foo

USAGE:
    deployctl logs [OPTIONS] [<PROJECT>]

OPTIONS:
        --deployment=<DEPLOYMENT_ID>  The id of the deployment you want to get the logs (defaults to latest deployment)
        --prod                        Select the production deployment
    -p, --project=NAME                The project you want to get the logs
        --token=TOKEN                 The API token to use (defaults to DENO_DEPLOY_TOKEN env var)
        --timerange[=<TIMERANGE>]     The time range of the logs you want to get
                                      Format: <start>,<end> 
                                      where <start> and <end> are either RFC3339 timestamps (e.g. 2023-07-17T06:10:38+00:00) or relative durations (e.g. 1d, 3h, 10m, 180s, now)
                                      <end> defaults to now, <start> defaults to 1h before <end>
                                      NOTE: Logs generated over 2 days ago are not available
        --grep=<WORD>                 Filter logs by a word
        --levels=<LEVELS>             Filter logs by log levels (defaults to all log levels)
                                      Mutliple levels can be specified, e.g. --levels=info,error
        --regions=<REGIONS>           Filter logs by regions (defaults to all regions)
                                      Multiple regions can be specified, e.g. --regions=region1,region2
        --limit=<LIMIT>               Limit the number of logs to return (defualts to 100)
                                      This flag is effective only when '--timerange' is provided
`;

export interface LogSubcommandArgs {
  help: boolean;
  prod: boolean;
  token: string | null;
  deployment: string | null;
  project: string | null;
  timerange: {
    start: Date;
    end: Date;
  } | null;
  grep: string | null;
  levels: string[] | null;
  regions: string[] | null;
  limit: number;
}

type LogOptsBase = {
  prod: boolean;
  deploymentId: string | null;
  projectId: string;
  grep: string | null;
  levels: string[] | null;
  regions: string[] | null;
};
type LiveLogOpts = LogOptsBase;
type QueryLogOpts = LogOptsBase & {
  timerange: {
    start: Date;
    end: Date;
  };
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

  const api = API.fromToken(token);
  const { regionCodes } = await api.getMetadata();
  if (
    logSubcommandArgs.regions !== null &&
    logSubcommandArgs.regions.some((r) => !regionCodes.includes(r))
  ) {
    error(
      `Invalid region is specified. Available regions are:\n\n${
        regionCodes.join("\n")
      }`,
    );
  }

  if (logSubcommandArgs.timerange === null) {
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
      timerange: logSubcommandArgs.timerange,
      limit: logSubcommandArgs.limit,
    });
  }
}

export function parseTimerange(
  rawTimerange: string,
): LogSubcommandArgs["timerange"] | null {
  const [start, end] = rawTimerange.split(",");
  if (start === undefined || end === undefined) {
    return null;
  }

  const parse = (s: string): Date | null => {
    if (s == "now") {
      return new Date();
    }

    const relativeDurationRe = /^(\d+)([dhms])$/;
    const match = s.match(relativeDurationRe);
    if (match === null) {
      const d = Date.parse(s);
      if (Number.isNaN(d)) {
        return null;
      } else {
        return new Date(d);
      }
    }

    const figure = parseInt(match[1]);
    const unit = match[2];
    switch (unit) {
      case "d": {
        // <figure> days ago
        return new Date(Date.now() - figure * 24 * 60 * 60 * 1000);
      }
      case "h": {
        // <figure> hours ago
        return new Date(Date.now() - figure * 60 * 60 * 1000);
      }
      case "m": {
        // <figure> minutes ago
        return new Date(Date.now() - figure * 60 * 1000);
      }
      case "s": {
        // <figure> seconds ago
        return new Date(Date.now() - figure * 1000);
      }
      default: {
        error("unreachable");
      }
    }
  };

  const startDate = parse(start);
  if (startDate === null) {
    return null;
  }
  const endDate = parse(end);
  if (endDate === null) {
    return null;
  }

  return {
    start: startDate,
    end: endDate,
  };
}

export function parseArgsForLogSubcommand(args: Args): LogSubcommandArgs {
  const DEFAULT_LIMIT = 100;
  const limit = parseInt(args.limit);

  let timerange: LogSubcommandArgs["timerange"] = null;
  if (args.timerange !== undefined) {
    if (args.timerange.length === 0) {
      const DEFAULT_TIMERANGE = {
        start: new Date(Date.now() - 60 * 60 * 1000), // 1h ago
        end: new Date(),
      };
      timerange = DEFAULT_TIMERANGE;
    } else {
      const t = parseTimerange(args.timerange);
      if (t === null) {
        console.error(help);
        error("Invalid timerange");
      }
      timerange = t;
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

  return {
    help: !!args.help,
    prod: !!args.prod,
    token: args.token ? String(args.token) : null,
    deployment: args.deployment ? String(args.deployment) : null,
    project: args.project ? String(args.project) : null,
    timerange,
    grep: args.grep ?? null,
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

      if (opts.grep !== null && !log.message.includes(opts.grep)) {
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
        since: opts.timerange.start.toISOString(),
        until: opts.timerange.end.toISOString(),
        q: opts.grep ? [opts.grep] : undefined,
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
