// Copyright 2021 Deno Land Inc. All rights reserved. MIT license.

import { Args } from "../args.ts";
import { API } from "../utils/api.ts";
import TokenProvisioner from "../utils/access_token.ts";
import { wait } from "../utils/spinner.ts";
import { delay, encodeHex, tty } from "../../deps.ts";
import { error } from "../error.ts";
import { ProjectStats } from "../utils/api_types.ts";
import { sha256 } from "../utils/hashing_encoding.ts";
import { isTerminal } from "../utils/mod.ts";

const help = `
Project monitoring (ALPHA)

Definition of the table columns:

    idx         Instance discriminator. Opaque id to discriminate different executions running in the same region.
    Req/min     Requests per minute received by the project.
    CPU%        Percentage of CPU used by the project.
    CPU/req     CPU time per request, in milliseconds. 
    RSS/5min    Max RSS used by the project during the last 5 minutes, in MB. 
    Ingress/min Data received by the project per minute, in KB.
    Egress/min  Data outputed by the project per minute, in KB.
    KVr/min     KV reads performed by the project per minute.
    KVw/min     KV writes performed by the project per minute.
    QSenq/min   Queues enqueues performed by the project per minute.
    QSdeq/min   Queues dequeues performed by the project per minute.

USAGE:
    deployctl top [OPTIONS]

OPTIONS:
    -h, --help                    Prints this help information
    -p, --project=<NAME|ID>       The project to monitor.
        --token=<TOKEN>           The API token to use (defaults to DENO_DEPLOY_TOKEN env var)
        --config=<PATH>           Path to the file from where to load DeployCTL config. Defaults to 'deno.json'
        --color=<auto|always|off> Enable colored output. Defaults to 'auto' (colored when stdout is a tty)
        --format=<table|json>     Output the project stats in a table or JSON-encoded. Defaults to 'table' when stdout is a tty, 'json' otherwise.
        --region=<REGION>         Show stats from only specific regions. Can be used multiple times (--region=us-east4 --region=us-west2).
                                  Can also be a substring (--region=us)
`;

export default async function topSubcommand(args: Args) {
  if (args.help) {
    console.log(help);
    Deno.exit(0);
  }
  if (!args.project) {
    error(
      "No project specified. Use --project to specify the project of which to stream the stats",
    );
  }
  let format: Format;
  switch (args.format) {
    case "table":
    case "json":
      format = args.format;
      break;
    case undefined:
      format = isTerminal(Deno.stdout) ? "table" : "json";
      break;
    default:
      error(
        `Invalid format '${args.format}'. Supported values for the --format option are 'table' or 'json'`,
      );
  }

  const spinner = wait(
    `Connecting to the stats stream of project '${args.project}'...`,
  ).start();
  const api = args.token
    ? API.fromToken(args.token)
    : API.withTokenProvisioner(TokenProvisioner);
  let stats;
  try {
    stats = await api.streamMetering(args.project!);
  } catch (err) {
    spinner.fail(
      `Failed to connect to the stats stream of project '${args.project}': ${err.message}`,
    );
    return Deno.exit(1);
  }
  spinner.succeed(
    `Connected to the stats stream of project '${args.project}'`,
  );
  if (args.region.length !== 0) {
    const allStats = stats;
    const filter = args.region.flatMap((r) => r.split(",")).map((r) =>
      r.trim()
    );
    stats = async function* () {
      for await (const line of allStats) {
        for (const region of filter) {
          if (line.region.includes(region)) {
            yield line;
            break;
          }
        }
      }
    }();
  }
  switch (format) {
    case "table":
      return await tabbed(stats);
    case "json":
      return await json(stats);
  }
}

async function tabbed(stats: AsyncGenerator<ProjectStats, void>) {
  const table: { [id: string]: { region: string; [other: string]: unknown } } =
    {};
  const timeouts: { [id: string]: number } = {};
  const toDelete: string[] = [];
  const spinner = wait("Streaming...").start();
  let previousLength = 0;
  const renderStream = async function* () {
    // First render after 1 sec in case there's already data
    await delay(1_000);
    yield true;
    while (true) {
      await delay(5_000);
      yield true;
    }
  }();
  try {
    let next = stats.next();
    let render = renderStream.next();
    while (true) {
      const result = await Promise.race([next, render]);
      const stat = result.value;
      if (stat === undefined) {
        // Only stats stream can end, returning undefined
        spinner.succeed("Stream ended");
        return;
      }
      if (typeof stat === "object") {
        next = stats.next();
        const id = encodeHex(await sha256(stat.id + stat.region))
          .slice(0, 6);
        table[id] = {
          "region": stat.region,
          "Req/min": Math.ceil(stat.requestsPerMinute),
          "CPU%": parseFloat((stat.cpuTimePerSecond / 10).toFixed(2)),
          "CPU/req": parseFloat((stat.cpuTimePerRequest || 0).toFixed(2)),
          "RSS/5min": parseFloat(
            (stat.maxRss5Minutes / 1_000_000).toFixed(3),
          ),
          "Ingress/min": parseFloat(
            (stat.ingressBytesPerMinute / 1_000).toFixed(3),
          ),
          "Egress/min": parseFloat(
            (stat.egressBytesPerMinute / 1_000).toFixed(3),
          ),
          "KVr/min": Math.ceil(stat.kvReadUnitsPerMinute),
          "KVw/min": Math.ceil(stat.kvWriteUnitsPerMinute),
          "QSenq/min": Math.ceil(stat.enqueuePerMinute),
          "QSdeq/min": Math.ceil(stat.dequeuePerMinute),
        };

        clearTimeout(timeouts[id]);
        timeouts[id] = setTimeout(
          (idToDelete: string) => {
            toDelete.push(idToDelete);
          },
          30_000,
          id,
        );
      } else {
        render = renderStream.next();
        while (toDelete.length > 0) {
          const idToDelete = toDelete.pop();
          if (idToDelete) {
            delete table[idToDelete];
          }
        }
        const linesToClear = previousLength ? previousLength + 5 : 1;
        previousLength = Object.keys(table).length;
        tty.goUpSync(linesToClear, Deno.stdout);
        tty.clearDownSync(Deno.stdout);
        const entries = Object.entries(table);
        // Kinda sort the table
        entries.sort(([_aid, a], [_bid, b]) =>
          a.region.localeCompare(b.region)
        );
        if (Object.keys(table).length > 0) {
          console.table(Object.fromEntries(entries));
        }
        console.log();
      }
    }
  } catch (error) {
    spinner.fail(`Stream disconnected: ${error}`);
    Deno.exit(1);
  }
}

async function json(stats: AsyncGenerator<ProjectStats>) {
  for await (const stat of stats) {
    console.log(JSON.stringify(stat));
  }
}

type Format = "table" | "json";
