// Copyright 2021 Deno Land Inc. All rights reserved. MIT license.

import { Args } from "../args.ts";
import { API } from "../utils/api.ts";
import TokenProvisioner from "../utils/access_token.ts";
import { wait } from "../utils/spinner.ts";
import { delay, encodeHex, tty } from "../../deps.ts";
import { error } from "../error.ts";
import { ProjectStats } from "../utils/api_types.ts";
import { sha256 } from "../utils/hashing_encoding.ts";

type SortKey = "reqs" | "cpu%" | "cpureq" | "rss" | "kv" | "queues";

export default async function topSubcommand(args: Args) {
  if (!args.project) {
    error(
      "No project specified. Use --project to specify the project of which to stream the stats",
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
    stats = await api.stream_metering(args.project!);
  } catch (err) {
    spinner.fail(
      `Failed to connect to the stats stream of project '${args.project}': ${err.message}`,
    );
    return Deno.exit(1);
  }
  spinner.succeed(
    `Connected to the stats stream of project '${args.project}'`,
  );
  const format = args.format
    ? args.format
    : Deno.isatty(Deno.stdout.rid)
    ? "tabbed"
    : "json";
  switch (format) {
    case "tabbed":
      return await tabbed(stats);
    case "json":
      return await json(stats);
  }
}

async function tabbed(stats: AsyncGenerator<ProjectStats>) {
  const table: { [id: string]: unknown } = {};
  const timeouts: { [id: string]: number } = {};
  const toDelete: string[] = [];
  const spinner = wait("Streaming...").start();
  try {
    let next = stats.next();
    while (true) {
      const result = await Promise.race([next, delay(10_000)]);
      const previousLength = Object.keys(table).length;
      if (result) {
        next = stats.next();
        const stat = result.value;
        const id = encodeHex(await sha256(stat.id + stat.region))
          .slice(0, 6);
        table[id] = {
          "region": stat.region,
          "Req/min": Math.ceil(stat.requestsPerMinute),
          "CPU%": parseFloat((stat.cpuTimePerSecond / 10).toFixed(2)),
          "CPU(ms)/req": parseFloat((stat.cpuTimePerRequest || 0).toFixed(2)),
          "RSS(MB)/5min": parseFloat(
            (stat.maxRss5Minutes / 1_000_000).toFixed(3),
          ),
          "KV reads/min": Math.ceil(stat.kvReadUnitsPerMinute),
          "KV writes/min": Math.ceil(stat.kvWriteUnitsPerMinute),
          "QS enqueues/min": Math.ceil(stat.enqueuePerMinute),
          "QS dequeues/min": Math.ceil(stat.dequeuePerMinute),
        };

        clearTimeout(timeouts[id]);
        timeouts[id] = setTimeout(
          (idToDelete: string) => {
            toDelete.push(idToDelete);
          },
          30_000,
          id,
        );
      }

      while (toDelete.length > 0) {
        const idToDelete = toDelete.pop();
        if (idToDelete) {
          delete table[idToDelete];
        }
      }

      const linesToClear = previousLength ? previousLength + 5 : 1;
      tty.goUpSync(linesToClear, Deno.stdout);
      tty.clearDownSync(Deno.stdout);
      if (Object.keys(table).length > 0) {
        console.table(table);
      }
      console.log();
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
