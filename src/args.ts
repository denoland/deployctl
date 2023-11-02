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
    ],
    collect: ["grep"],
    default: {
      static: true,
      limit: "100",
    },
  });
  return parsed;
}

export type Args = ReturnType<typeof parseArgs>;
