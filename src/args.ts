// Copyright 2021 Deno Land Inc. All rights reserved. MIT license.

import { parse } from "../deps.ts";

export function parseArgs(args: string[]) {
  const parsed = parse(args, {
    alias: {
      "help": "h",
      "version": "V",
      "project": "p",
    },
    boolean: [
      "help",
      "prod",
      "static",
      "version",
      "dry-run",
      "save-config",
    ],
    string: [
      "project",
      "token",
      "include",
      "exclude",
      "import-map",
      "deployment",
      "since",
      "until",
      "grep",
      "levels",
      "regions",
      "limit",
      "config",
    ],
    collect: ["grep"],
    default: {
      static: true,
      limit: "100",
      config: Deno.env.get("DEPLOYCTL_CONFIG_FILE"),
    },
  });
  return parsed;
}

export type Args = ReturnType<typeof parseArgs>;
